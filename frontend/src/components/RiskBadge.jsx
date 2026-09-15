import React from 'react';
import { getStatusBadgeClass } from '../utils/statusHelper';

export default function RiskBadge({ level = 'LOW' }) {
  return (
    <span className={`badge ${getStatusBadgeClass(level)}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }} />
      {level}
    </span>
  );
}
