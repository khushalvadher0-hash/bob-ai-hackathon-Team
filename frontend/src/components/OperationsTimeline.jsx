import React, { useState } from 'react';
import { Clock, Ship, Anchor, Cpu, ArrowRight, Calendar, Filter, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import RiskBadge from './RiskBadge';

export default function OperationsTimeline({ schedule = [] }) {
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL', '24H', '48H', '72H'
  const [terminalFilter, setTerminalFilter] = useState('ALL');

  // Filter schedule by horizon & terminal
  const filteredSchedule = schedule.filter((item) => {
    // Terminal filter
    if (terminalFilter !== 'ALL' && item.terminal_id !== terminalFilter) {
      return false;
    }

    // Time horizon filter (based on start_time or index relative to horizon)
    if (timeFilter !== 'ALL' && item.start_time) {
      try {
        const itemDate = new Date(item.start_time);
        const baseDate = schedule[0]?.start_time ? new Date(schedule[0].start_time) : new Date();
        const diffHours = (itemDate - baseDate) / (1000 * 60 * 60);

        if (timeFilter === '24H' && diffHours > 24) return false;
        if (timeFilter === '48H' && (diffHours < 24 || diffHours > 48)) return false;
        if (timeFilter === '72H' && diffHours < 48) return false;
      } catch {
        // if date parsing fails, keep item
      }
    }

    return true;
  });

  const uniqueTerminals = ['ALL', ...new Set(schedule.map(s => s.terminal_id).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filtering Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Horizon Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Horizon:
          </span>
          {[
            { key: 'ALL', label: 'All 72 Hours' },
            { key: '24H', label: '0 – 24h (Immediate)' },
            { key: '48H', label: '24 – 48h (Next Shift)' },
            { key: '72H', label: '48 – 72h (Planned)' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeFilter(key)}
              style={{
                background: timeFilter === key ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: timeFilter === key ? 'var(--color-primary)' : 'var(--text-secondary)',
                border: `1px solid ${timeFilter === key ? 'var(--color-primary)' : 'var(--border-color)'}`,
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Terminal Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Terminal:
          </span>
          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {uniqueTerminals.map(term => (
              <option key={term} value={term} style={{ background: '#111e38' }}>
                {term === 'ALL' ? 'All Terminals' : `Terminal ${term}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Items List */}
      {filteredSchedule.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No scheduled vessel operations in the selected time horizon.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredSchedule.map((item, index) => {
            const isHighPriority = item.priority === 'HIGH';

            return (
              <div
                key={`${item.vessel_id}-${index}`}
                className="glass-panel"
                style={{
                  padding: '18px 24px',
                  borderLeft: `4px solid ${isHighPriority ? 'var(--status-high)' : 'var(--color-primary)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Left: Vessel and Berth Info (WHO & WHERE) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: 'var(--color-primary)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      minWidth: '58px'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', fontWeight: 600 }}>BERTH</span>
                    {item.berth_id || 'B01'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {item.vessel_id}
                      </span>
                      <span className={`badge ${isHighPriority ? 'badge-high' : 'badge-low'}`}>
                        {item.priority || 'MEDIUM'} PRIORITY
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.vessel_name || item.vessel_id}
                    </h4>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Terminal {item.terminal_id} • {item.action || 'Discharge & Loading Operations'}
                    </p>
                  </div>
                </div>

                {/* Middle: Cranes Allocated (WHAT) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <Cpu size={18} color="var(--color-primary)" />
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Gantry Cranes
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.cranes || 2} Units Assigned
                    </p>
                  </div>
                </div>

                {/* Right: Operational Window (WHEN) */}
                <div style={{ textAlign: 'right', minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <Clock size={14} color="var(--color-primary)" />
                    <span style={{ fontWeight: 600 }}>Turnaround Window</span>
                  </div>

                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatDate(item.start_time)} <ArrowRight size={12} style={{ display: 'inline', margin: '0 4px', color: 'var(--text-muted)' }} /> {formatDate(item.end_time)}
                  </p>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '2px' }}>
                    Est. Handling Duration: ~{item.duration_hours || 4} hours
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

