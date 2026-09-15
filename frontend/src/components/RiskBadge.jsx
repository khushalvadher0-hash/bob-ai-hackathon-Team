import React from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', showTooltip = true }) {
  const normalizedLevel = String(level || 'LOW').toUpperCase();

  let badgeClass = 'badge-low';
  let icon = <CheckCircle2 size={12} strokeWidth={2.5} />;
  let pulseClass = '';
  let tooltipText = 'Optimal flow: immediate berth access and low turnaround wait.';

  if (normalizedLevel === 'CRITICAL' || normalizedLevel === 'HIGH') {
    badgeClass = normalizedLevel === 'CRITICAL' ? 'badge-critical' : 'badge-high';
    icon = <AlertTriangle size={12} strokeWidth={2.5} />;
    pulseClass = 'pulse-high';
    tooltipText = 'High congestion warning: Queue build-up exceeds recommended capacity.';
  } else if (normalizedLevel === 'MEDIUM' || normalizedLevel === 'MED') {
    badgeClass = 'badge-medium';
    icon = <Clock size={12} strokeWidth={2.5} />;
    tooltipText = 'Moderate traffic: Resource allocation active to prevent berth bottleneck.';
  }

  const badgeContent = (
    <span
      className={`badge ${badgeClass} ${pulseClass}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 700,
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
      <span>{normalizedLevel}</span>
    </span>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <div className="tooltip-wrapper">
      {badgeContent}
      <span className="tooltip-box">{tooltipText}</span>
    </div>
  );
}
