import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ship, 
  Activity, 
  GitFork, 
  CalendarClock 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vessels', label: 'Vessels', icon: Ship },
    { to: '/congestion', label: 'Congestion', icon: Activity },
    { to: '/routing', label: 'Routing', icon: GitFork },
    { to: '/operations', label: 'Operations', icon: CalendarClock },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(11, 19, 41, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{
        height: 'var(--navbar-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#070c1a',
          fontWeight: 800,
          fontSize: '1.1rem'
        }}>
          ⚓
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>PortOps AI</h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Shift Control System</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
              transition: 'all 0.2s ease'
            })}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Port Network Live</span>
        </div>
        <span>Simulation Horizon: 72h</span>
      </div>
    </aside>
  );
}
