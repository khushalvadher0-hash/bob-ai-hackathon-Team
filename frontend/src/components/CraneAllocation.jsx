import React, { useState } from 'react';
import { Hammer, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Activity } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function CraneAllocation({ cranes = [], schedule = [] }) {
  const [selectedTerminal, setSelectedTerminal] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique terminals
  const terminals = ['ALL', ...new Set(cranes.map(c => c.terminal_id).filter(Boolean))];

  // Map active vessels to berths for crane context
  const berthActiveMap = {};
  if (Array.isArray(schedule)) {
    schedule.forEach(item => {
      if (item.berth_id) {
        berthActiveMap[item.berth_id] = item;
      }
    });
  }

  // Filter cranes
  const filteredCranes = cranes.filter(crane => {
    const matchesTerminal = selectedTerminal === 'ALL' || crane.terminal_id === selectedTerminal;
    const matchesSearch = !searchTerm || 
      crane.crane_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crane.berth_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crane.terminal_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTerminal && matchesSearch;
  });

  const totalCranes = cranes.length;
  const operationalCount = cranes.filter(c => c.status === 'OPERATIONAL' || c.status === 'ACTIVE').length;
  const maintenanceCount = cranes.filter(c => c.status === 'MAINTENANCE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Crane Fleet Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px'
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '3px solid var(--color-primary)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Quay Cranes
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {totalCranes} Units
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '3px solid var(--status-low)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Operational / Active
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-low)', marginTop: '4px' }}>
            {operationalCount} Units
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '3px solid var(--status-critical)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Maintenance / Standby
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: maintenanceCount > 0 ? 'var(--status-critical)' : 'var(--text-secondary)', marginTop: '4px' }}>
            {maintenanceCount} Units
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '3px solid var(--color-accent)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Throughput Standard
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '4px' }}>
            35 TEU / hr
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Terminal:</span>
          {terminals.map(term => (
            <button
              key={term}
              onClick={() => setSelectedTerminal(term)}
              style={{
                background: selectedTerminal === term ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedTerminal === term ? 'var(--color-primary)' : 'var(--text-secondary)',
                border: `1px solid ${selectedTerminal === term ? 'var(--color-primary)' : 'var(--border-color)'}`,
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {term}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search crane or berth ID..."
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

      {/* Detailed Crane Inventory Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Crane ID</th>
              <th>Terminal</th>
              <th>Assigned Berth</th>
              <th>Handling Rate</th>
              <th>Active Shift Vessel</th>
              <th>Operational Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCranes.length > 0 ? (
              filteredCranes.map(cr => {
                const assignedOperation = berthActiveMap[cr.berth_id];
                const isMaintenance = cr.status === 'MAINTENANCE';

                return (
                  <tr key={cr.crane_id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={16} />
                        {cr.crane_id}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{cr.terminal_id}</td>
                    <td>
                      <span style={{
                        background: 'rgba(255,255,255,0.06)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {cr.berth_id}
                      </span>
                    </td>
                    <td>{cr.capacity_teu_per_hour || 35} TEU / hr</td>
                    <td>
                      {assignedOperation ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {assignedOperation.vessel_name || assignedOperation.vessel_id}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {assignedOperation.action || 'Discharge & Load'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available in Pool</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isMaintenance ? 'badge-critical' : 'badge-low'}`}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'currentColor'
                        }} />
                        {cr.status || 'OPERATIONAL'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No cranes match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
