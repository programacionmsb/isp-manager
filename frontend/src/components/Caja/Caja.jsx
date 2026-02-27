import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Caja() {
  const [tab, setTab] = useState('deudas');
  const [deudas, setDeudas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [modalEgreso, setModalEgreso] = useState(false);
  const [egreso, setEgreso] = useState({ concepto:'', monto:'', metodoPago:'efectivo', notas:'' });

  const cargar = async () => {
    const [d, m] = await Promise.all([
      api.get('/caja/deudas', { params: filtroEstado ? { estado: filtroEstado } : {} }),
      api.get('/caja'),
    ]);
    setDeudas(d.data);
    setMovimientos(m.data);
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const cobrar = async (deuda) => {
    const metodo = prompt(`Cobrar S/ ${deuda.monto} a ${deuda.cliente?.nombre}\nMétodo: efectivo, transferencia, yape, plin`, 'efectivo');
    if (!metodo) return;
    await api.post(`/caja/cobrar/${deuda._id}`, { metodoPago: metodo });
    cargar();
  };

  const registrarEgreso = async () => {
    try {
      await api.post('/caja/egreso', egreso);
      setModalEgreso(false);
      setEgreso({ concepto:'', monto:'', metodoPago:'efectivo', notas:'' });
      cargar();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const totalDeudas = deudas.reduce((a, d) => a + d.monto, 0);
  const totalIngresos = movimientos.filter(m=>m.tipo==='ingreso').reduce((a,m)=>a+m.monto,0);
  const totalEgresos = movimientos.filter(m=>m.tipo==='egreso').reduce((a,m)=>a+m.monto,0);

  const deudaBadge = e => ({pagado:'badge-success',pendiente:'badge-warning',vencido:'badge-danger'}[e]||'badge-info');

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Caja</div>
          <div className="page-sub">Control de cobros y movimientos</div>
        </div>
        <button className="btn btn-danger" onClick={() => setModalEgreso(true)}>+ Registrar Egreso</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px'}}>
        <div className="stat-card"><div className="stat-label">Por Cobrar</div><div className="stat-value" style={{color:'var(--warning)'}}>S/ {totalDeudas.toLocaleString()}</div><div className="stat-sub">{deudas.length} deudas</div></div>
        <div className="stat-card"><div className="stat-label">Total Ingresos (hoy)</div><div className="stat-value" style={{color:'var(--success)'}}>S/ {totalIngresos.toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-label">Total Egresos (hoy)</div><div className="stat-value" style={{color:'var(--danger)'}}>S/ {totalEgresos.toLocaleString()}</div></div>
      </div>

      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        {['deudas','movimientos'].map(t => (
          <button key={t} className={`btn ${tab===t?'btn-primary':'btn-outline'}`} onClick={() => setTab(t)}>
            {t === 'deudas' ? '💳 Deudas' : '📋 Movimientos'}
          </button>
        ))}
      </div>

      {tab === 'deudas' && (
        <>
          <div style={{marginBottom:'12px'}}>
            <select className="select" style={{maxWidth:'180px'}} value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}>
              <option value="">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencido">Vencidas</option>
              <option value="pagado">Pagadas</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Teléfono</th><th>Plan</th><th>Mes</th><th>Monto</th><th>Vencimiento</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {deudas.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign:'center',padding:'40px',color:'var(--text2)'}}>Sin deudas en este estado ✅</td></tr>
                ) : deudas.map(d => (
                  <tr key={d._id}>
                    <td><strong>{d.cliente?.nombre}</strong></td>
                    <td style={{color:'var(--text2)'}}>{d.cliente?.telefono}</td>
                    <td>{d.plan?.nombre}</td>
                    <td>{d.mes}</td>
                    <td style={{fontWeight:600}}>S/ {d.monto}</td>
                    <td style={{fontSize:'11px', color: d.estado==='vencido'?'var(--danger)':'var(--text2)'}}>
                      {d.fechaVencimiento ? new Date(d.fechaVencimiento).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td><span className={`badge ${deudaBadge(d.estado)}`}>{d.estado}</span></td>
                    <td>
                      {d.estado !== 'pagado' && (
                        <button className="btn btn-success btn-sm" onClick={() => cobrar(d)}>✓ Cobrar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'movimientos' && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Concepto</th><th>Tipo</th><th>Monto</th><th>Método</th><th>Cliente</th><th>Fecha</th></tr></thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center',padding:'40px',color:'var(--text2)'}}>Sin movimientos hoy</td></tr>
              ) : movimientos.map(m => (
                <tr key={m._id}>
                  <td>{m.concepto}</td>
                  <td><span className={`badge ${m.tipo==='ingreso'?'badge-success':'badge-danger'}`}>{m.tipo}</span></td>
                  <td style={{fontWeight:600, color:m.tipo==='ingreso'?'var(--success)':'var(--danger)'}}>
                    {m.tipo==='ingreso'?'+':'-'} S/ {m.monto.toLocaleString()}
                  </td>
                  <td style={{color:'var(--text2)'}}>{m.metodoPago}</td>
                  <td>{m.cliente?.nombre || '—'}</td>
                  <td style={{fontSize:'11px',color:'var(--text2)'}}>{new Date(m.fecha).toLocaleString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalEgreso && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModalEgreso(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Registrar Egreso</h2>
              <button className="modal-close" onClick={() => setModalEgreso(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Concepto *</label>
                  <input className="input" value={egreso.concepto} onChange={e=>setEgreso({...egreso,concepto:e.target.value})} placeholder="Pago de servicio, mantenimiento..." />
                </div>
                <div className="form-group">
                  <label>Monto (S/) *</label>
                  <input className="input" type="number" value={egreso.monto} onChange={e=>setEgreso({...egreso,monto:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Método de Pago</label>
                  <select className="select" value={egreso.metodoPago} onChange={e=>setEgreso({...egreso,metodoPago:e.target.value})}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Notas</label>
                  <input className="input" value={egreso.notas} onChange={e=>setEgreso({...egreso,notas:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalEgreso(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={registrarEgreso}>Registrar Egreso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
