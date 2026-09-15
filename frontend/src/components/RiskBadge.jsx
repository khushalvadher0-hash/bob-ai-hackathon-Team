import React from 'react';
import { cleanText } from '../utils/cleanText';

export default function RiskBadge({ level = 'LOW', showTooltip = true }) {
  const normalizedLevel = cleanText(level || 'LOW').toUpperCase();

  let badgeClass = 'badge-low';
  let bulletColor = '#10b981';
  let pulseClass = '';
  let tooltipText = 'Optimal flow: immediate berth access and low turnaround wait.';

  if (normalizedLevel === 'CRITICAL' || normalizedLevel === 'HIGH') {
    badgeClass = normalizedLevel === 'CRITICAL' ? 'badge-critical' : 'badge-high';
    bulletColor = '#ef4444';
    pulseClass = 'pulse-high';
    tooltipText = 'High congestion warning: Queue build-up exceeds recommended capacity.';
  } else if (normalizedLevel === 'MEDIUM' || normalizedLevel === 'MED') {
    badgeClass = 'badge-medium';
    bulletColor = '#f59e0b';
    tooltipText = 'Moderate traffic: Resource allocation active to prevent berth bottleneck.';
  }

  const badgeContent = (
    <span
      className={`badge ${badgeClass} ${pulseClass}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontWeight: 700,
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ color: bulletColor, fontSize: '0.65rem' }}>●</span>
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
