const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre:        { type: String, required: true },
  dni:           { type: String },
  telefono:      { type: String, required: true },
  email:         { type: String },
  servicio:      { type: String, enum: ['Internet', 'Cable', 'Internet y Cable'], default: 'Internet' },
  tipoConexion:  { type: String, enum: ['Fibra Óptica', 'Inalámbrico', 'UTP', 'Varios'], default: 'Fibra Óptica' },
  zona:          { type: mongoose.Schema.Types.ObjectId, ref: 'Zona' },
  direccion:     { type: String },
  plan:          { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  estado:        { type: String, enum: ['activo', 'inactivo', 'suspendido'], default: 'activo' },
  diaCorte:      { type: Number, default: 1, min: 1, max: 28 }, // día del mes que se genera deuda
  deudaTotal:    { type: Number, default: 0 },
  notas:         { type: String },
  fechaIngreso:  { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);
