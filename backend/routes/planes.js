const router = require('express').Router();
const Plan = require('../models/Plan');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    const planes = await Plan.find({ activo: true }).sort({ precio: 1 });
    res.json(planes);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Plan.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ msg: 'Plan desactivado' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
