import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const EMPTY = { nombre: '', email: '', password: '', rol: 'operador' };

const rolBadge = rol => rol === 'admin' ? 'badge-info' : 'badge-success';

export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    const r = await api.get('/usuarios');
    setUsuarios(r.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (u = null) => {
    if (u) {
      setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
      setEditId(u._id);
    } else {
      setForm(EMPTY);
      setEditId(null);
    }
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.email) return alert('Nombre y email son obligatorios');
    if (!editId && !form.password) return alert('La contraseña es obligatoria');
    try {
      const payload = { nombre: form.nombre, email: form.email, rol: form.rol };
      if (form.password) payload.password = form.password;
      if (editId) await api.put(`/usuarios/${editId}`, payload);
      else        await api.post('/usuarios', { ...payload, password: form.password });
      setModal(false);
      cargar();
    } catch (err) { alert(err.response?.data?.msg || 'Error al guardar'); }
  };

  const toggleActivo = async (u) => {
    if (u._id === yo?.id) return alert('No puedes desactivar tu propia cuenta');
    const accion = u.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${u.nombre}?`)) return;
    await api.put(`/usuarios/${u._id}`, { activo: !u.activo });
    cargar();
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Usuarios</div>
          <div className="page-sub">Gestiona las cuentas y privilegios del sistema</div>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Usuario</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'var(--text2)'}}>No hay usuarios</td></tr>
            ) : usuarios.map((u, i) => (
              <tr key={u._id}>
                <td style={{color:'var(--text2)'}}>{i + 1}</td>
                <td>
                  <strong>{u.nombre}</strong>
                  {u._id === yo?.id && <span style={{fontSize:'10px', color:'var(--text2)', marginLeft:'6px'}}>(tú)</span>}
                </td>
                <td style={{color:'var(--text2)'}}>{u.email}</td>
                <td><span className={`badge ${rolBadge(u.rol)}`}>{u.rol}</span></td>
                <td>
                  <span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{display:'flex', gap:'6px'}}>
                  <button className="btn btn-outline btn-sm" onClick={() => abrirModal(u)}>Editar</button>
                  {u._id !== yo?.id && (
                    <button
                      className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleActivo(u)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input className="input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Juan Pérez" />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select className="select" value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}>
                    <option value="operador">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Email *</label>
                  <input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="correo@isp.local" />
                </div>
                <div className="form-group full">
                  <label>{editId ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                  <input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>{editId ? 'Guardar Cambios' : 'Crear Usuario'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
