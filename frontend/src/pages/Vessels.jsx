import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Ship, RefreshCw, AlertTriangle, ArrowUpDown } from 'lucide-react';
import VesselTable from '../components/VesselTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Vessels() {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [terminalFilter, setTerminalFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('vessel_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  const loadVessels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVessels();
      setVessels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Unable to load vessel data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVessels();
  }, []);

  // Extract unique filter options dynamically from data
  const availableTerminals = useMemo(() => {
    const terms = new Set(vessels.map(v => v.current_terminal).filter(Boolean));
    return Array.from(terms).sort();
  }, [vessels]);

  const availableStatuses = useMemo(() => {
    const stats = new Set(vessels.map(v => v.status).filter(Boolean));
    return Array.from(stats).sort();
  }, [vessels]);

  // Combined Search, Filter & Sort
  const filteredVessels = useMemo(() => {
    return vessels
      .filter(v => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
          (v.vessel_name && v.vessel_name.toLowerCase().includes(query)) ||
          (v.vessel_id && v.vessel_id.toLowerCase().includes(query)) ||
          (v.current_terminal && v.current_terminal.toLowerCase().includes(query));

        const matchesPriority = priorityFilter === 'ALL' || v.priority === priorityFilter;
        const matchesTerminal = terminalFilter === 'ALL' || v.current_terminal === terminalFilter;
        const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

        return matchesSearch && matchesPriority && matchesTerminal && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [vessels, searchTerm, priorityFilter, terminalFilter, statusFilter, sortBy, sortOrder]);

  const handleSelectVessel = (vesselId) => {
    navigate(`/routing?vesselId=${vesselId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Ship size={22} color="var(--color-primary)" />
            Vessel Fleet Directory
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            Real-time fleet roster, cargo workload, priority rating, and assigned terminal berths.
          </p>
        </div>

        <button
          className="btn"
          onClick={loadVessels}
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          <RefreshCw size={13} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          flex: '1 1 200px'
        }}>
          <Search size={14} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search by ID, Name, or Terminal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          padding: '5px 10px',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">HIGH Priority</option>
            <option value="MEDIUM">MEDIUM Priority</option>
            <option value="LOW">LOW Priority</option>
          </select>
        </div>

        {/* Terminal Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          padding: '5px 10px',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terminal:</span>
          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Terminals</option>
            {availableTerminals.map(t => (
              <option key={t} value={t}>Terminal {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <AlertTriangle size={32} color="var(--status-critical)" style={{ marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.85rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={loadVessels}>Retry</button>
          </div>
        ) : filteredVessels.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.85rem' }}>No vessels match the specified filters.</p>
          </div>
        ) : (
          <VesselTable vessels={filteredVessels} onSelectVessel={handleSelectVessel} />
        )}
      </div>
    </div>
  );
}
