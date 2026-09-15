import React, { useEffect, useState } from 'react';
import { 
  Ship, 
  AlertTriangle, 
  Activity, 
  Anchor, 
  Hammer, 
  TrendingUp 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels, getCongestion, getOperations72h } from '../services/api';
import { formatDate } from '../utils/formatDate';

export default function Dashboard() {
  const [vessels, setVessels] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [operations, setOperations] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, cData, opData] = await Promise.all([
        getVessels(),
        getCongestion(),
        getOperations72h()
      ]);
      setVessels(vData);
      setCongestion(cData);
      setOperations(opData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating Port Statistics & Forecasts..." />;

  const highRiskCount = vessels.filter(v => v.risk_level === 'HIGH' || v.priority === 'HIGH').length;
  const congestedTerminalsCount = congestion.filter(c => c.congestion_level === 'HIGH' || c.congestion_level === 'CRITICAL').length;
  const availableBerthsCount = congestion.reduce((acc, c) => acc + (c.available_berths || 0), 0);
  const availableCranesCount = congestion.reduce((acc, c) => acc + (c.available_cranes || 0), 0);

  const chartData = congestion.map(c => ({
    name: c.terminal_id,
    vessels: c.vessel_count,
    containers: Math.round(c.container_count / 100),
    waitHours: c.predicted_wait_hours
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Total Vessels"
          value={vessels.length}
          subtitle="Monitored in system"
          icon={Ship}
          color="var(--color-primary)"
        />
        <StatCard
          title="High-Risk Vessels"
          value={highRiskCount}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color="var(--status-high)"
        />
        <StatCard
          title="Congested Terminals"
          value={congestedTerminalsCount}
          subtitle="Exceeding threshold"
          icon={Activity}
          color="var(--status-critical)"
        />
        <StatCard
          title="Available Berths"
          value={availableBerthsCount}
          subtitle="Ready for docking"
          icon={Anchor}
          color="var(--status-low)"
        />
        <StatCard
          title="Active Cranes"
          value={availableCranesCount}
          subtitle="Deployable capacity"
          icon={Hammer}
          color="#818cf8"
        />
      </div>

      {/* Main Grid: Congestion Forecast & Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Terminal Congestion Status */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--color-primary)" />
            Terminal Congestion & ML Risk Level
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Terminal</th>
                <th>Vessels</th>
                <th>Risk Level</th>
                <th>Probability</th>
                <th>Expected Wait</th>
              </tr>
            </thead>
            <tbody>
              {congestion.map(c => (
                <tr key={c.terminal_id}>
                  <td style={{ fontWeight: 600 }}>{c.terminal_id} - {c.terminal_name}</td>
                  <td>{c.vessel_count}</td>
                  <td><RiskBadge level={c.congestion_level} /></td>
                  <td style={{ fontWeight: 600 }}>{Math.round((c.probability || 0.5) * 100)}%</td>
                  <td>~{c.predicted_wait_hours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart View */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--color-primary)" />
            Wait Times by Terminal (Hours)
          </h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: '#111e38', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="waitHours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Bottom Grid: Vessel Risk & Upcoming Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Priority Vessel Risk List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
            Critical Vessels Requiring Attention
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vessels.slice(0, 5).map(v => (
              <div key={v.vessel_id} style={{
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v.vessel_name} ({v.vessel_id})</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    ETA: {formatDate(v.arrival_time)} • {v.container_count} TEU
                  </p>
                </div>
                <RiskBadge level={v.risk_level || v.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* 72h Operations Summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
            Next 72-Hour Scheduled Operations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(operations?.schedule || []).slice(0, 5).map((op, idx) => (
              <div key={idx} style={{
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {op.vessel_name} → <span style={{ color: 'var(--color-primary)' }}>{op.berth_id}</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {formatDate(op.start_time)} ({op.cranes} Cranes)
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--status-low)', fontWeight: 600 }}>
                  ~{op.duration_hours}h Turnaround
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
