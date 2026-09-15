import React from 'react';
import { formatDate } from '../utils/formatDate';

export default function OperationsTimeline({ schedule = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {schedule.map((item, index) => (
        <div
          key={index}
          className="glass-panel"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: '4px solid var(--color-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              {item.berth_id}
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.vessel_name || item.vessel_id}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {item.action} • Terminal {item.terminal_id}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cranes</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {item.cranes} units
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Window</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {formatDate(item.start_time)} → {formatDate(item.end_time)}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                Duration: ~{item.duration_hours}h
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
