# 📡 ISP Manager — Sistema de Administración de Clientes

Sistema profesional y escalable para gestionar clientes de internet, construido con **React + Vite** (frontend) y **Node.js + Express + MongoDB** (backend).

---

## 🚀 Características

- ✅ **Clientes** — Registro completo con día de corte personalizable
- ✅ **Planes** — Crea y gestiona planes de internet con velocidad y precio
- ✅ **Caja** — Cobros (yape, plin, transferencia, efectivo), egresos y movimientos
- ✅ **Deuda automática** — Cron job que genera deuda mensual automáticamente según el día de corte de cada cliente
- ✅ **Reportes** — Ingresos mensuales, clientes por plan, tasa de retención
- ✅ **Autenticación** — Login seguro con JWT
- ✅ **Roles** — Admin y Operador

---

## 🗂️ Estructura del Proyecto

```
isp-manager/
├── backend/
│   ├── controllers/
│   ├── middlewares/       # auth JWT
│   ├── models/            # Usuario, Cliente, Plan, Pago, Deuda
│   ├── routes/            # auth, clientes, planes, caja, reportes
│   ├── utils/
│   │   └── generarDeudas.js  # Lógica del cron job
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/          # Login
    │   │   ├── Layout/        # Sidebar + navegación
    │   │   ├── Dashboard/
    │   │   ├── Clientes/      # Lista + Detalle con historial
    │   │   ├── Planes/
    │   │   ├── Caja/          # Deudas + movimientos
    │   │   └── Reportes/
    │   ├── context/           # AuthContext
    │   ├── services/          # axios api.js
    │   ├── App.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Instalación Local

### 1. Clona el repositorio
```bash
git clone https://github.com/tu-usuario/isp-manager.git
cd isp-manager
```

### 2. Configura el Backend
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu URI de MongoDB
npm run dev
```

### 3. Configura el Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Crea el primer usuario admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Admin","email":"admin@empresa.com","password":"123456","rol":"admin"}'
```

---

## 🌐 Deploy en Render

### Backend (Web Service)
| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Variables de entorno | MONGODB_URI, JWT_SECRET, FRONTEND_URL |

### Frontend (Static Site)
| Campo | Valor |
|-------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Variable de entorno | `VITE_API_URL=https://tu-backend.onrender.com/api` |

---

## ⏰ Cron Job — Generación Automática de Deudas

El sistema genera deudas automáticamente **cada día a las 00:01**:

- Busca todos los clientes activos cuyo `diaCorte` coincida con el día actual
- Crea una deuda del monto del plan para el mes en curso
- Suma el monto a `deudaTotal` del cliente
- Marca como **vencidas** las deudas pendientes con fecha expirada

**Ejemplo:** Si un cliente tiene `diaCorte = 5`, el día 5 de cada mes se genera automáticamente su deuda mensual.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, Vite, React Router, Recharts, Axios |
| Backend | Node.js, Express, Mongoose |
| Base de datos | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Tareas automáticas | node-cron |
| Deploy | Render.com |
