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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ship size={24} color="var(--color-primary)" />
            Vessel Fleet Directory
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time fleet roster, cargo capacity, priority rating, and terminal assignments.
          </p>
        </div>

        <button
          className="btn"
          onClick={loadVessels}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid var(--border-color)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          flex: '1 1 200px'
        }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search by ID, Name, or Terminal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              background: '#111e38',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Terminal Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Terminal:</span>
          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            style={{
              background: '#111e38',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Terminals</option>
            {availableTerminals.map(t => (
              <option key={t} value={t}>Terminal {t}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#111e38',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses</option>
            {availableStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sorting selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: '#111e38',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="vessel_id">Vessel ID</option>
            <option value="vessel_name">Vessel Name</option>
            <option value="container_count">Containers (TEU)</option>
            <option value="priority">Priority</option>
            <option value="arrival_time">Arrival Time</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading/Error State */}
      {loading ? (
        <LoadingSpinner message="Retrieving Vessel Fleet Manifest..." />
      ) : error ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertTriangle size={32} color="var(--status-critical)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadVessels}>Retry</button>
        </div>
      ) : filteredVessels.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No vessels matching the selected filters or search query.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filteredVessels.length} of {vessels.length} vessels
          </div>
          <VesselTable vessels={filteredVessels} onSelectVessel={handleSelectVessel} />
        </div>
      )}
    </div>
  );
}
