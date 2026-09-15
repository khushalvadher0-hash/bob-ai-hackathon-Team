import React from 'react';
import { cleanText } from '../utils/cleanText';

// Task 6: Clean Badges with proper structure and dot indicators (Task 3)
function renderBadge(level) {
  const p = cleanText(level || 'LOW').toUpperCase();

  if (p === 'HIGH' || p === 'CRITICAL') {
    return (
      <span 
        className="bg-red-500 text-white px-2 py-1 rounded inline-flex items-center gap-1"
        style={{ 
          backgroundColor: '#ef4444', 
          color: '#ffffff', 
          padding: '3px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span style={{ fontSize: '0.65rem' }}>●</span>
        <span>HIGH</span>
      </span>
    );
  }

  if (p === 'MEDIUM' || p === 'MED') {
    return (
      <span 
        className="bg-yellow-400 text-black px-2 py-1 rounded inline-flex items-center gap-1"
        style={{ 
          backgroundColor: '#facc15', 
          color: '#000000', 
          padding: '3px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span style={{ fontSize: '0.65rem' }}>●</span>
        <span>MEDIUM</span>
      </span>
    );
  }

  return (
    <span 
      className="bg-green-500 text-white px-2 py-1 rounded inline-flex items-center gap-1"
      style={{ 
        backgroundColor: '#22c55e', 
        color: '#ffffff', 
        padding: '3px 8px', 
        borderRadius: '4px', 
        fontSize: '0.75rem', 
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <span style={{ fontSize: '0.65rem' }}>●</span>
      <span>LOW</span>
    </span>
  );
}

// Task 5: Safe date formatting using new Date(arrival_time).toLocaleString()
function formatArrivalTime(timeStr) {
  if (!timeStr) return '-';
  try {
    const cleaned = cleanText(timeStr);
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
    return cleaned;
  } catch {
    return cleanText(timeStr);
  }
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
            {/* Task 4: Clean columns - NO stray icon columns */}
            <th>Vessel Name</th>
            <th>Arrival Time</th>
            <th>Size / TEU</th>
            <th>Priority</th>
            <th>Status</th>
            {onSelectVessel && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {vessels.map((v, idx) => {
            const rawName = v.vessel_name || v.name || v.vessel_id || 'Vessel';
            const vesselName = cleanText(rawName);
            const vId = cleanText(v.vessel_id || `VSL-${idx + 1}`);
            const terminal = cleanText(v.current_terminal || v.terminal_id || 'T1');
            const rawSize = v.vessel_size || (Number(v.container_count || 0) > 1800 ? 'Ultra Large' : Number(v.container_count || 0) > 1200 ? 'Large' : 'Feeder');
            const vesselSize = cleanText(rawSize);
            const rawStatus = v.status || 'Scheduled';
            const status = cleanText(rawStatus);
            const teuCount = Number(cleanText(v.container_count || v.teu || 0)) || 0;
            const priorityLevel = cleanText(v.priority || v.risk_level || 'LOW');

            return (
              <tr key={v.vessel_id || vesselName || idx}>
                {/* Vessel Name (Task 2 & 4: Clean text without SVG column) */}
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    {cleanText(vesselName)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cleanText(vId)} • Terminal {cleanText(terminal)}
                  </div>
                </td>

                {/* Arrival Time (Task 5: new Date(arrival_time).toLocaleString()) */}
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  <span>{formatArrivalTime(v.arrival_time)}</span>
                </td>

                {/* Size / Capacity */}
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    {cleanText(vesselSize)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {teuCount.toLocaleString()} TEU
                  </div>
                </td>

                {/* Priority Badge (Task 3 & 6: Clean badge with bullet, no SVG string) */}
                <td>
                  {renderBadge(priorityLevel)}
                </td>

                {/* Status (Clean indicator without SVG) */}
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: status.toUpperCase() === 'QUEUED' ? 'rgba(249, 115, 22, 0.12)' : status.toUpperCase() === 'APPROACHING' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    color: status.toUpperCase() === 'QUEUED' ? '#ea580c' : status.toUpperCase() === 'APPROACHING' ? '#0284c7' : '#16a34a'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                    <span>{cleanText(status)}</span>
                  </span>
                </td>

                {/* Action button */}
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
<<<<<<< HEAD
=======
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
>>>>>>> 12a37443dd3d2e84a104cf1c809c9028acc9d570
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
