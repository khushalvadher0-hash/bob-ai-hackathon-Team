import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'var(--color-primary)',
  accentBg
}) {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '16px 18px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.78rem', 
          fontWeight: 600,
          lineHeight: 1.2
        }}>
          {title}
        </p>
        {Icon && (
          <div style={{
            backgroundColor: accentBg || 'var(--color-primary-light)',
            color: color,
            padding: '7px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div>
        <div style={{ 
          fontSize: '1.65rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '4px'
        }}>
          {value}
        </div>
        {subtitle && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
