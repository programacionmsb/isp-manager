const Usuario = require('../models/Usuario');

const CUENTAS_PREDEFINIDAS = [
  {
    nombre: 'Administrador',
    email: 'admin@isp.local',
    password: 'Admin123!',
    rol: 'admin',
  },
  {
    nombre: 'Operador',
    email: 'operador@isp.local',
    password: 'Operador123!',
    rol: 'operador',
  },
];

async function seedUsuarios() {
  for (const cuenta of CUENTAS_PREDEFINIDAS) {
    const existe = await Usuario.findOne({ email: cuenta.email });
    if (!existe) {
      await Usuario.create(cuenta);
      console.log(`✅ Cuenta creada: ${cuenta.email} (${cuenta.rol})`);
    }
  }
}

module.exports = { seedUsuarios };
