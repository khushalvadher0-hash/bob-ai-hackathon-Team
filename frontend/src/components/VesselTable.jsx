import React from 'react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatDate';

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
              <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{v.vessel_id}</td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.vessel_name}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(v.arrival_time)}</td>
              <td style={{ fontSize: '0.8rem' }}>{v.container_count?.toLocaleString()} TEU</td>
              <td>
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: v.priority === 'HIGH' ? 'var(--status-high-text)' : v.priority === 'MEDIUM' ? 'var(--status-med-text)' : 'var(--text-secondary)'
                }}>
                  {v.priority}
                </span>
              </td>
              <td>
                <span style={{
                  backgroundColor: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  {v.current_terminal}
                </span>
              </td>
              <td>
                <RiskBadge level={v.risk_level || 'LOW'} />
              </td>
              <td>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {v.status}
                </span>
              </td>
              <td>
                {onSelectVessel && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
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
