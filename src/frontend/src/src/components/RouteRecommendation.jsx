import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RouteRecommendation({ recommendation }) {
  if (!recommendation) return null;

  const {
    vessel_id,
    vessel_name,
    current_terminal,
    recommended_terminal,
    score,
    reason,
    estimated_wait_hours
  } = recommendation;

  const isRerouted = current_terminal !== recommended_terminal;

  return (
    <div className="glass-panel" style={{ padding: '24px', borderLeft: `4px solid ${isRerouted ? 'var(--color-primary)' : 'var(--status-low)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>VESSEL {vessel_id}</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{vessel_name}</h3>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isRerouted ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)',
          padding: '6px 12px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {isRerouted ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {isRerouted ? 'REROUTE ADVISED' : 'MAINTAIN ROUTE'}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Terminal</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: isRerouted ? 'var(--status-high)' : 'var(--text-primary)' }}>
            {current_terminal}
          </p>
        </div>

        <ArrowRight size={24} style={{ color: 'var(--text-muted)' }} />

        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optimized Routing</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {recommended_terminal}
          </p>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px', textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optimized Wait</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-low)' }}>
            ~{estimated_wait_hours} hrs
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong>Reasoning:</strong> {reason}
      </p>
    </div>
  );
}
