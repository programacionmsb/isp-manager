import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import api from '../../services/api';

export default function Reportes() {
  const [dashboard, setDashboard] = useState(null);
  const [ingresos, setIngresos] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/reportes/dashboard'),
      api.get('/reportes/ingresos-mensuales'),
    ]).then(([r1, r2]) => {
      setDashboard(r1.data);
      setIngresos(r2.data.map(d => ({ mes: d._id, total: d.total, count: d.count })));
    });
  }, []);

  if (!dashboard) return <div className="loading">Cargando reportes...</div>;

  const totalAnual = ingresos.reduce((a, d) => a + d.total, 0);
  const promedioMes = ingresos.length ? Math.round(totalAnual / ingresos.length) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Reportes</div>
          <div className="page-sub">Análisis y estadísticas del negocio</div>
        </div>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="stat-card">
          <div className="stat-label">Ingresos Anuales</div>
          <div className="stat-value" style={{color:'var(--success)', fontSize:'22px'}}>S/ {totalAnual.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Promedio Mensual</div>
          <div className="stat-value" style={{color:'var(--accent)', fontSize:'22px'}}>S/ {promedioMes.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clientes Activos</div>
          <div className="stat-value" style={{color:'var(--success)', fontSize:'22px'}}>{dashboard.clientesActivos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasa Retención</div>
          <div className="stat-value" style={{color:'var(--accent2)', fontSize:'22px'}}>
            {dashboard.totalClientes ? Math.round((dashboard.clientesActivos/dashboard.totalClientes)*100) : 0}%
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px', marginBottom:'24px'}}>
        <div className="card">
          <div className="table-title" style={{marginBottom:'16px'}}>Ingresos por Mes</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ingresos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{fontSize:10, fill:'#94a3b8'}} />
              <YAxis tick={{fontSize:10, fill:'#94a3b8'}} />
              <Tooltip
                contentStyle={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'12px'}}
                formatter={v => [`S/ ${v.toLocaleString()}`, 'Ingresos']}
              />
              <Bar dataKey="total" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="table-title" style={{marginBottom:'16px'}}>Clientes por Plan</div>
          {dashboard.clientesPorPlan.map((item, i) => {
            const pct = dashboard.clientesActivos ? Math.round((item.count/dashboard.clientesActivos)*100) : 0;
            const colors = ['var(--accent)', 'var(--accent2)', 'var(--success)', 'var(--warning)'];
            return (
              <div key={i} style={{marginBottom:'14px'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px'}}>
                  <span>{item.plan?.nombre}</span>
                  <span style={{color:'var(--text2)'}}>{item.count} clientes ({pct}%)</span>
                </div>
                <div style={{background:'var(--bg3)', borderRadius:'4px', height:'8px', overflow:'hidden'}}>
                  <div style={{width:`${pct}%`, height:'100%', background:colors[i%colors.length], borderRadius:'4px', transition:'width 0.5s'}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="table-title" style={{marginBottom:'16px'}}>Evolución de Cobros (cantidad)</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={ingresos}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{fontSize:10, fill:'#94a3b8'}} />
            <YAxis tick={{fontSize:10, fill:'#94a3b8'}} />
            <Tooltip contentStyle={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'12px'}} />
            <Line type="monotone" dataKey="count" stroke="var(--accent2)" strokeWidth={2} dot={{fill:'var(--accent2)'}} name="Cobros" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
