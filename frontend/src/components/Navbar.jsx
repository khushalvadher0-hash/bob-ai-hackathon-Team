import React from 'react';
import { RefreshCw, Bell, MapPin, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ onRefresh }) {
  return (
    <header style={{
      height: 'var(--navbar-height)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 40,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    }}>
      {/* Title & Tagline */}
      <div>
        <h1 style={{ 
          fontSize: '1.05rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          letterSpacing: '-0.01em',
          lineHeight: 1.2
        }}>
          Port Operations Dashboard
        </h1>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Predict • Optimise • Keep Global Trade Moving
        </p>
      </div>

      {/* Right Controls / Location / User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onRefresh && (
          <button
            className="btn"
            onClick={onRefresh}
            title="Refresh live data from backend"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem'
            }}
          >
            <RefreshCw size={13} />
            <span>Sync Live State</span>
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#f1f5f9',
          border: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}>
          <MapPin size={13} color="var(--color-primary)" />
          <span style={{ fontWeight: 600 }}>Port Hub: Sector 1-4</span>
        </div>

        {/* User Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '14px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.75rem',
            border: '1px solid #bae6fd'
          }}>
            SO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Shift Supervisor
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Terminal Command
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
