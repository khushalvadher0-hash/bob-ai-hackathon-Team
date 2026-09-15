import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, MapPin, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || 'Shift Supervisor';
  const roleName = user?.role === 'supervisor' ? 'Terminal Command' : (user?.role ? user.role.toUpperCase() : 'Terminal Command');
  
  // Get initials
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SO';

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

        {/* User Pill with Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: dropdownOpen ? 'var(--bg-card-subtle)' : 'transparent',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
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
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {displayName}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {roleName}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease'
            }} />
          </button>

          {/* User Menu Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '210px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '6px',
              zIndex: 50
            }}>
              <div style={{
                padding: '8px 10px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '4px'
              }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {user?.email || 'supervisor@port.gov'}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--status-critical-text)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-critical-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={14} color="var(--status-critical-text)" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
