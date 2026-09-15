import React from 'react';
import RiskBadge from './RiskBadge';
import { getStatusColor } from '../utils/statusHelper';
import { Activity, Anchor, Hammer, Clock } from 'lucide-react';

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

  const lvl = String(congestion_level || 'LOW').toUpperCase();
  const isCrit = lvl === 'CRITICAL' || lvl === 'HIGH';

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '18px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px',
        borderTop: `4px solid ${isCrit ? 'var(--status-critical)' : lvl === 'MEDIUM' ? 'var(--status-med)' : 'var(--status-low)'}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 700, 
            color: 'var(--color-primary)', 
            letterSpacing: '0.04em' 
          }}>
            TERMINAL {terminal_id}
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {terminal_name}
          </h3>
        </div>
        <RiskBadge level={congestion_level} />
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delay Probability</p>
          <p style={{ 
            fontSize: '1.2rem', 
            fontWeight: 700, 
            color: isCrit ? 'var(--status-critical-text)' : 'var(--text-primary)' 
          }}>
            {Math.round((probability || 0.5) * 100)}%
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Turnaround Wait</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ~{predicted_wait_hours || 2.0} hrs
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          Active Vessels: <strong style={{ color: 'var(--text-primary)' }}>{vessel_count}</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Open Berths: <strong style={{ color: 'var(--text-primary)' }}>{available_berths}</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Container Volume: <strong style={{ color: 'var(--text-primary)' }}>{container_count?.toLocaleString()} TEU</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Quay Cranes: <strong style={{ color: 'var(--text-primary)' }}>{available_cranes}</strong>
        </div>
      </div>
    </div>
  );
}
