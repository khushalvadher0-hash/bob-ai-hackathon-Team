import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Clock, Zap, ShieldCheck, Gauge } from 'lucide-react';
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

  // Calculate wait savings
  const calculatedSavings = wait_reduction_hours !== undefined && wait_reduction_hours !== null
    ? Number(wait_reduction_hours)
    : Math.max(0, Number(current_wait_hours || 0) - Number(estimated_wait_hours || 0));

  // Normalize route score to percentage (0.86 -> 86%, or penalty 0.2 -> 80% efficiency)
  let scorePercentage = 0;
  if (typeof route_score === 'number') {
    if (route_score > 0 && route_score <= 1) {
      scorePercentage = Math.round(route_score * 100);
    } else if (route_score > 1 && route_score <= 100) {
      scorePercentage = Math.round(route_score);
    }
  }

  // Format score breakdown entries
  const breakdownEntries = Object.entries(score_breakdown || {});

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        borderLeft: `5px solid ${isRerouted ? 'var(--color-primary)' : 'var(--status-low)'}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: isRerouted
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
              VESSEL ID: {vessel_id}
            </span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {vessel_name || vessel_id}
          </h3>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: isRerouted ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)',
            border: `1px solid ${isRerouted ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.025em'
          }}
        >
          {isRerouted ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          {isRerouted ? 'REROUTE RECOMMENDED' : 'MAINTAIN CURRENT SCHEDULE'}
        </div>
      </div>

      {/* Visual Terminal Comparison & Wait Reduction */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'stretch',
          marginBottom: '24px'
        }}
      >
        {/* Current Terminal Card */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Current Terminal
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isRerouted ? 'var(--status-high)' : 'var(--text-primary)' }}>
                {current_terminal}
              </span>
              <RiskBadge level={isRerouted ? 'HIGH' : 'LOW'} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Turnaround Queue</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {current_wait_hours} hrs
            </p>
          </div>
        </div>

        {/* Arrow & Savings Banner */}
        <div
          style={{
            background: isRerouted ? 'rgba(56, 189, 248, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: `1px dashed ${isRerouted ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{ color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)', marginBottom: '8px' }}>
            <Zap size={24} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Queue Time Saved
          </p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)' }}>
            {calculatedSavings > 0 ? `-${calculatedSavings.toFixed(1)} hrs` : '0.0 hrs'}
          </p>
          {calculatedSavings > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {current_wait_hours}h → {estimated_wait_hours}h
            </span>
          )}
        </div>

        {/* Recommended Terminal Card */}
        <div
          style={{
            background: isRerouted ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${isRerouted ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Recommended Terminal
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)' }}>
                {recommended_terminal}
              </span>
              <RiskBadge level={isRerouted ? 'LOW' : 'LOW'} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optimized Wait Window</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: isRerouted ? 'var(--color-primary)' : 'var(--status-low)' }}>
              {estimated_wait_hours} hrs
            </p>
          </div>
        </div>
      </div>

      {/* Decision Reasoning Callout */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Routing Justification
          </span>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
          "{reason}"
        </p>
      </div>

      {/* Score & Breakdown Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Score Gauge */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Route Optimization Score
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {scorePercentage > 0 ? `${scorePercentage}%` : `${(route_score * 100).toFixed(0)}%`}
            </span>
          </div>

          <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(10, scorePercentage || 75))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                borderRadius: '9999px',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Composite evaluation balancing dwell congestion, turnaround buffer, and berth draft suitability.
          </p>
        </div>

        {/* Score Breakdown Bars */}
        {breakdownEntries.length > 0 && (
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Score Factor Breakdown
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {breakdownEntries.map(([key, val]) => {
                const numericVal = typeof val === 'number' ? val : parseFloat(val) || 0;
                const formattedPct = numericVal <= 1 ? Math.round(numericVal * 100) : Math.round(numericVal);
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formattedPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(5, formattedPct))}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

