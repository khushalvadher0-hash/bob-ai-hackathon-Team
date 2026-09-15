import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Ship, RefreshCw, AlertTriangle, Plus, X, CheckCircle2 } from 'lucide-react';
import VesselTable from '../components/VesselTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels, addVesselApi } from '../services/api';
import { vesselsData } from '../data/vesselsData';
import { useNavigate } from 'react-router-dom';
import { cleanText } from '../utils/cleanText';

export default function Vessels() {
  const [vessels, setVessels] = useState(vesselsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [terminalFilter, setTerminalFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('vessel_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // New Vessel Form State
  const [newVessel, setNewVessel] = useState({
    vessel_id: '',
    vessel_name: '',
    container_count: '1200',
    vessel_size: 'Large',
    priority: 'MEDIUM',
    current_terminal: 'T1',
    status: 'APPROACHING',
    arrival_time: new Date(Date.now() + 3600 * 1000 * 4).toISOString().slice(0, 16)
  });

  const navigate = useNavigate();

  const loadVessels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVessels();
      if (Array.isArray(data) && data.length > 0) {
        setVessels(data);
      } else {
        setVessels(vesselsData);
      }
    } catch (err) {
      console.warn('API error, using shared vessel dataset:', err);
      setVessels(vesselsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVessels();
  }, []);

  const availableTerminals = useMemo(() => {
    const terms = new Set(vessels.map(v => cleanText(v.current_terminal)).filter(Boolean));
    return Array.from(terms).sort();
  }, [vessels]);

  const filteredVessels = useMemo(() => {
    return vessels
      .filter(v => {
        const query = searchTerm.toLowerCase();
        const vName = cleanText(v.vessel_name || v.name || '').toLowerCase();
        const vId = cleanText(v.vessel_id || '').toLowerCase();
        const vTerm = cleanText(v.current_terminal || '').toLowerCase();

        const matchesSearch = vName.includes(query) || vId.includes(query) || vTerm.includes(query);
        const matchesPriority = priorityFilter === 'ALL' || cleanText(v.priority).toUpperCase() === priorityFilter;
        const matchesTerminal = terminalFilter === 'ALL' || cleanText(v.current_terminal) === terminalFilter;
        const matchesStatus = statusFilter === 'ALL' || cleanText(v.status).toUpperCase() === statusFilter;

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

  // Task 2: Add Vessel Handler
  const handleAddVesselSubmit = (e) => {
    e.preventDefault();
    if (!newVessel.vessel_id.trim() || !newVessel.vessel_name.trim()) {
      alert('Please provide Vessel ID and Vessel Name.');
      return;
    }

    const created = {
      ...newVessel,
      vessel_id: cleanText(newVessel.vessel_id.trim().toUpperCase()),
      vessel_name: cleanText(newVessel.vessel_name.trim()),
      container_count: Number(newVessel.container_count) || 1000,
      risk_level: newVessel.priority === 'HIGH' ? 'HIGH' : newVessel.priority === 'MEDIUM' ? 'MEDIUM' : 'LOW'
    };

    // Add to shared dataset in memory and notify backend
    vesselsData.unshift(created);
    setVessels(prev => [created, ...prev]);
    addVesselApi(created).catch(() => {});
    setShowAddModal(false);
    setSuccessMessage(`Vessel ${created.vessel_name} (${created.vessel_id}) added to fleet manifest.`);

    // Reset Form
    setNewVessel({
      vessel_id: '',
      vessel_name: '',
      container_count: '1200',
      vessel_size: 'Large',
      priority: 'MEDIUM',
      current_terminal: 'T1',
      status: 'APPROACHING',
      arrival_time: new Date(Date.now() + 3600 * 1000 * 4).toISOString().slice(0, 16)
    });

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="page-title">
            <Ship size={20} color="var(--color-primary)" />
            Vessel Fleet Directory
          </h2>
          <p className="page-subtitle">
            Real-time fleet roster, cargo workload, priority rating, and assigned terminal berths.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Task 2: Add Vessel Button */}
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <Plus size={14} />
            <span>Add Vessel</span>
          </button>

          <button
            className="btn"
            onClick={loadVessels}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} />
            <span>Refresh Fleet</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#065f46',
          fontSize: '0.83rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{successMessage}</span>
        </div>
      )}

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

      {/* Task 2: Add Vessel Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ship size={18} color="var(--color-primary)" />
                Register New Vessel Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVesselSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Vessel ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VSL-109"
                    value={newVessel.vessel_id}
                    onChange={e => setNewVessel({ ...newVessel, vessel_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Vessel Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CMA CGM Jules"
                    value={newVessel.vessel_name}
                    onChange={e => setNewVessel({ ...newVessel, vessel_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Cargo Volume (TEU)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="24000"
                    value={newVessel.container_count}
                    onChange={e => setNewVessel({ ...newVessel, container_count: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Size Class
                  </label>
                  <select
                    value={newVessel.vessel_size}
                    onChange={e => setNewVessel({ ...newVessel, vessel_size: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="Feeder">Feeder (&lt;1000 TEU)</option>
                    <option value="Large">Large (Panamax)</option>
                    <option value="Ultra Large">Ultra Large (ULCV)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Priority Rating
                  </label>
                  <select
                    value={newVessel.priority}
                    onChange={e => setNewVessel({ ...newVessel, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="HIGH">HIGH (Perishable / Express)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW (Bulk / Non-urgent)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Assigned Terminal
                  </label>
                  <select
                    value={newVessel.current_terminal}
                    onChange={e => setNewVessel({ ...newVessel, current_terminal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="T1">Terminal T1 (North)</option>
                    <option value="T2">Terminal T2 (East)</option>
                    <option value="T3">Terminal T3 (South)</option>
                    <option value="T4">Terminal T4 (Feeder)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Estimated Arrival Time
                </label>
                <input
                  type="datetime-local"
                  value={newVessel.arrival_time}
                  onChange={e => setNewVessel({ ...newVessel, arrival_time: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
