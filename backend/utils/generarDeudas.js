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
    const esAnual = cliente.plan.periodo === 'anual';

    if (esAnual) {
      // Planes anuales: solo generar una deuda por año
      const anioActual = String(hoy.getFullYear());
      const existeAnual = await Deuda.findOne({
        cliente: cliente._id,
        mes: new RegExp(`^${anioActual}-`),
      });
      if (existeAnual) continue;
    } else {
      // Planes mensuales: evitar duplicado del mes actual
      const existe = await Deuda.findOne({ cliente: cliente._id, mes });
      if (existe) continue;
    }

    // Fecha de vencimiento: 30 días para mensual, 365 para anual
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + (esAnual ? 365 : 30));

    const deuda = await Deuda.create({
      cliente:  cliente._id,
      plan:     cliente.plan._id,
      mes,
      monto:    cliente.plan.precio,
      estado:   'pendiente',
      fechaVencimiento,
      observacion: esAnual ? 'Pago anual' : undefined,
    });

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
