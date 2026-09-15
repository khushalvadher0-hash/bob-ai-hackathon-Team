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
        position: 'relative',
        borderTop: `3px solid ${color}`,
        minHeight: '100px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.73rem', 
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.2
        }}>
          {title}
        </p>
        {Icon && (
          <div style={{
            backgroundColor: accentBg || 'var(--color-primary-light)',
            color: color,
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={15} />
          </div>
        )}
      </div>

      <div>
        <div style={{ 
          fontSize: '1.6rem', 
          fontWeight: 800, 
          color: 'var(--text-primary)', 
          letterSpacing: '-0.025em',
          lineHeight: 1,
          marginBottom: '5px'
        }}>
          {value}
        </div>
        {subtitle && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', lineHeight: 1.3 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
