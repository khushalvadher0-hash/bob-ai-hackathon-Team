import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ship, 
  Activity, 
  GitFork, 
  CalendarClock,
  Radio,
  Sliders,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const mainNavItems = [
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
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{
        height: 'var(--navbar-height)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          ⚓
        </div>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff' }}>
            Port Optimizer
          </h2>
          <p style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.01em' }}>
            Smarter Ports. Smoother Flow.
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: '#64748b', 
          padding: '0 12px 8px 12px' 
        }}>
          Core Operations
        </div>

        {mainNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
              transition: 'all 0.15s ease'
            })}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Live Status */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
        backgroundColor: 'rgba(0, 0, 0, 0.2)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--status-low)',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
          }} />
          <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 600 }}>Port Status: Operational</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
          Real-Time Multi-Terminal Feed
        </p>
        <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
          Planning Horizon: 72 Hours
        </p>
      </div>
    </aside>
  );
}
