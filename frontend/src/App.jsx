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
import Zonas from './components/Zonas/Zonas';
import Usuarios from './components/Usuarios/Usuarios';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="loading">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" />;
  // Al recargar la página, redirigir siempre al Dashboard
  if (!sessionStorage.getItem('navegando')) {
    sessionStorage.setItem('navegando', '1');
    return <Navigate to="/" replace />;
  }
  return children;
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
            <Route path="zonas" element={<Zonas />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
