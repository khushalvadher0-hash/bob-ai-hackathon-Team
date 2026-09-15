import React from 'react';
import { ArrowDown, CheckCircle2, Sparkles } from 'lucide-react';
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
        padding: '22px 24px',
        borderLeft: `4px solid ${isRerouted ? 'var(--color-primary)' : 'var(--status-low)'}`
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
            {vessel_id}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {vessel_name || vessel_id}
          </h3>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isRerouted ? 'var(--color-primary-light)' : 'var(--status-low-bg)',
          color: isRerouted ? 'var(--color-primary)' : 'var(--status-low-text)',
          border: `1px solid ${isRerouted ? '#bfdbfe' : 'var(--status-low-border)'}`,
          padding: '5px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {isRerouted ? <Sparkles size={13} /> : <CheckCircle2 size={13} />}
          {isRerouted ? 'REROUTE RECOMMENDED' : 'MAINTAIN CURRENT TERMINAL'}
        </div>
      </div>

      {/* Terminal Flow: Current → Recommended → Savings */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0',
        marginBottom: '16px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: '#f8fafc'
      }}>
        {/* Current Terminal */}
        <div style={{
          flex: 1,
          padding: '14px 16px',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Current Terminal
          </span>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: isRerouted ? 'var(--status-critical-text)' : 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}>
            Terminal {current_terminal}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Queue wait: <strong>~{current_wait_hours}h</strong>
          </div>
        </div>

        {/* Arrow divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 12px',
          color: 'var(--color-primary)',
          fontSize: '1.1rem',
          flexShrink: 0,
          background: isRerouted ? 'var(--color-primary-light)' : '#f1f5f9',
          borderRight: '1px solid var(--border-color)'
        }}>
          →
        </div>

        {/* Recommended Terminal */}
        <div style={{
          flex: 1,
          padding: '14px 16px',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Recommended Terminal
          </span>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.01em'
          }}>
            Terminal {recommended_terminal}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Estimated wait: <strong>~{estimated_wait_hours}h</strong>
          </div>
        </div>

        {/* Wait Reduction */}
        <div style={{
          flex: 1,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: calculatedSavings > 0 ? 'var(--status-low-bg)' : '#f8fafc'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Wait Reduction
          </span>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: calculatedSavings > 0 ? 'var(--status-low-text)' : 'var(--text-secondary)',
            letterSpacing: '-0.01em'
          }}>
            {calculatedSavings > 0 ? `+${calculatedSavings}h` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {calculatedSavings > 0 ? 'Saved from queue' : 'Optimal route'}
          </div>
        </div>
      </div>

      {/* Reason */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '11px 14px',
        marginBottom: score_breakdown && Object.keys(score_breakdown).length > 0 ? '14px' : '0'
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Routing Reason
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {reason}
        </p>
      </div>

      {/* Score Breakdown */}
      {score_breakdown && Object.keys(score_breakdown).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
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
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize', letterSpacing: '0.02em' }}>
                {key.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {typeof val === 'number' ? val.toFixed(2) : val}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
