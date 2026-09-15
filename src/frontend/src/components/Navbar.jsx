import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';

export default function Navbar({ onRefresh }) {
  return (
    <header style={{
      height: 'var(--navbar-height)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      background: 'rgba(11, 19, 41, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 40
    }}>
      <div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Port Metro Operations Command
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Real-Time Predictor & Resource Optimizer
        </p>
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
              padding: '6px 12px'
            }}
          >
            <RefreshCw size={14} />
            <span style={{ fontSize: '0.8rem' }}>Sync Port State</span>
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
            background: 'linear-gradient(135deg, #0284c7 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            SO
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Shift Supervisor</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Duty</p>
          </div>
        </div>
      </div>
    </header>
  );
}
