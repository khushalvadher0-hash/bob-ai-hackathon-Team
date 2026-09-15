import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Anchor, 
  Hammer, 
  Layers, 
  RefreshCw, 
  Ship, 
  PackageCheck, 
  AlertCircle,
  BarChart2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import OperationsTimeline from '../components/OperationsTimeline';
import BerthSchedule from '../components/BerthSchedule';
import Plan72HourTable from '../components/Plan72HourTable';
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
      setError('Unable to load operations schedule from the backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Synthesizing 72-Hour Port Operations Schedule & Resource Allocations..." />;
  }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <CalendarClock size={22} color="var(--color-primary)" />
            72-Hour Port Operations Master Plan
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            Greedy non-overlapping berth scheduling, quay crane dispatch, and turnaround duration forecasting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                padding: '6px 14px',
                border: 'none',
                backgroundColor: activeTab === 'timeline' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'timeline' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Operations Timeline
            </button>
            <button
              onClick={() => setActiveTab('berths')}
              style={{
                padding: '6px 14px',
                border: 'none',
                backgroundColor: activeTab === 'berths' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'berths' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Berth Inventory
            </button>
            <button
              onClick={() => setActiveTab('cranes')}
              style={{
                padding: '6px 14px',
                border: 'none',
                backgroundColor: activeTab === 'cranes' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'cranes' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Crane Deployments
            </button>
          </div>

          <button
            className="btn"
            onClick={() => fetchOperationsData(true)}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>Recalculate 72h Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Horizon Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <StatCard
          title="Planning Horizon"
          value={`${operations?.planning_horizon_hours || 72}h`}
          subtitle="Non-overlapping scheduling window"
          icon={Clock}
          color="var(--color-primary)"
        />
        <StatCard
          title="Total Scheduled Vessels"
          value={totalPlannedVessels}
          subtitle="Berth & crane slots allocated"
          icon={Ship}
          color="var(--status-low)"
        />
        <StatCard
          title="TEU Throughput Forecast"
          value={totalTEU.toLocaleString()}
          subtitle="Total container cargo handling"
          icon={PackageCheck}
          color="#6366f1"
        />
        <StatCard
          title="Avg Cranes / Vessel"
          value={avgCranes}
          subtitle="35 TEU/hr standard productivity"
          icon={Hammer}
          color="var(--status-med)"
        />
      </div>

      {/* Simple 72-Hour Operations Plan with Live API Trigger */}
      <Plan72HourTable />

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <OperationsTimeline schedule={schedule} />
      )}

      {activeTab === 'berths' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <BerthSchedule berths={berths} schedule={schedule} />
        </div>
      )}

      {activeTab === 'cranes' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Port Quay Crane Assets & Status
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crane ID</th>
                  <th>Assigned Berth</th>
                  <th>Terminal</th>
                  <th>Handling Standard</th>
                  <th>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {cranes.map(cr => (
                  <tr key={cr.crane_id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{cr.crane_id}</td>
                    <td>{cr.berth_id}</td>
                    <td>Terminal {cr.terminal_id}</td>
                    <td>{cr.capacity_teu_per_hour || 35} TEU / hr</td>
                    <td>
                      <span className="badge badge-low">{cr.status || 'OPERATIONAL'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
