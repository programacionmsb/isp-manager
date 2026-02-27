const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  velocidad:   { type: Number, required: true },   // Mbps
  precio:      { type: Number, required: true },   // S/. por mes
  tipo:        { type: String, enum: ['Fibra Óptica', 'Cable', 'Inalámbrico'], default: 'Fibra Óptica' },
  descripcion: { type: String },
  activo:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
