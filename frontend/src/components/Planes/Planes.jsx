import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY = { nombre:'', velocidad:'', precio:'', tipo:'Fibra Óptica', periodo:'mensual', descripcion:'' };

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const cargar = async () => {
    const r = await api.get('/planes');
    setPlanes(r.data);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (plan = null) => {
    if (plan) {
      setForm({ nombre: plan.nombre, velocidad: plan.velocidad, precio: plan.precio, tipo: plan.tipo, periodo: plan.periodo || 'mensual', descripcion: plan.descripcion || '' });
      setEditId(plan._id);
    } else {
      setForm(EMPTY);
      setEditId(null);
    }
    setModal(true);
  };

  const guardar = async () => {
    try {
      if (editId) await api.put(`/planes/${editId}`, form);
      else        await api.post('/planes', form);
      setModal(false); setForm(EMPTY); setEditId(null); cargar();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const eliminar = async id => {
    if (!confirm('¿Desactivar este plan?')) return;
    await api.delete(`/planes/${id}`);
    cargar();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Planes de Servicio</div>
          <div className="page-sub">Gestiona los planes disponibles para tus clientes</div>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Plan</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
        {planes.map(p => (
          <div key={p._id} className="card" style={{position:'relative', borderColor: p.precio >= 150 ? 'var(--accent)' : 'var(--border)'}}>
            {p.precio >= 150 && <span className="badge badge-info" style={{position:'absolute',top:'12px',right:'12px'}}>Premium</span>}
            <div style={{fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'4px'}}>{p.nombre}</div>
            <div style={{fontSize:'11px', color:'var(--text2)', marginBottom:'8px'}}>{p.tipo}</div>
            <div style={{marginBottom:'12px'}}>
              <span className={`badge ${p.periodo === 'anual' ? 'badge-info' : 'badge-success'}`} style={{fontSize:'10px'}}>
                {p.periodo === 'anual' ? 'Anual' : 'Mensual'}
              </span>
            </div>
            <div style={{fontFamily:'Syne,sans-serif', fontSize:'36px', fontWeight:800, color:'var(--accent)'}}>
              {p.velocidad}<span style={{fontSize:'16px', color:'var(--text2)', fontWeight:400}}> Mbps</span>
            </div>
            <div style={{fontFamily:'Syne,sans-serif', fontSize:'24px', fontWeight:700, margin:'8px 0'}}>
              S/ {p.precio}<span style={{fontSize:'13px', color:'var(--text2)', fontWeight:400}}>/{p.periodo === 'anual' ? 'año' : 'mes'}</span>
            </div>
            {p.descripcion && <div style={{fontSize:'12px', color:'var(--text2)', marginBottom:'16px'}}>{p.descripcion}</div>}
            <div style={{display:'flex', gap:'8px'}}>
              <button className="btn btn-outline btn-sm" onClick={() => abrirModal(p)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(p._id)}>Desactivar</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>{editId ? 'Editar Plan' : 'Nuevo Plan'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input className="input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Plan Básico" />
                </div>
                <div className="form-group">
                  <label>Tipo de Conexión</label>
                  <select className="select" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                    <option>Fibra Óptica</option>
                    <option>Cable</option>
                    <option>Inalámbrico</option>
                    <option>Varios</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Periodo</label>
                  <select className="select" value={form.periodo} onChange={e=>setForm({...form,periodo:e.target.value})}>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Velocidad (Mbps) *</label>
                  <input className="input" type="number" value={form.velocidad} onChange={e=>setForm({...form,velocidad:e.target.value})} placeholder="30" />
                </div>
                <div className="form-group">
                  <label>Precio {form.periodo === 'anual' ? 'anual' : 'mensual'} (S/) *</label>
                  <input className="input" type="number" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} placeholder="100" />
                </div>
                <div className="form-group full">
                  <label>Descripción</label>
                  <input className="input" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} placeholder="Ideal para hogares..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>{editId ? 'Guardar Cambios' : 'Crear Plan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
