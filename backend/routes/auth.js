const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const auth = require('../middlewares/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (await Usuario.findOne({ email }))
      return res.status(400).json({ msg: 'Email ya registrado' });
    const usuario = await Usuario.create({ nombre, email, password, rol });
    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, usuario: { id: usuario._id, nombre, email, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email, activo: true });
    if (!usuario || !(await usuario.compararPassword(password)))
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
