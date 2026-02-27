const mongoose = require('mongoose');

const ZonaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Zona', ZonaSchema);
