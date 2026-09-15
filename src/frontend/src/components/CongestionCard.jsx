import React from 'react';
import RiskBadge from './RiskBadge';
import { getStatusColor } from '../utils/statusHelper';

export default function CongestionCard({ terminal }) {
  const {
    terminal_id,
    terminal_name,
    vessel_count,
    container_count,
    available_berths,
    available_cranes,
    congestion_level,
    probability,
    predicted_wait_hours
  } = terminal;

  const statusColor = getStatusColor(congestion_level);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
            {terminal_id}
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {terminal_name}
          </h3>
        </div>
        <RiskBadge level={congestion_level} />
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Congestion Probability</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: statusColor }}>
            {Math.round((probability || 0.5) * 100)}%
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Wait Time</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ~{predicted_wait_hours || 2.0} hrs
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          Active Vessels: <strong style={{ color: 'var(--text-primary)' }}>{vessel_count}</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Available Berths: <strong style={{ color: 'var(--text-primary)' }}>{available_berths}</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Total TEU Load: <strong style={{ color: 'var(--text-primary)' }}>{container_count?.toLocaleString()}</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Operational Cranes: <strong style={{ color: 'var(--text-primary)' }}>{available_cranes}</strong>
        </div>
      </div>
    </div>
  );
}
