const mongoose = require('mongoose');

// Registro de deuda mensual generada automáticamente
const DeudaSchema = new mongoose.Schema({
  cliente:   { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  plan:      { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  mes:       { type: String, required: true },   // formato: "2026-02"
  monto:     { type: Number, required: true },
  estado:    { type: String, enum: ['pendiente', 'pagado', 'vencido'], default: 'pendiente' },
  fechaVencimiento: { type: Date },
  fechaPago: { type: Date },
  observacion: { type: String },
}, { timestamps: true });

// Movimiento de caja (cobros y gastos)
const CajaSchema = new mongoose.Schema({
  tipo:        { type: String, enum: ['ingreso', 'egreso'], required: true },
  concepto:    { type: String, required: true },
  monto:       { type: Number, required: true },
  cliente:     { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  deuda:       { type: mongoose.Schema.Types.ObjectId, ref: 'Deuda' },
  metodoPago:  { type: String, enum: ['efectivo', 'transferencia', 'yape', 'plin', 'otro'], default: 'efectivo' },
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fecha:       { type: Date, default: Date.now },
  notas:       { type: String },
}, { timestamps: true });

module.exports = {
  Deuda: mongoose.model('Deuda', DeudaSchema),
  Caja:  mongoose.model('Caja', CajaSchema),
};
