const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  rol:      { type: String, enum: ['admin', 'operador'], default: 'operador' },
  activo:   { type: Boolean, default: true },
}, { timestamps: true });

UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UsuarioSchema.methods.compararPassword = function(pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
