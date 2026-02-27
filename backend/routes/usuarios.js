const router = require('express').Router();
const Usuario = require('../models/Usuario');
const auth = require('../middlewares/auth');

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ msg: 'Acceso solo para administradores' });
  next();
};

// GET /api/usuarios
router.get('/', auth, soloAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password').sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// POST /api/usuarios
router.post('/', auth, soloAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (await Usuario.findOne({ email }))
      return res.status(400).json({ msg: 'El email ya está registrado' });
    const usuario = await Usuario.create({ nombre, email, password, rol });
    res.status(201).json({ id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

// PUT /api/usuarios/:id
router.put('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const { nombre, email, rol, activo, password } = req.body;
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    usuario.nombre = nombre ?? usuario.nombre;
    usuario.email  = email  ?? usuario.email;
    usuario.rol    = rol    ?? usuario.rol;
    if (activo !== undefined) usuario.activo = activo;
    if (password) usuario.password = password; // el pre-save hook hashea automáticamente

    await usuario.save();
    res.json({ id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
  } catch (err) { res.status(400).json({ msg: err.message }); }
});

// DELETE /api/usuarios/:id — desactiva, no elimina
router.delete('/:id', auth, soloAdmin, async (req, res) => {
  try {
    if (req.params.id === req.usuario.id)
      return res.status(400).json({ msg: 'No puedes desactivar tu propia cuenta' });
    await Usuario.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ msg: 'Usuario desactivado' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
