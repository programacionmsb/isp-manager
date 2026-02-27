import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Clientes from './components/Clientes/Clientes';
import ClienteDetalle from './components/Clientes/ClienteDetalle';
import Planes from './components/Planes/Planes';
import Caja from './components/Caja/Caja';
import Reportes from './components/Reportes/Reportes';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="loading">Cargando...</div>;
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/:id" element={<ClienteDetalle />} />
            <Route path="planes" element={<Planes />} />
            <Route path="caja" element={<Caja />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
