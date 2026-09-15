import React from 'react';
import RiskBadge from './RiskBadge';
import { Activity, Anchor, Hammer, Clock, Ship, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CongestionCard({ terminal, isVertical = true }) {
  const navigate = useNavigate();

  const {
    terminal_id,
    terminal_name,
    vessel_count,
    container_count,
    available_berths,
    available_cranes,
    congestion_level,
    probability,
    predicted_wait_hours
  } = terminal;

  const lvl = String(congestion_level || 'LOW').toUpperCase();
  const isCrit = lvl === 'CRITICAL' || lvl === 'HIGH';
  const isMed = lvl === 'MEDIUM';

  // Fix delay probability percentage calculation (e.g. raw 80.2 -> 80%, 0.8 -> 80%)
  const rawProb = terminal.probability ?? terminal.delay_probability ?? 0.5;
  const probPercent = rawProb > 1 ? Math.min(100, Math.round(rawProb)) : Math.round(rawProb * 100);

  const accentColor = isCrit ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';
  const bgColor = isCrit ? '#fff7f7' : isMed ? '#fffdf7' : '#f9fdfa';

  // Capacity estimate based on terminal
  const capacityPct = terminal_id === 'T1' ? 90 : terminal_id === 'T2' ? 60 : terminal_id === 'T3' ? 25 : 40;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '20px 24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        borderLeft: `5px solid ${accentColor}`,
        backgroundColor: bgColor,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `${accentColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Ship size={20} color={accentColor} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                color: 'var(--color-primary)', 
                letterSpacing: '0.05em' 
              }}>
                TERMINAL {terminal_id}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• Sector Basin</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {terminal_name}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RiskBadge level={congestion_level} />
          
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/routing?terminalId=${terminal_id}`)}
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              backgroundColor: isCrit ? '#ef4444' : 'var(--color-primary)',
              borderColor: isCrit ? '#ef4444' : 'var(--color-primary)'
            }}
          >
            <span>{isCrit ? 'Evaluate Reroute' : 'Inspect Terminal'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Metrics Row (Horizontal Distribution Across the Vertical Card) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px'
      }}>
        {/* Metric 1: Delay Probability */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
            <Activity size={13} color={accentColor} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Delay Probability</span>
          </div>
          <p style={{ 
            fontSize: '1.35rem', 
            fontWeight: 800, 
            color: isCrit ? '#b91c1c' : isMed ? '#b45309' : '#047857' 
          }}>
            {probPercent}%
          </p>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${probPercent}%`, height: '100%', backgroundColor: accentColor, borderRadius: '3px' }} />
          </div>
        </div>

        {/* Metric 2: Est. Turnaround Wait */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
            <Clock size={13} color="var(--color-primary)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Est. Turnaround Wait</span>
          </div>
          <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ~{predicted_wait_hours || 2.0} hrs
          </p>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Average queue dwell time</span>
        </div>

        {/* Metric 3: Active Vessels & Containers */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
            <Anchor size={13} color="var(--color-primary)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vessel Fleet Traffic</span>
          </div>
          <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {vessel_count} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vessels</span>
          </p>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {(container_count || 0).toLocaleString()} TEU volume
          </span>
        </div>

        {/* Metric 4: Berths & Cranes */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
            <Hammer size={13} color="var(--color-primary)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Infrastructure Capacity</span>
          </div>
          <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {available_berths} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Open Berths</span>
          </p>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {available_cranes} Quay Cranes online
          </span>
        </div>
      </div>

      {/* Utilization & Operational Guidance Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.76rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCrit ? (
            <AlertTriangle size={14} color="#ef4444" />
          ) : (
            <CheckCircle2 size={14} color="#10b981" />
          )}
          <span style={{ color: isCrit ? '#991b1b' : 'var(--text-secondary)' }}>
            {isCrit 
              ? 'Capacity alert: Berth queue exceeds normal threshold. Inbound ships should be diverted.' 
              : isMed 
              ? 'Moderate queue: Crane handling nominal with acceptable vessel queue.' 
              : 'Optimal conditions: Immediate berth availability ready for arriving vessels.'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Terminal Utilization:</span>
          <span style={{ fontWeight: 800, color: accentColor }}>{capacityPct}%</span>
        </div>
      </div>
    </div>
  );
}
