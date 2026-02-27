const Cliente = require('../models/Cliente');
const Plan = require('../models/Plan');
const { Deuda } = require('../models/Pago');

/**
 * Genera deudas mensuales automáticamente para clientes activos
 * cuyo diaCorte coincida con el día actual.
 * Llamado por el cron job diario.
 */
async function generarDeudas() {
  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const mes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

  // Clientes activos cuyo día de corte es hoy
  const clientes = await Cliente.find({
    estado: 'activo',
    diaCorte: diaHoy,
  }).populate('plan');

  let generados = 0;

  for (const cliente of clientes) {
    // Evitar duplicados: verificar que no exista ya la deuda de este mes
    const existe = await Deuda.findOne({ cliente: cliente._id, mes });
    if (existe) continue;

    // Calcular fecha de vencimiento (30 días desde hoy)
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    // Crear deuda
    const deuda = await Deuda.create({
      cliente:  cliente._id,
      plan:     cliente.plan._id,
      mes,
      monto:    cliente.plan.precio,
      estado:   'pendiente',
      fechaVencimiento,
    });

    // Sumar a deuda total del cliente
    await Cliente.findByIdAndUpdate(cliente._id, {
      $inc: { deudaTotal: cliente.plan.precio }
    });

    generados++;
  }

  // Marcar como vencidas las deudas pendientes con fecha expirada
  await Deuda.updateMany(
    { estado: 'pendiente', fechaVencimiento: { $lt: hoy } },
    { estado: 'vencido' }
  );

  console.log(`✅ Deudas generadas: ${generados} | Mes: ${mes}`);
  return { generados, mes };
}

module.exports = { generarDeudas };
