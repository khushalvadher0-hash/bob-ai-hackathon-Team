import React from 'react';
import { formatDate } from '../utils/formatDate';
import { Clock, Hammer, Anchor, ShieldCheck } from 'lucide-react';

export default function OperationsTimeline({ schedule = [] }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.85rem' }}>No vessel operations scheduled in the current 72-hour planning window.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {schedule.map((item, index) => (
        <div
          key={index}
          className="glass-panel"
          style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderLeft: '4px solid var(--color-primary)'
          }}
        >
          {/* Left: Berth & Vessel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #bae6fd'
            }}>
              {item.berth_id}
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.vessel_name || item.vessel_id}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {item.action || 'Discharge & Load Cargo'} • Terminal {item.terminal_id}
              </p>
            </div>
          </div>

          {/* Right: Cranes & Operating Window */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Quay Cranes
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {item.cranes || 2} units
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Operational Window
              </p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formatDate(item.start_time)} → {formatDate(item.end_time)}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--status-low-text)', fontWeight: 600 }}>
                Duration: ~{item.duration_hours}h
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
