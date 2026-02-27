import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reportes/dashboard'),
      api.get('/reportes/ingresos-mensuales'),
    ]).then(([r1, r2]) => {
      setData(r1.data);
      setIngresos(r2.data.map(d => ({ mes: d._id, total: d.total })));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando dashboard...</div>;
  if (!data) return null;

  const hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub" style={{textTransform:'capitalize'}}>{hoy}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Clientes</div>
          <div className="stat-value" style={{color:'var(--accent)'}}>{data.totalClientes}</div>
          <div className="stat-sub">{data.clientesActivos} activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Deudas Pendientes</div>
          <div className="stat-value" style={{color:'var(--warning)'}}>{data.deudas.total}</div>
          <div className="stat-sub">S/ {data.deudas.monto.toLocaleString()} por cobrar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ingresos del Mes</div>
          <div className="stat-value" style={{color:'var(--success)'}}>S/ {data.caja.ingresos.toLocaleString()}</div>
          <div className="stat-sub">Balance: S/ {data.caja.balance.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Egresos del Mes</div>
          <div className="stat-value" style={{color:'var(--danger)'}}>S/ {data.caja.egresos.toLocaleString()}</div>
          <div className="stat-sub">Este mes</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px', marginBottom:'24px'}}>
        <div className="card">
          <div className="table-title" style={{marginBottom:'16px'}}>Ingresos Mensuales</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ingresos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{fontSize:11, fill:'#94a3b8'}} />
              <YAxis tick={{fontSize:11, fill:'#94a3b8'}} />
              <Tooltip
                contentStyle={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'12px'}}
                formatter={v => [`S/ ${v.toLocaleString()}`, 'Ingresos']}
              />
              <Bar dataKey="total" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="table-title" style={{marginBottom:'16px'}}>Clientes por Estado</div>
          <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'8px'}}>
            {[
              {label:'Activos', val:data.clientesActivos, color:'var(--success)'},
              {label:'Inactivos', val:data.clientesInactivos, color:'var(--danger)'},
            ].map(item => (
              <div key={item.label}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px'}}>
                  <span>{item.label}</span><strong>{item.val}</strong>
                </div>
                <div style={{background:'var(--bg3)', borderRadius:'4px', height:'8px', overflow:'hidden'}}>
                  <div style={{
                    width: data.totalClientes ? `${(item.val/data.totalClientes)*100}%` : '0%',
                    height:'100%', background:item.color, borderRadius:'4px', transition:'width 0.5s'
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">⚠️ Deudas Pendientes</span>
          <span className="badge badge-warning">{data.deudas.total} deudas</span>
        </div>
        <table>
          <thead><tr><th>Cliente</th><th>Teléfono</th><th>Plan</th><th>Mes</th><th>Monto</th><th>Estado</th></tr></thead>
          <tbody>
            {data.deudas.lista.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'var(--text2)'}}>✅ Sin deudas pendientes</td></tr>
            ) : data.deudas.lista.map(d => (
              <tr key={d._id}>
                <td><strong>{d.cliente?.nombre}</strong></td>
                <td style={{color:'var(--text2)'}}>{d.cliente?.telefono}</td>
                <td>{d.plan?.nombre}</td>
                <td>{d.mes}</td>
                <td style={{fontWeight:600}}>S/ {d.monto}</td>
                <td><span className={`badge ${d.estado==='vencido'?'badge-danger':'badge-warning'}`}>{d.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
