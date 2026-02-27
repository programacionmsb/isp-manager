const router = require('express').Router();
const Cliente = require('../models/Cliente');
const Plan = require('../models/Plan');
const { Deuda, Caja } = require('../models/Pago');
const auth = require('../middlewares/auth');

// GET /api/reportes/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const [totalClientes, clientesActivos, deudas, ingresosMes, egresosMes, planes] = await Promise.all([
      Cliente.countDocuments(),
      Cliente.countDocuments({ estado: 'activo' }),
      Deuda.find({ estado: { $in: ['pendiente', 'vencido'] } }).populate('cliente', 'nombre telefono').populate('plan', 'nombre precio'),
      Caja.aggregate([
        { $match: { tipo: 'ingreso', fecha: { $gte: inicioMes, $lte: finMes } } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]),
      Caja.aggregate([
        { $match: { tipo: 'egreso', fecha: { $gte: inicioMes, $lte: finMes } } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]),
      Plan.find({ activo: true }),
    ]);

    // Clientes por plan
    const clientesPorPlan = await Cliente.aggregate([
      { $match: { estado: 'activo' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
    ]);

    res.json({
      totalClientes,
      clientesActivos,
      clientesInactivos: totalClientes - clientesActivos,
      deudas: {
        total: deudas.length,
        monto: deudas.reduce((a, d) => a + d.monto, 0),
        lista: deudas.slice(0, 10),
      },
      caja: {
        ingresos: ingresosMes[0]?.total || 0,
        egresos: egresosMes[0]?.total || 0,
        balance: (ingresosMes[0]?.total || 0) - (egresosMes[0]?.total || 0),
      },
      clientesPorPlan,
    });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/reportes/ingresos-mensuales
router.get('/ingresos-mensuales', auth, async (req, res) => {
  try {
    const datos = await Caja.aggregate([
      { $match: { tipo: 'ingreso' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
        total: { $sum: '$monto' },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);
    res.json(datos);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
