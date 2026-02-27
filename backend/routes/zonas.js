const router = require('express').Router();
const Zona = require('../models/Zona');
const auth = require('../middlewares/auth');

// GET /api/zonas
router.get('/', auth, async (req, res) => {
  try {
    const zonas = await Zona.find().sort({ nombre: 1 });
    res.json(zonas);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// POST /api/zonas
router.post('/', auth, async (req, res) => {
  try {
    const zona = await Zona.create({ nombre: req.body.nombre });
    res.status(201).json(zona);
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

// PUT /api/zonas/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const zona = await Zona.findByIdAndUpdate(req.params.id, { nombre: req.body.nombre }, { new: true });
    res.json(zona);
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

// DELETE /api/zonas/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Zona.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Zona eliminada' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
