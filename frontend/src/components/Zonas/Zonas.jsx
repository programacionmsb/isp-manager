import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Zonas() {
  const [zonas, setZonas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    const r = await api.get('/zonas');
    setZonas(r.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirModal = (zona = null) => {
    setEditId(zona?._id || null);
    setNombre(zona?.nombre || '');
    setModal(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) return;
    try {
      if (editId) await api.put(`/zonas/${editId}`, { nombre });
      else        await api.post('/zonas', { nombre });
      setModal(false);
      cargar();
    } catch (err) { alert(err.response?.data?.msg || 'Error al guardar'); }
  };

  const eliminar = async id => {
    if (!confirm('¿Eliminar esta zona?')) return;
    await api.delete(`/zonas/${id}`);
    cargar();
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Zonas</div>
          <div className="page-sub">Gestiona las zonas de cobertura</div>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nueva Zona</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zonas.length === 0 ? (
              <tr>
                <td colSpan="3" style={{textAlign:'center', padding:'40px', color:'var(--text2)'}}>
                  No hay zonas registradas
                </td>
              </tr>
            ) : zonas.map((z, i) => (
              <tr key={z._id}>
                <td style={{color:'var(--text2)'}}>{i + 1}</td>
                <td style={{fontWeight: 500}}>{z.nombre}</td>
                <td style={{display:'flex', gap:'6px'}}>
                  <button className="btn btn-outline btn-sm" onClick={() => abrirModal(z)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminar(z._id)}>✕</button>
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
              <h2>{editId ? 'Editar Zona' : 'Nueva Zona'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  className="input"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: La Encantada"
                  onKeyDown={e => e.key === 'Enter' && guardar()}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>
                {editId ? 'Guardar Cambios' : 'Crear Zona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
