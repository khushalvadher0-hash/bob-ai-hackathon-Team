import React from 'react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatDate';

function PriorityBadge({ priority }) {
  const p = String(priority || '').toUpperCase();
  if (p === 'HIGH') return <span className="badge-priority-high">HIGH</span>;
  if (p === 'MEDIUM') return <span className="badge-priority-medium">MED</span>;
  return <span className="badge-priority-low">{p || 'LOW'}</span>;
}

export default function VesselTable({ vessels = [], onSelectVessel }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Vessel ID</th>
            <th>Name</th>
            <th>ETA</th>
            <th>Containers</th>
            <th>Priority</th>
            <th>Terminal</th>
            <th>Risk Level</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vessels.map((v) => (
            <tr key={v.vessel_id}>
              <td style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                {v.vessel_id}
              </td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vessel_name}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{formatDate(v.arrival_time)}</td>
              <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{v.container_count?.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.72rem' }}>TEU</span></td>
              <td>
                <PriorityBadge priority={v.priority} />
              </td>
              <td>
                <span className="terminal-chip">
                  {v.current_terminal}
                </span>
              </td>
              <td>
                <RiskBadge level={v.risk_level || 'LOW'} />
              </td>
              <td>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {v.status}
                </span>
              </td>
              <td>
                {onSelectVessel && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '3px 9px', fontSize: '0.7rem' }}
                    onClick={() => onSelectVessel(v.vessel_id)}
                  >
                    Analyze Route
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
