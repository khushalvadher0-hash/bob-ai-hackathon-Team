import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ship, 
  Activity, 
  GitFork, 
  CalendarClock,
  Bell
} from 'lucide-react';

import alertStore from '../services/alertStore';

export default function Sidebar() {
  const [unreadCount, setUnreadCount] = useState(alertStore.getUnreadCount());

  React.useEffect(() => {
    return alertStore.subscribe(() => {
      setUnreadCount(alertStore.getUnreadCount());
    });
  }, []);

  const mainNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vessels', label: 'Vessels', icon: Ship },
    { to: '/congestion', label: 'Congestion', icon: Activity },
    { to: '/routing', label: 'Routing', icon: GitFork },
    { to: '/operations', label: 'Operations', icon: CalendarClock },
    { to: '/alerts', label: 'Alerts', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null },
  ];


  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflow: 'hidden'
    }}>
      {/* Brand Header */}
      <div style={{
        height: 'var(--navbar-height)',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        flexShrink: 0
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '1rem',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
        }}>
          ⚓
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h2 style={{ 
            fontSize: '0.88rem', 
            fontWeight: 700, 
            letterSpacing: '-0.01em', 
            color: '#f1f5f9',
            whiteSpace: 'nowrap'
          }}>
            Port Optimizer
          </h2>
          <p style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
            Smarter Ports · Smoother Flow
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: '16px 10px 16px 10px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'auto' }}>
        <div style={{ 
          fontSize: '0.62rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          color: '#334155', 
          padding: '0 10px 10px 10px' 
        }}>
          Navigation
        </div>

        {mainNavItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/dashboard'}
            className="nav-item"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.83rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
              transition: 'all 0.12s ease',
              position: 'relative',
              boxShadow: isActive ? '0 2px 8px rgba(29, 78, 216, 0.35)' : 'none',
              borderLeft: isActive ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent'
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                  <span style={{ letterSpacing: '0.01em' }}>{label}</span>
                </div>
                {badge && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '9999px'
                  }}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

      </nav>

      {/* Sidebar Footer Live Status */}
      <div style={{ 
        padding: '14px 16px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.06)', 
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
          <span style={{ 
            width: '7px', 
            height: '7px', 
            borderRadius: '50%', 
            backgroundColor: '#10b981',
            boxShadow: '0 0 7px rgba(16, 185, 129, 0.7)',
            flexShrink: 0
          }} />
          <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600 }}>Operational</span>
        </div>
        <p style={{ fontSize: '0.67rem', color: '#475569', marginTop: '1px' }}>
          Real-Time Multi-Terminal Feed
        </p>
        <p style={{ fontSize: '0.65rem', color: '#334155', marginTop: '2px' }}>
          Planning Horizon: 72 Hours
        </p>
      </div>
    </aside>
  );
}
