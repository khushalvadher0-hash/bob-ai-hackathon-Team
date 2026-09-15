import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import CongestionCard from '../components/CongestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCongestion } from '../services/api';

export default function Congestion() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCongestion()
      .then(data => setTerminals(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Evaluating ML Congestion Models..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} color="var(--color-primary)" />
          Terminal Congestion Hotspots
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Real-time bottlenecks predicted via Random Forest classification model based on container load and berth utilization.
        </p>
      </div>

      {/* Grid of Congestion Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {terminals.map(term => (
          <CongestionCard key={term.terminal_id} terminal={term} />
        ))}
      </div>

      {/* Congestion Hotspot Summary Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 30, 56, 0.8) 100%)' }}>
        <h4 style={{ color: 'var(--status-critical)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
          ⚠️ Critical Action Threshold Alert
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Terminal T1 (North Deepwater) is currently experiencing severe queue concentration (&gt;80% probability).
          The automated routing engine is actively diverting incoming feeder and large container carriers to Terminal T2 and T3.
        </p>
      </div>
    </div>
  );
}
