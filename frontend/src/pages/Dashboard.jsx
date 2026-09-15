import React, { useEffect, useState } from 'react';
import { 
  Ship, 
  AlertTriangle, 
  Activity, 
  Anchor, 
  Hammer, 
  Clock,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import CongestionCard from '../components/CongestionCard';
import { getVessels, getCongestion } from '../services/api';
import { formatDate } from '../utils/formatDate';
import { getStatusColor } from '../utils/statusHelper';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  Queued: '#f97316',
  Approaching: '#f59e0b',
  Scheduled: '#38bdf8',
  Berthed: '#10b981',
  Waiting: '#ef4444'
};

export default function Dashboard() {
  const [vessels, setVessels] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vData, cData] = await Promise.all([
        getVessels(),
        getCongestion()
      ]);
      setVessels(Array.isArray(vData) ? vData : []);
      setCongestion(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Unable to load live port operations data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating Port Statistics & Live Predictions..." />;

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', margin: '24px 0' }}>
        <AlertTriangle size={36} color="var(--status-critical)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Connection Error</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          <RefreshCw size={14} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Calculate live statistics
  const totalVessels = vessels.length;
  const highRiskVessels = vessels.filter(v => {
    const r = String(v.risk_level || v.priority || '').toUpperCase();
    return r === 'HIGH' || r === 'CRITICAL';
  }).length;

  const congestedTerminals = congestion.filter(c => {
    const lvl = String(c.congestion_level || '').toUpperCase();
    return lvl === 'HIGH' || lvl === 'CRITICAL';
  }).length;

  const availableBerths = congestion.reduce((acc, c) => acc + (Number(c.available_berths) || 0), 0);
  const availableCranes = congestion.reduce((acc, c) => acc + (Number(c.available_cranes) || 0), 0);

  // Chart 1: Congestion Probability by Terminal (%)
  const probabilityChartData = congestion.map(c => ({
    terminal: c.terminal_id,
    probability: Math.round((Number(c.probability) || 0.5) * 100),
    level: c.congestion_level || 'LOW'
  }));

  // Chart 2: Vessels by Status
  const statusCounts = vessels.reduce((acc, v) => {
    const st = v.status || 'Scheduled';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Chart 3: Expected Waiting Hours by Terminal
  const waitHoursChartData = congestion.map(c => ({
    terminal: c.terminal_id,
    waitHours: Number(c.predicted_wait_hours || c.expected_wait_hours || 2.0)
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Port Operations Command Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Predictive congestion forecasting, bottleneck mitigation, and vessel throughput monitoring.
          </p>
        </div>
        <button
          className="btn"
          onClick={loadData}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Live Feeds</span>
        </button>
      </div>

      {/* Top Key Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Total Vessels"
          value={totalVessels}
          subtitle="Monitored in port waters"
          icon={Ship}
          color="var(--color-primary)"
        />
        <StatCard
          title="High Risk Vessels"
          value={highRiskVessels}
          subtitle="Priority queue attention"
          icon={AlertTriangle}
          color="var(--status-critical)"
        />
        <StatCard
          title="Congested Terminals"
          value={congestedTerminals}
          subtitle="Exceeding safe threshold"
          icon={Activity}
          color="var(--status-high)"
        />
        <StatCard
          title="Available Berths"
          value={availableBerths}
          subtitle="Open docking berths"
          icon={Anchor}
          color="var(--status-low)"
        />
        <StatCard
          title="Active Cranes"
          value={availableCranes}
          subtitle="Deployable handling assets"
          icon={Hammer}
          color="#818cf8"
        />
      </div>

      {/* Problem & Congestion Hotspots Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--color-primary)" />
            Terminal Congestion Hotspots & Machine Learning Risk
          </h3>
          <Link to="/congestion" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            View Full Hotspot Analysis →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {congestion.map(c => (
            <CongestionCard key={c.terminal_id} terminal={c} />
          ))}
        </div>
      </div>

      {/* 3 Core Analytical Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Congestion Probability by Terminal */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--color-primary)" />
            Congestion Probability (%)
          </h4>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probabilityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="terminal" stroke="var(--text-secondary)" />
                <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: '#111e38', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="probability" name="Probability %" radius={[4, 4, 0, 0]}>
                  {probabilityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vessels by Status */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={16} color="var(--color-accent)" />
            Vessel Traffic Distribution by Status
          </h4>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111e38', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Expected Waiting Hours by Terminal */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#f59e0b" />
            Expected Turnaround Delay (Hours)
          </h4>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitHoursChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="terminal" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: '#111e38', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="waitHours" name="Wait (Hours)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Vessel Risk Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Priority Vessel Risk Monitor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Vessels with high container volumes and tight departure windows requiring proactive management.
            </p>
          </div>
          <Link to="/vessels" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            View All Vessels ({vessels.length}) →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vessel</th>
                <th>Terminal</th>
                <th>Containers</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {vessels.slice(0, 7).map(v => (
                <tr key={v.vessel_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{v.vessel_id}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.vessel_name}</div>
                  </td>
                  <td>
                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {v.current_terminal || 'T1'}
                    </span>
                  </td>
                  <td>{Number(v.container_count || 0).toLocaleString()} TEU</td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: v.priority === 'HIGH' ? 'var(--status-high)' : v.priority === 'MEDIUM' ? 'var(--status-med)' : 'var(--text-secondary)'
                    }}>
                      {v.priority || 'MEDIUM'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {v.status || 'Scheduled'}
                    </span>
                  </td>
                  <td>
                    <RiskBadge level={v.risk_level || (v.priority === 'HIGH' ? 'HIGH' : 'LOW')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
