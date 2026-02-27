const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  velocidad:   { type: Number, required: true },   // Mbps
  precio:      { type: Number, required: true },   // S/. por mes (o por año si periodo=anual)
  periodo:     { type: String, enum: ['mensual', 'anual'], default: 'mensual' },
  servicio:    { type: String, enum: ['Internet', 'Cable', 'Internet y Cable'], default: 'Internet' },
  tipo:        { type: String, enum: ['Fibra Óptica', 'Cable', 'Inalámbrico', 'Varios'], default: 'Fibra Óptica' },
  descripcion: { type: String },
  activo:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
