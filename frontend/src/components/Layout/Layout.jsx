import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const navItems = [
  { to: '/',         icon: '◈', label: 'Dashboard',  end: true },
  { to: '/clientes', icon: '👥', label: 'Clientes' },
  { to: '/planes',   icon: '📦', label: 'Planes' },
  { to: '/caja',     icon: '💳', label: 'Caja' },
  { to: '/reportes', icon: '📊', label: 'Reportes' },
  { to: '/zonas',    icon: '📍', label: 'Zonas' },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📡</div>
          <div className="logo-text">
            <h1>ISP MANAGER</h1>
            <p>Sistema de Administración</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Principal</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{usuario?.nombre?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{usuario?.nombre}</div>
              <div className="user-rol">{usuario?.rol}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-inner fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
