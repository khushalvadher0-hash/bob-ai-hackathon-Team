import React, { useState, useEffect, useMemo } from 'react';
import { Activity, RefreshCw, AlertTriangle, Filter, Layers } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} color="var(--color-primary)" />
            Terminal Congestion & Bottleneck Analysis
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            AI-predicted queue build-up, delay probabilities, and berth availability across all port terminals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Severity Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)'
          }}>
            <Filter size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                background: '#111e38',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.85rem',
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
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <RefreshCw size={14} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertTriangle size={32} color="var(--status-critical)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadCongestion}>Retry</button>
        </div>
      ) : filteredTerminals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No terminals currently classified under '{severityFilter}' congestion severity.</p>
        </div>
      ) : (
        /* Grid of Congestion Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTerminals.map(term => (
            <CongestionCard key={term.terminal_id} terminal={term} />
          ))}
        </div>
      )}

      {/* Congestion Hotspot Summary Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 30, 56, 0.8) 100%)' }}>
        <h4 style={{ color: 'var(--status-critical)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
          ⚠️ Real-Time Operational Decision Threshold
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Terminals flagged as <strong>CRITICAL</strong> or <strong>HIGH</strong> risk trigger automatic dynamic rerouting evaluations. Shift supervisors should inspect the Routing view for alternate terminal draft compatibility before queues exceed 6 hours.
        </p>
      </div>
    </div>
  );
}
