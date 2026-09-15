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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Terminal:</span>
          {terminals.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerminal(term)}
              style={{
                background: selectedTerminal === term ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedTerminal === term ? 'var(--color-primary)' : 'var(--text-secondary)',
                border: `1px solid ${selectedTerminal === term ? 'var(--color-primary)' : 'var(--border-color)'}`,
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
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
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '220px'
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
              <th>Yard Capacity</th>
              <th>Crane Units</th>
              <th>Current Assignment</th>
              <th>Next Available From</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Anchor size={16} />
                        {b.berth_id}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{b.terminal_name || `Terminal ${b.terminal_id}`}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        ({b.terminal_id})
                      </span>
                    </td>
                    <td>{b.max_vessel_size || 'ULCV'}</td>
                    <td>{b.capacity ? Number(b.capacity).toLocaleString() : '12,000'} TEU</td>
                    <td style={{ fontWeight: 600 }}>{b.crane_count || 2} Cranes</td>
                    <td>
                      {activeAssignment ? (
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {activeAssignment.vessel_name || activeAssignment.vessel_id}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                            {activeAssignment.cranes} cranes allocated
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— Ready for Docking</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formatDate(b.available_from)}
                    </td>
                    <td>
                      <span className={`badge ${isAvailable ? 'badge-low' : 'badge-high'}`}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'currentColor'
                        }} />
                        {b.status || 'AVAILABLE'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No berths match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

