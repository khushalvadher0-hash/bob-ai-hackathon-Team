import React from 'react';
import { Bell, RefreshCw, Anchor } from 'lucide-react';

export default function Navbar({ onRefresh }) {
  return (
    <header style={{
      height: 'var(--navbar-height)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      background: 'rgba(11, 19, 41, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          padding: '8px',
          borderRadius: '8px',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Anchor size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Port Operations Optimiser
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Container Congestion Predictor & Shift Command Dashboard
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onRefresh && (
          <button
            className="btn"
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              fontSize: '0.8rem'
            }}
          >
            <RefreshCw size={14} />
            <span>Sync Live Port State</span>
          </button>
        )}

        <div style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444'
          }} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#fff'
          }}>
            SO
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Shift Supervisor</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--status-low)' }}>● Operations Online</p>
          </div>
        </div>
      </div>
    </header>
  );
}
