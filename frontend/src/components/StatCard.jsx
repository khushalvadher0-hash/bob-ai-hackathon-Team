import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--color-primary)' }) {
  return (
    <div className="glass-panel" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {value}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div style={{
            background: `rgba(${color === 'var(--color-primary)' ? '56, 189, 248' : '249, 115, 22'}, 0.12)`,
            color: color,
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} />
          </div>
        )}
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`
      }} />
    </div>
  );
}
