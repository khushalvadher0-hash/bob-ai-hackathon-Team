import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Clock, Zap, ShieldCheck, Gauge, Sparkles } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function RouteRecommendation({ recommendation }) {
  if (!recommendation) return null;

  const {
    vessel_id,
    vessel_name,
    current_terminal = 'T1',
    recommended_terminal = 'T1',
    current_wait_hours = 0,
    estimated_wait_hours = 0,
    wait_reduction_hours,
    route_score = 0,
    score_breakdown = {},
    reason = 'Optimal berth routing calculated based on live terminal metrics.'
  } = recommendation;

  const isRerouted = Boolean(recommended_terminal && current_terminal !== recommended_terminal);

  const calculatedSavings = wait_reduction_hours !== undefined && wait_reduction_hours !== null
    ? Number(wait_reduction_hours)
    : Math.max(0, Number(current_wait_hours || 0) - Number(estimated_wait_hours || 0));

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderLeft: `5px solid ${isRerouted ? 'var(--color-primary)' : 'var(--status-low)'}`
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--color-primary)' }}>
            VESSEL ID: {vessel_id}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {vessel_name || vessel_id}
          </h3>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isRerouted ? 'var(--color-primary-light)' : 'var(--status-low-bg)',
            color: isRerouted ? 'var(--color-primary)' : 'var(--status-low-text)',
            border: `1px solid ${isRerouted ? '#bae6fd' : 'var(--status-low-border)'}`,
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          {isRerouted ? <Sparkles size={16} /> : <CheckCircle2 size={16} />}
          {isRerouted ? 'REROUTE RECOMMENDED' : 'MAINTAIN CURRENT TERMINAL'}
        </div>
      </div>

      {/* Visual Terminal Comparison & Delay Savings Box */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '18px'
      }}>
        {/* Current Destination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Current Assignment
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isRerouted ? 'var(--status-critical-text)' : 'var(--text-primary)' }}>
            Terminal {current_terminal}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Queuing Wait: <strong>~{current_wait_hours} hrs</strong>
          </span>
        </div>

        {/* Transition Arrow / Recommended Destination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Recommended Alternate
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Terminal {recommended_terminal}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Turnaround Wait: <strong>~{estimated_wait_hours} hrs</strong>
          </span>
        </div>

        {/* Delay Savings Metric */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Turnaround Efficiency
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-low-text)' }}>
            {calculatedSavings > 0 ? `+${calculatedSavings} hrs saved` : 'Optimal Route'}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Reduced anchorage delay
          </span>
        </div>
      </div>

      {/* Explanation / Reason Callout */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
          Recommendation Logic & Feasibility Justification
        </div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {reason}
        </p>
      </div>

      {/* Weighted Score Breakdown */}
      {score_breakdown && Object.keys(score_breakdown).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {Object.entries(score_breakdown).map(([key, val]) => (
            <div 
              key={key}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px'
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {key.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {typeof val === 'number' ? val.toFixed(2) : val}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
