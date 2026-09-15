import React, { useState, useEffect, useMemo } from 'react';
import { Activity, RefreshCw, AlertTriangle, Filter, Layers, Info } from 'lucide-react';
import CongestionCard from '../components/CongestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCongestion } from '../services/api';

export default function Congestion() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadCongestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCongestion();
      setTerminals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Unable to evaluate terminal congestion models. Please check backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCongestion();
  }, []);

  const filteredTerminals = useMemo(() => {
    if (severityFilter === 'ALL') return terminals;
    return terminals.filter(t => {
      const lvl = String(t.congestion_level || '').toUpperCase();
      return lvl === severityFilter;
    });
  }, [terminals, severityFilter]);

  if (loading) return <LoadingSpinner message="Evaluating ML Congestion Models & Queue Estimates..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="page-title">
            <Activity size={20} color="var(--color-primary)" />
            Terminal Congestion &amp; Bottleneck Analysis
          </h2>
          <p className="page-subtitle">
            Random Forest ML predictions evaluating queue build-up, delay probabilities, and berth availability.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Severity Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)'
          }}>
            <Filter size={13} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <button
            className="btn"
            onClick={loadCongestion}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertTriangle size={32} color="var(--status-critical)" style={{ marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.85rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadCongestion}>Retry</button>
        </div>
      ) : filteredTerminals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '0.85rem' }}>No terminals currently classified under '{severityFilter}' congestion severity.</p>
        </div>
      ) : (
        /* Grid of Congestion Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredTerminals.map(term => (
            <CongestionCard key={term.terminal_id} terminal={term} />
          ))}
        </div>
      )}

      {/* Congestion Hotspot Summary Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 20px', 
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <AlertTriangle size={16} color="var(--status-high)" />
          <h4 style={{ color: '#c2410c', fontSize: '0.85rem', fontWeight: 700 }}>
            Operational Decision Guidance
          </h4>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#7c2d12', lineHeight: 1.5 }}>
          Terminals flagged as <strong>CRITICAL</strong> or <strong>HIGH</strong> risk automatically feed into the Alternate Routing engine. Vessels queued for these sectors are prioritized for draft-compatible berth reassignments in uncongested zones.
        </p>
      </div>
    </div>
  );
}
