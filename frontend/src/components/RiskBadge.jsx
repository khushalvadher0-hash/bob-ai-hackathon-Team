import React from 'react';
import { getStatusBadgeClass } from '../utils/statusHelper';

export default function RiskBadge({ level = 'LOW' }) {
  const normalizedLevel = String(level || 'LOW').toUpperCase();

  let badgeClass = 'badge-low';
  if (normalizedLevel === 'CRITICAL') {
    badgeClass = 'badge-critical';
  } else if (normalizedLevel === 'HIGH') {
    badgeClass = 'badge-high';
  } else if (normalizedLevel === 'MEDIUM' || normalizedLevel === 'MED') {
    badgeClass = 'badge-medium';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }} />
      {normalizedLevel}
    </span>
  );
}
