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
            <th>Current Terminal</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vessels.map((v) => (
            <tr key={v.vessel_id}>
              <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{v.vessel_id}</td>
              <td style={{ fontWeight: 500 }}>{v.vessel_name}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{formatDate(v.arrival_time)}</td>
              <td>{v.container_count?.toLocaleString()} TEU</td>
              <td>
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: v.priority === 'HIGH' ? 'var(--status-high)' : v.priority === 'MEDIUM' ? 'var(--status-med)' : 'var(--text-secondary)'
                }}>
                  {v.priority}
                </span>
              </td>
              <td>
                <span style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {v.current_terminal}
                </span>
              </td>
              <td>
                <RiskBadge level={v.risk_level || 'LOW'} />
              </td>
              <td>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {v.status}
                </span>
              </td>
              <td>
                {onSelectVessel && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => onSelectVessel(v.vessel_id)}
                  >
                    Analyze
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
