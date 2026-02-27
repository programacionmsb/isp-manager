import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY = { nombre:'', velocidad:'', precio:'', tipo:'Fibra Óptica', descripcion:'' };

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const cargar = async () => {
    const r = await api.get('/planes');
    setPlanes(r.data);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    try {
      await api.post('/planes', form);
      setModal(false); setForm(EMPTY); cargar();
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
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nuevo Plan</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
        {planes.map(p => (
          <div key={p._id} className="card" style={{position:'relative', borderColor: p.precio >= 150 ? 'var(--accent)' : 'var(--border)'}}>
            {p.precio >= 150 && <span className="badge badge-info" style={{position:'absolute',top:'12px',right:'12px'}}>Premium</span>}
            <div style={{fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'4px'}}>{p.nombre}</div>
            <div style={{fontSize:'11px', color:'var(--text2)', marginBottom:'12px'}}>{p.tipo}</div>
            <div style={{fontFamily:'Syne,sans-serif', fontSize:'36px', fontWeight:800, color:'var(--accent)'}}>
              {p.velocidad}<span style={{fontSize:'16px', color:'var(--text2)', fontWeight:400}}> Mbps</span>
            </div>
            <div style={{fontFamily:'Syne,sans-serif', fontSize:'24px', fontWeight:700, margin:'8px 0'}}>
              S/ {p.precio}<span style={{fontSize:'13px', color:'var(--text2)', fontWeight:400}}>/mes</span>
            </div>
            {p.descripcion && <div style={{fontSize:'12px', color:'var(--text2)', marginBottom:'16px'}}>{p.descripcion}</div>}
            <button className="btn btn-danger btn-sm" onClick={() => eliminar(p._id)}>Desactivar</button>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Nuevo Plan</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input className="input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Plan Básico" />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select className="select" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                    <option>Fibra Óptica</option><option>Cable</option><option>Inalámbrico</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Velocidad (Mbps) *</label>
                  <input className="input" type="number" value={form.velocidad} onChange={e=>setForm({...form,velocidad:e.target.value})} placeholder="30" />
                </div>
                <div className="form-group">
                  <label>Precio mensual (S/) *</label>
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
              <button className="btn btn-primary" onClick={guardar}>Crear Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
