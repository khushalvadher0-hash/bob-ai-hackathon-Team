import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Anchor, 
  Hammer, 
  Layers, 
  RefreshCw, 
  Ship, 
  Cpu, 
  PackageCheck, 
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

import OperationsTimeline from '../components/OperationsTimeline';
import BerthSchedule from '../components/BerthSchedule';
import CraneAllocation from '../components/CraneAllocation';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { get72HourOperations, getBerthSchedule, getCraneAllocation } from '../services/api';

export default function Operations() {
  const [operations, setOperations] = useState(null);
  const [berths, setBerths] = useState([]);
  const [cranes, setCranes] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'berths', 'cranes'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOperationsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [opData, bData, cData] = await Promise.all([
        get72HourOperations(),
        getBerthSchedule(),
        getCraneAllocation()
      ]);

      setOperations(opData);
      setBerths(Array.isArray(bData) ? bData : []);
      setCranes(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error('Error fetching operations data:', err);
      setError('Unable to load operations schedule from the FastAPI server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Synthesizing 72-Hour Port Operations Schedule & Optimization Plan..." />;
  }

  // Calculate operational stats
  const schedule = operations?.schedule || [];
  const totalPlannedVessels = operations?.total_vessels_planned ?? schedule.length;
  const totalTEU = operations?.total_containers_handled ?? schedule.reduce((acc, curr) => acc + (curr.duration_hours ? curr.duration_hours * 70 : 1200), 0);
  const avgCranes = operations?.average_cranes_per_vessel ?? (
    schedule.length > 0
      ? (schedule.reduce((acc, curr) => acc + (curr.cranes || 2), 0) / schedule.length).toFixed(1)
      : 2.0
  );

  const activeBerthsCount = berths.filter(b => b.status === 'AVAILABLE').length;
  const operationalCranesCount = cranes.filter(c => c.status === 'OPERATIONAL' || c.status === 'ACTIVE').length;

  // Chart data: Vessels by Terminal in 72h horizon
  const terminalDistribution = schedule.reduce((acc, curr) => {
    const term = curr.terminal_id || 'T1';
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(terminalDistribution).map(([term, count]) => ({
    name: `Terminal ${term}`,
    vessels: count,
    terminal: term
  }));

  const BAR_COLORS = ['#38bdf8', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarClock size={26} color="var(--color-primary)" />
            72-Hour Port Operations Master Plan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Non-overlapping berth scheduling, quay crane dispatching, and turn-time optimization for shift supervisors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                padding: '7px 16px',
                border: 'none',
                background: activeTab === 'timeline' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeTab === 'timeline' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CalendarClock size={15} />
              Operations Timeline
            </button>
            <button
              onClick={() => setActiveTab('berths')}
              style={{
                padding: '7px 16px',
                border: 'none',
                background: activeTab === 'berths' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeTab === 'berths' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Anchor size={15} />
              Berth Schedule
            </button>
            <button
              onClick={() => setActiveTab('cranes')}
              style={{
                padding: '7px 16px',
                border: 'none',
                background: activeTab === 'cranes' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeTab === 'cranes' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Cpu size={15} />
              Crane Allocation
            </button>
          </div>

          {/* Refresh Button */}
          <button
            className="btn btn-primary"
            onClick={() => fetchOperationsData(true)}
            disabled={refreshing}
            style={{ fontSize: '0.85rem', opacity: refreshing ? 0.7 : 1 }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            Sync Operations
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            borderLeft: '4px solid var(--status-critical)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertCircle size={20} color="var(--status-critical)" />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{error}</p>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <StatCard
          title="Planning Horizon"
          value={`${operations?.planning_horizon_hours || 72} hrs`}
          subtitle="Rolling deterministic window"
          icon={CalendarClock}
          color="var(--color-primary)"
        />

        <StatCard
          title="Planned Vessels"
          value={`${totalPlannedVessels} Ships`}
          subtitle="Conflict-free berth slots"
          icon={Ship}
          color="var(--color-accent)"
        />

        <StatCard
          title="Forecasted TEU"
          value={Number(totalTEU).toLocaleString()}
          subtitle="Turnaround throughput"
          icon={PackageCheck}
          color="var(--status-low)"
        />

        <StatCard
          title="Active Berths"
          value={`${activeBerthsCount} / ${berths.length || 6}`}
          subtitle="Docking capacity ready"
          icon={Anchor}
          color="var(--status-med)"
        />

        <StatCard
          title="Crane Fleet"
          value={`${operationalCranesCount} / ${cranes.length || 14}`}
          subtitle={`Avg ${avgCranes} cranes/vessel`}
          icon={Cpu}
          color="var(--color-primary)"
        />
      </div>

      {/* Lightweight Operational Distribution Chart */}
      {chartData.length > 0 && activeTab === 'timeline' && (
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <BarChart2 size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              72-Hour Shift Vessel Allocation by Terminal
            </h3>
          </div>
          <div style={{ width: '100%', height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111e38',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
                <Bar dataKey="vessels" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'timeline' && (
        <OperationsTimeline schedule={schedule} />
      )}

      {activeTab === 'berths' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Berth Inventory & Availability</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time terminal quay length, draft limits, and assigned vessels from the optimizer.
            </p>
          </div>
          <BerthSchedule berths={berths} schedule={schedule} />
        </div>
      )}

      {activeTab === 'cranes' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Quay Crane Allocation & Status</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Dynamic gantry crane asset distribution, operating capacities, and active vessel bindings.
            </p>
          </div>
          <CraneAllocation cranes={cranes} schedule={schedule} />
        </div>
      )}
    </div>
  );
}

