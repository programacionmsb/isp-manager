const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Rutas
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/planes',   require('./routes/planes'));
app.use('/api/caja',     require('./routes/caja'));
app.use('/api/reportes', require('./routes/reportes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');
    const { seedUsuarios } = require('./scripts/seed');
    await seedUsuarios();
    iniciarCronJobs();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Servidor en puerto ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('❌ Error MongoDB:', err); process.exit(1); });

// CRON JOB — Genera deudas automáticamente cada día a las 00:01
function iniciarCronJobs() {
  cron.schedule('1 0 * * *', async () => {
    try {
      const { generarDeudas } = require('./utils/generarDeudas');
      await generarDeudas();
      console.log('🔄 Deudas generadas automáticamente:', new Date().toLocaleDateString());
    } catch (err) {
      console.error('Error en cron de deudas:', err);
    }
  });
  console.log('⏰ Cron jobs iniciados');
}
