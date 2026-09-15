import React from 'react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatDate';
import { cleanValue } from '../utils/cleanValue';
import { Ship, Clock } from 'lucide-react';

function PriorityBadge({ priority }) {
  const p = String(priority || '').toUpperCase();
  if (p === 'HIGH') return <span className="badge-priority-high">HIGH</span>;
  if (p === 'MEDIUM') return <span className="badge-priority-medium">MED</span>;
  return <span className="badge-priority-low">{p || 'LOW'}</span>;
}

export default function VesselTable({ vessels = [], onSelectVessel }) {
  if (!vessels || vessels.length === 0) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.875rem' }}>No vessels available</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Vessel Name</th>
            <th>Arrival Time</th>
            <th>Size / TEU</th>
            <th>Priority & Risk</th>
            <th>Status</th>
            {onSelectVessel && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {vessels.map((v, idx) => {
            const rawName = v.vessel_name || v.name || v.vessel_id || 'Vessel';
            const vesselName = cleanValue(rawName);
            const vId = cleanValue(v.vessel_id || `VSL-${idx + 1}`);
            const terminal = cleanValue(v.current_terminal || v.terminal_id || 'T1');
            const rawSize = v.vessel_size || (v.container_count > 1800 ? 'Ultra Large (ULCV)' : v.container_count > 1200 ? 'Neo-Panamax' : 'Feeder');
            const vesselSize = cleanValue(rawSize);
            const status = cleanValue(v.status || 'Scheduled');
            const teuCount = Number(v.container_count || v.teu || 0);

            return (
              <tr key={v.vessel_id || vesselName || idx}>
                {/* Vessel Name */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: 'rgba(2, 132, 199, 0.12)',
                      color: 'var(--color-primary)',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Ship size={16} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>
                        {vesselName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {vId} • Terminal {terminal}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Arrival Time */}
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} style={{ color: 'var(--color-primary)', opacity: 0.8, flexShrink: 0 }} />
                    <span>{cleanValue(formatDate(v.arrival_time))}</span>
                  </div>
                </td>

                {/* Size / Capacity */}
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem', display: 'block' }}>
                    {vesselSize}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {teuCount.toLocaleString()} TEU
                  </span>
                </td>

                {/* Priority & Risk */}
                <td>
                  <RiskBadge level={cleanValue(v.risk_level || v.priority || 'LOW')} />
                </td>

                {/* Status */}
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: status.toUpperCase() === 'QUEUED' ? 'rgba(249, 115, 22, 0.12)' : status.toUpperCase() === 'APPROACHING' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    color: status.toUpperCase() === 'QUEUED' ? 'var(--status-high)' : status.toUpperCase() === 'APPROACHING' ? 'var(--color-primary)' : 'var(--status-low)'
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                    {status}
                  </span>
                </td>

                {/* Action button if handler supplied */}
                {onSelectVessel && (
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => onSelectVessel(v.vessel_id || vId)}
                    >
                      Route →
                    </button>
                  </td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
