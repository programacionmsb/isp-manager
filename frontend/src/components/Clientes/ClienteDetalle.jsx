import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const mesActual = () => new Date().toISOString().slice(0, 7);

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [modalDeuda, setModalDeuda] = useState(false);
  const [formDeuda, setFormDeuda] = useState({ monto: '', mes: mesActual(), concepto: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const r = await api.get(`/clientes/${id}`);
    setData(r.data);
  };

  useEffect(() => { cargar(); }, [id]);

  const cobrar = async deudaId => {
    const metodo = prompt('Método de pago: efectivo, transferencia, yape, plin', 'efectivo');
    if (!metodo) return;
    await api.post(`/caja/cobrar/${deudaId}`, { metodoPago: metodo });
    cargar();
  };

  const abrirModalDeuda = () => {
    setFormDeuda({ monto: data?.cliente?.plan?.precio || '', mes: mesActual(), concepto: '' });
    setModalDeuda(true);
  };

  const agregarDeuda = async e => {
    e.preventDefault();
    if (!formDeuda.monto || isNaN(formDeuda.monto)) return;
    setGuardando(true);
    try {
      await api.post('/caja/deuda-manual', {
        clienteId: id,
        monto: Number(formDeuda.monto),
        mes: formDeuda.mes,
        concepto: formDeuda.concepto,
      });
      setModalDeuda(false);
      cargar();
    } finally {
      setGuardando(false);
    }
  };

  if (!data) return <div className="loading">Cargando...</div>;
  const { cliente, deudas } = data;

  const estadoBadge = e => ({activo:'badge-success',inactivo:'badge-danger',suspendido:'badge-warning'}[e]||'badge-info');
  const deudaBadge  = e => ({pagado:'badge-success',pendiente:'badge-warning',vencido:'badge-danger'}[e]||'badge-info');

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/clientes')} style={{marginBottom:'8px'}}>← Volver</button>
          <div className="page-title">{cliente.nombre}</div>
          <div className="page-sub">{cliente.email} · {cliente.telefono}</div>
        </div>
        <span className={`badge ${estadoBadge(cliente.estado)}`} style={{fontSize:'13px', padding:'6px 14px'}}>{cliente.estado}</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:'20px', marginBottom:'24px'}}>
        <div className="card">
          <div className="table-title" style={{marginBottom:'16px'}}>Información</div>
          {[
            ['Plan', cliente.plan?.nombre],
            ['Velocidad', `${cliente.plan?.velocidad} Mbps`],
            ['Precio mensual', `S/ ${cliente.plan?.precio}`],
            ['Día de corte', `Día ${cliente.diaCorte} de cada mes`],
            ['Dirección', cliente.direccion || '—'],
            ['DNI / RUC', cliente.dni || '—'],
            ['Notas', cliente.notas || '—'],
          ].map(([k,v]) => (
            <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'12px'}}>
              <span style={{color:'var(--text2)'}}>{k}</span>
              <span style={{fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px'}}>
            <div className="stat-card">
              <div className="stat-label">Deuda Total</div>
              <div className="stat-value" style={{color: cliente.deudaTotal>0 ? 'var(--warning)':'var(--success)'}}>
                S/ {cliente.deudaTotal?.toLocaleString() || 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Pagos</div>
              <div className="stat-value" style={{color:'var(--accent)'}}>
                {deudas.filter(d=>d.estado==='pagado').length}
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <div className="table-header">
              <span className="table-title">Historial de Deudas</span>
              <button className="btn btn-primary btn-sm" onClick={abrirModalDeuda}>+ Agregar Deuda</button>
            </div>
            <table>
              <thead><tr><th>Mes</th><th>Monto</th><th>Vencimiento</th><th>Pagado</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {deudas.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign:'center',padding:'32px',color:'var(--text2)'}}>Sin deudas registradas</td></tr>
                ) : deudas.map(d => (
                  <tr key={d._id}>
                    <td>{d.mes}</td>
                    <td style={{fontWeight:600}}>S/ {d.monto}</td>
                    <td style={{fontSize:'11px', color:'var(--text2)'}}>
                      {d.fechaVencimiento ? new Date(d.fechaVencimiento).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td style={{fontSize:'11px', color:'var(--text2)'}}>
                      {d.fechaPago ? new Date(d.fechaPago).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td><span className={`badge ${deudaBadge(d.estado)}`}>{d.estado}</span></td>
                    <td>
                      {d.estado !== 'pagado' && (
                        <button className="btn btn-success btn-sm" onClick={() => cobrar(d._id)}>✓ Cobrar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalDeuda && (
        <div className="modal-overlay" onClick={() => setModalDeuda(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Agregar Deuda Pendiente</span>
              <button className="modal-close" onClick={() => setModalDeuda(false)}>×</button>
            </div>
            <form onSubmit={agregarDeuda}>
              <div className="form-group">
                <label className="form-label">Monto (S/)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ej: 50.00"
                  value={formDeuda.monto}
                  onChange={e => setFormDeuda(f => ({ ...f, monto: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mes</label>
                <input
                  className="form-input"
                  type="month"
                  value={formDeuda.mes}
                  onChange={e => setFormDeuda(f => ({ ...f, mes: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Concepto (opcional)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ej: Deuda anterior, recargo, etc."
                  value={formDeuda.concepto}
                  onChange={e => setFormDeuda(f => ({ ...f, concepto: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalDeuda(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Agregar Deuda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
