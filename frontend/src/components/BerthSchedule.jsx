import React, { useState } from 'react';
import { Anchor, Search, Filter, ShieldCheck, Clock } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import RiskBadge from './RiskBadge';

export default function BerthSchedule({ berths = [], schedule = [] }) {
  const [selectedTerminal, setSelectedTerminal] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const terminals = ['ALL', ...new Set(berths.map(b => b.terminal_id).filter(Boolean))];

  // Match scheduled vessels to berths
  const berthScheduledVessel = {};
  if (Array.isArray(schedule)) {
    schedule.forEach(item => {
      if (item.berth_id) {
        berthScheduledVessel[item.berth_id] = item;
      }
    });
  }

  const filteredBerths = berths.filter((b) => {
    const matchesTerminal = selectedTerminal === 'ALL' || b.terminal_id === selectedTerminal;
    const matchesSearch = !searchTerm ||
      b.berth_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.terminal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.terminal_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTerminal && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Terminal:</span>
          {terminals.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerminal(term)}
              style={{
                backgroundColor: selectedTerminal === term ? 'var(--color-primary-light)' : '#ffffff',
                color: selectedTerminal === term ? 'var(--color-primary)' : 'var(--text-secondary)',
                border: `1px solid ${selectedTerminal === term ? 'var(--color-primary)' : 'var(--border-color)'}`,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {term === 'ALL' ? 'All Terminals' : `Terminal ${term}`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search berth or terminal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              outline: 'none',
              minWidth: '200px'
            }}
          />
        </div>
      </div>

      {/* Berth Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Berth ID</th>
              <th>Terminal</th>
              <th>Max Vessel Size</th>
              <th>Capacity</th>
              <th>Quay Cranes</th>
              <th>Current Assignment</th>
              <th>Berth Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBerths.length > 0 ? (
              filteredBerths.map((b) => {
                const activeAssignment = berthScheduledVessel[b.berth_id];
                const isAvailable = b.status === 'AVAILABLE';

                return (
                  <tr key={b.berth_id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {b.berth_id}
                    </td>
                    <td>Terminal {b.terminal_id}</td>
                    <td style={{ fontSize: '0.8rem' }}>{b.max_vessel_size || 'Ultra Large'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{b.capacity_teu?.toLocaleString() || 5000} TEU</td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{b.crane_count || 2}</strong> units
                    </td>
                    <td>
                      {activeAssignment ? (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            {activeAssignment.vessel_name || activeAssignment.vessel_id}
                          </strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {formatDate(activeAssignment.start_time)}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Open Slot</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isAvailable ? 'badge-low' : 'badge-high'}`}>
                        {b.status || 'AVAILABLE'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                  No berths matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
