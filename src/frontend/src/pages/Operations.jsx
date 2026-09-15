import React, { useState, useEffect } from 'react';
import { CalendarClock, Anchor, Hammer, Layers } from 'lucide-react';
import OperationsTimeline from '../components/OperationsTimeline';
import BerthSchedule from '../components/BerthSchedule';
import LoadingSpinner from '../components/LoadingSpinner';
import { getOperations72h, getBerths, getCranes } from '../services/api';

export default function Operations() {
  const [operations, setOperations] = useState(null);
  const [berths, setBerths] = useState([]);
  const [cranes, setCranes] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOperations72h(), getBerths(), getCranes()])
      .then(([opData, bData, cData]) => {
        setOperations(opData);
        setBerths(bData);
        setCranes(cData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Synthesizing 72-Hour Operational Schedule..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={24} color="var(--color-primary)" />
            72-Hour Port Operations Schedule
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Greedy non-overlapping berth allocation, crane dispatch, and turnaround forecasting for shift supervisors.
          </p>
        </div>

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
              padding: '6px 14px',
              border: 'none',
              background: activeTab === 'timeline' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'timeline' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Vessel Operations Timeline
          </button>
          <button
            onClick={() => setActiveTab('berths')}
            style={{
              padding: '6px 14px',
              border: 'none',
              background: activeTab === 'berths' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'berths' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
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
              background: activeTab === 'cranes' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'cranes' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Crane Deployment
          </button>
        </div>
      </div>

      {/* Horizon Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horizon</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {operations?.planning_horizon_hours || 72} Hours
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Vessels Planned</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {operations?.total_vessels_planned || 0} Ships
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TEU Throughput Forecast</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-low)' }}>
            {operations?.total_containers_handled?.toLocaleString() || 0}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg. Cranes / Vessel</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-med)' }}>
            {operations?.average_cranes_per_vessel || 0}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <OperationsTimeline schedule={operations?.schedule || []} />
      )}

      {activeTab === 'berths' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <BerthSchedule berths={berths} />
        </div>
      )}

      {activeTab === 'cranes' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Crane ID</th>
                <th>Berth Assignment</th>
                <th>Terminal</th>
                <th>Handling Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cranes.map(cr => (
                <tr key={cr.crane_id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{cr.crane_id}</td>
                  <td>{cr.berth_id}</td>
                  <td>{cr.terminal_id}</td>
                  <td>{cr.capacity_teu_per_hour} TEU / hr</td>
                  <td>
                    <span className="badge badge-low">{cr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
