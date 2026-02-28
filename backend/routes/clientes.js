const router = require('express').Router();
const Cliente = require('../models/Cliente');
const { Deuda } = require('../models/Pago');
const auth = require('../middlewares/auth');

// GET /api/clientes
router.get('/', auth, async (req, res) => {
  try {
    const { estado, search, servicio, tipoConexion } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (servicio) filter.servicio = servicio;
    if (tipoConexion) filter.tipoConexion = tipoConexion;
    if (search) filter.$or = [
      { nombre: new RegExp(search, 'i') },
      { telefono: new RegExp(search, 'i') },
      { dni: new RegExp(search, 'i') },
    ];
    const clientes = await Cliente.find(filter).populate('plan').populate('zona').sort({ createdAt: -1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PUT /api/clientes/bulk/dia-corte — actualizar día de corte a todos los clientes
router.put('/bulk/dia-corte', auth, async (req, res) => {
  try {
    const { diaCorte } = req.body;
    if (!diaCorte || diaCorte < 1 || diaCorte > 28)
      return res.status(400).json({ msg: 'El día debe estar entre 1 y 28' });
    const result = await Cliente.updateMany({}, { $set: { diaCorte: Number(diaCorte) } });
    res.json({ msg: `Día de corte actualizado a ${diaCorte} para ${result.modifiedCount} clientes` });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/clientes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).populate('plan').populate('zona');
    if (!cliente) return res.status(404).json({ msg: 'Cliente no encontrado' });
    const deudas = await Deuda.find({ cliente: cliente._id }).populate('plan').sort({ mes: -1 });
    res.json({ cliente, deudas });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST /api/clientes
router.post('/', auth, async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    await cliente.populate('plan');
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// PUT /api/clientes/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('plan').populate('zona');
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
