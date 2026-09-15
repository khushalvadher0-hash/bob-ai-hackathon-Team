import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, MapPin, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, MapPin, Bell, ArrowRight, X, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import alertStore from '../services/alertStore';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState(alertStore.getAlerts());
  const [unreadCount, setUnreadCount] = useState(alertStore.getUnreadCount());
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = alertStore.subscribe(() => {
      setAlerts(alertStore.getAlerts());
      setUnreadCount(alertStore.getUnreadCount());
    });
    return unsub;
  }, []);

  // Close notifications popover on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
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
  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadCount > 0) {
      // Clear unread badge as soon as user opens/sees notifications
      alertStore.markAllAsRead();
    }
  };

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
          Port Management System
        </h1>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
          Port Operations Community & Intelligent Congestion Optimizer
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

        {/* Top-Right Notifications Bell with Dynamic Badge & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="btn"
            onClick={handleToggleNotifications}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
            style={{
              padding: '6px 10px',
              position: 'relative',
              backgroundColor: showNotifications ? '#f1f5f9' : '#ffffff',
              borderColor: showNotifications ? 'var(--color-primary)' : 'var(--border-color)',
              cursor: 'pointer'
            }}
          >
            <Bell size={15} color={unreadCount > 0 ? 'var(--color-primary)' : 'var(--text-primary)'} />
            {/* Dynamic Badge: Clears completely after viewing */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 800,
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px #ffffff'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '340px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.18)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} color="var(--color-primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    Port Real-Time Alerts
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {alerts.length > 0 && (
                    <button
                      onClick={() => alertStore.clearAll()}
                      title="Clear all alerts"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 4px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={11} />
                      <span>Clear All</span>
                    </button>
                  )}
                  <span style={{
                    fontSize: '0.65rem',
                    backgroundColor: alerts.length > 0 ? '#fee2e2' : '#ecfdf5',
                    color: alerts.length > 0 ? '#b91c1c' : '#047857',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '9999px'
                  }}>
                    {alerts.length > 0 ? `${alerts.length} Active` : 'All Clear'}
                  </span>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      All Caught Up!
                    </p>
                    <p style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                      No active or unread alerts in port telemetry.
                    </p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        alertStore.markAsRead(alert.id);
                        navigate(alert.actionRoute || '/alerts');
                      }}
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: alert.type === 'CRITICAL' ? '#ef4444' : alert.type === 'NORMAL' ? '#10b981' : '#f59e0b',
                            flexShrink: 0
                          }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {alert.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
                            {alert.timestamp || alert.time || 'now'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alertStore.dismissAlert(alert.id);
                            }}
                            title="Dismiss alert"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '3px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '13px', marginTop: '2px', lineHeight: 1.35 }}>
                        {alert.message || alert.desc}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View All Alerts Command Centre</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

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
              Port Operations Centre
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
