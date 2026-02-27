import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EMPTY = { nombre:'', dni:'', telefono:'', email:'', servicio:'Internet', tipoConexion:'Fibra Óptica', zona:'', direccion:'', plan:'', estado:'activo', diaCorte:1, notas:'' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [servicio, setServicio] = useState('');
  const [tipoConexion, setTipoConexion] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    const params = {};
    if (search) params.search = search;
    if (estado) params.estado = estado;
    if (servicio) params.servicio = servicio;
    if (tipoConexion) params.tipoConexion = tipoConexion;
    const [c, p, z] = await Promise.all([api.get('/clientes', { params }), api.get('/planes'), api.get('/zonas')]);
    setClientes(c.data); setPlanes(p.data); setZonas(z.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [search, estado, servicio, tipoConexion]);

  const abrirModal = (cliente = null) => {
    if (cliente) {
      setForm({ ...cliente, plan: cliente.plan?._id || cliente.plan, zona: cliente.zona?._id || cliente.zona || '', servicio: cliente.servicio || 'Internet' });
      setEditId(cliente._id);
    } else {
      setForm(EMPTY); setEditId(null);
    }
    setModal(true);
  };

  const guardar = async () => {
    try {
      if (editId) await api.put(`/clientes/${editId}`, form);
      else await api.post('/clientes', form);
      setModal(false); cargar();
    } catch (err) { alert(err.response?.data?.msg || 'Error al guardar'); }
  };

  const eliminar = async id => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/clientes/${id}`);
    cargar();
  };

  const estadoBadge = e => {
    const map = { activo:'badge-success', inactivo:'badge-danger', suspendido:'badge-warning' };
    return map[e] || 'badge-info';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-sub">Gestiona todos tus clientes de internet</div>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Cliente</button>
      </div>

      <div className="filtros-wrap" style={{display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap'}}>
        <input className="input" placeholder="🔍 Buscar por nombre, DNI, teléfono..." value={search}
          onChange={e => setSearch(e.target.value)} style={{maxWidth:'300px'}} />
        <select className="select" style={{maxWidth:'180px'}} value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="suspendido">Suspendido</option>
        </select>
        <select className="select" style={{maxWidth:'200px'}} value={servicio} onChange={e => setServicio(e.target.value)}>
          <option value="">Todos los servicios</option>
          <option value="Internet">Internet</option>
          <option value="Cable">Cable</option>
          <option value="Internet y Cable">Internet y Cable</option>
        </select>
        <select className="select" style={{maxWidth:'200px'}} value={tipoConexion} onChange={e => setTipoConexion(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="Fibra Óptica">Fibra Óptica</option>
          <option value="Inalámbrico">Inalámbrico</option>
          <option value="UTP">UTP</option>
          <option value="Varios">Varios</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Nombre</th><th>Teléfono</th><th>Zona</th><th>Servicio</th><th>Conexión</th><th>Plan</th><th>Día Corte</th><th>Deuda</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr><td colSpan="11" style={{textAlign:'center', padding:'40px', color:'var(--text2)'}}>No hay clientes</td></tr>
            ) : clientes.map((c, i) => (
              <tr key={c._id}>
                <td style={{color:'var(--text2)'}}>{i+1}</td>
                <td>
                  <strong style={{cursor:'pointer', color:'var(--accent)'}} onClick={() => navigate(`/clientes/${c._id}`)}>
                    {c.nombre}
                  </strong>
                  <div style={{fontSize:'11px', color:'var(--text2)'}}>{c.email || '—'}</div>
                </td>
                <td>{c.telefono}</td>
                <td>{c.zona?.nombre || <span style={{color:'var(--text2)'}}>—</span>}</td>
                <td>{c.servicio || <span style={{color:'var(--text2)'}}>—</span>}</td>
                <td>{c.tipoConexion || <span style={{color:'var(--text2)'}}>—</span>}</td>
                <td>{c.plan?.nombre || '—'}</td>
                <td style={{textAlign:'center'}}>Día {c.diaCorte}</td>
                <td style={{color: c.deudaTotal > 0 ? 'var(--warning)' : 'var(--success)', fontWeight:600}}>
                  S/ {c.deudaTotal?.toLocaleString() || 0}
                </td>
                <td><span className={`badge ${estadoBadge(c.estado)}`}>{c.estado}</span></td>
                <td style={{display:'flex', gap:'6px'}}>
                  <button className="btn btn-outline btn-sm" onClick={() => abrirModal(c)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminar(c._id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input className="input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Juan Pérez" />
                </div>
                <div className="form-group">
                  <label>DNI / RUC</label>
                  <input className="input" value={form.dni} onChange={e=>setForm({...form,dni:e.target.value})} placeholder="12345678" />
                </div>
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input className="input" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="999 888 777" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="correo@mail.com" />
                </div>
                <div className="form-group">
                  <label>Servicio</label>
                  <select className="select" value={form.servicio} onChange={e=>setForm({...form,servicio:e.target.value})}>
                    <option>Internet</option>
                    <option>Cable</option>
                    <option>Internet y Cable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Conexión</label>
                  <select className="select" value={form.tipoConexion} onChange={e=>setForm({...form,tipoConexion:e.target.value})}>
                    <option>Fibra Óptica</option>
                    <option>Inalámbrico</option>
                    <option>UTP</option>
                    <option>Varios</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Zona</label>
                  <select className="select" value={form.zona} onChange={e=>setForm({...form,zona:e.target.value})}>
                    <option value="">Sin zona</option>
                    {zonas.map(z => <option key={z._id} value={z._id}>{z.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input className="input" value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} placeholder="Jr. Los Rosales 123" />
                </div>
                <div className="form-group">
                  <label>Plan *</label>
                  <select className="select" value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})}>
                    <option value="">Seleccionar plan</option>
                    {planes.map(p => <option key={p._id} value={p._id}>{p.nombre} — S/{p.precio}/mes ({p.velocidad}Mbps)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Día de Corte (1-28)</label>
                  <input className="input" type="number" min="1" max="28" value={form.diaCorte} onChange={e=>setForm({...form,diaCorte:parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="select" value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Notas</label>
                  <input className="input" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} placeholder="Observaciones..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
