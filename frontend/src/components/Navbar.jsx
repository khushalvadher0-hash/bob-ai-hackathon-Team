import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin } from 'lucide-react';

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      lineHeight: 1.2
    }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        {timeStr}
      </span>
      <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
        {dateStr}
      </span>
    </div>
  );
}

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
      padding: '0 24px',
      zIndex: 40,
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)'
    }}>
      {/* Title */}
      <div>
        <h1 style={{ 
          fontSize: '0.95rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          letterSpacing: '-0.01em',
          lineHeight: 1.2
        }}>
          Port Operations Dashboard
        </h1>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
          Container Congestion Predictor & Port Operations Optimiser
        </p>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Clock */}
        <LiveClock />

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />

        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          <MapPin size={13} color="var(--color-primary)" />
          <span>Port Hub: Sector 1–4</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            className="btn"
            onClick={onRefresh}
            title="Refresh live data from backend"
            style={{ padding: '5px 11px', fontSize: '0.75rem' }}
          >
            <RefreshCw size={12} />
            <span>Sync</span>
          </button>
        )}

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.7rem',
            flexShrink: 0
          }}>
            SO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Shift Supervisor
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Terminal Command
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
