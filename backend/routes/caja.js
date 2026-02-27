const router = require('express').Router();
const { Deuda, Caja } = require('../models/Pago');
const Cliente = require('../models/Cliente');
const auth = require('../middlewares/auth');

// GET /api/caja — movimientos de caja
router.get('/', auth, async (req, res) => {
  try {
    const { fecha, tipo } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (fecha) {
      const inicio = new Date(fecha); inicio.setHours(0,0,0,0);
      const fin = new Date(fecha); fin.setHours(23,59,59,999);
      filter.fecha = { $gte: inicio, $lte: fin };
    }
    const movimientos = await Caja.find(filter)
      .populate('cliente', 'nombre')
      .populate('registradoPor', 'nombre')
      .sort({ fecha: -1 });
    res.json(movimientos);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/caja/deudas — deudas pendientes
router.get('/deudas', auth, async (req, res) => {
  try {
    const { estado, clienteId } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (clienteId) filter.cliente = clienteId;
    const deudas = await Deuda.find(filter)
      .populate('cliente', 'nombre telefono direccion')
      .populate('plan', 'nombre precio')
      .sort({ fechaVencimiento: 1 });
    res.json(deudas);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// POST /api/caja/cobrar/:deudaId — cobrar una deuda
router.post('/cobrar/:deudaId', auth, async (req, res) => {
  try {
    const deuda = await Deuda.findById(req.params.deudaId).populate('cliente plan');
    if (!deuda) return res.status(404).json({ msg: 'Deuda no encontrada' });

    const { metodoPago, notas } = req.body;

    // Actualizar deuda
    deuda.estado = 'pagado';
    deuda.fechaPago = new Date();
    deuda.observacion = notas;
    await deuda.save();

    // Reducir deuda total del cliente
    await Cliente.findByIdAndUpdate(deuda.cliente._id, {
      $inc: { deudaTotal: -deuda.monto }
    });

    // Registrar en caja
    const movimiento = await Caja.create({
      tipo: 'ingreso',
      concepto: `Cobro mensualidad ${deuda.mes} — ${deuda.cliente.nombre}`,
      monto: deuda.monto,
      cliente: deuda.cliente._id,
      deuda: deuda._id,
      metodoPago: metodoPago || 'efectivo',
      registradoPor: req.usuario.id,
      notas,
    });

    res.json({ msg: 'Pago registrado', movimiento, deuda });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// POST /api/caja/egreso — registrar gasto
router.post('/egreso', auth, async (req, res) => {
  try {
    const movimiento = await Caja.create({
      tipo: 'egreso',
      registradoPor: req.usuario.id,
      ...req.body,
    });
    res.status(201).json(movimiento);
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

// POST /api/caja/deuda-manual — generar deuda manual a cliente
router.post('/deuda-manual', auth, async (req, res) => {
  try {
    const { clienteId, monto, mes, concepto } = req.body;
    const cliente = await Cliente.findById(clienteId).populate('plan');
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });

    const deuda = await Deuda.create({
      cliente: clienteId,
      plan: cliente.plan._id,
      mes: mes || new Date().toISOString().slice(0, 7),
      monto: monto || cliente.plan.precio,
      observacion: concepto,
    });

    await Cliente.findByIdAndUpdate(clienteId, { $inc: { deudaTotal: deuda.monto } });
    res.status(201).json(deuda);
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

module.exports = router;
