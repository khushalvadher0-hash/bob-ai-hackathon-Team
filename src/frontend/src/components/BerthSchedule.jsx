import React from 'react';
import { formatDate } from '../utils/formatDate';

export default function BerthSchedule({ berths = [] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Berth ID</th>
            <th>Terminal</th>
            <th>Max Size</th>
            <th>Capacity</th>
            <th>Cranes</th>
            <th>Available From</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {berths.map((b) => (
            <tr key={b.berth_id}>
              <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.berth_id}</td>
              <td>{b.terminal_name} ({b.terminal_id})</td>
              <td>{b.max_vessel_size}</td>
              <td>{b.capacity?.toLocaleString()} TEU</td>
              <td>{b.crane_count} Cranes</td>
              <td style={{ color: 'var(--text-secondary)' }}>{formatDate(b.available_from)}</td>
              <td>
                <span className={`badge ${b.status === 'AVAILABLE' ? 'badge-low' : 'badge-high'}`}>
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
