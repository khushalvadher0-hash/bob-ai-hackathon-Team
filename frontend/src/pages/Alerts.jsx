import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Filter,
  Search,
  Plus,
  X,
  Sparkles,
  Zap,
  Trash2,
  Check,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCongestion, getVessels } from '../services/api';
import { vesselsData } from '../data/vesselsData';
import alertStore from '../services/alertStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { cleanText } from '../utils/cleanText';

export default function Alerts() {
  const [alerts, setAlerts] = useState(alertStore.getAlerts());
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'CRITICAL', 'WARNING', 'NORMAL'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);
  const [autoMonitor, setAutoMonitor] = useState(true);

  // New Incident Form State
  const [newIncident, setNewIncident] = useState({
    title: '',
    type: 'WARNING',
    terminal: 'T1',
    category: 'Congestion',
    message: ''
  });

  const navigate = useNavigate();

  // Subscribe to alertStore events
  useEffect(() => {
    const unsub = alertStore.subscribe(() => {
      setAlerts(alertStore.getAlerts());
    });
    return unsub;
  }, []);

  // Background Telemetry Sync
  const syncTelemetry = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [cData, vData] = await Promise.all([
        getCongestion().catch(() => []),
        getVessels().catch(() => vesselsData)
      ]);
      alertStore.resetDefaults(
        Array.isArray(cData) ? cData : [],
        Array.isArray(vData) && vData.length > 0 ? vData : vesselsData
      );
      if (isManual) {
        showToast('Alerts synchronized with live port telemetry.');
      }
    } catch (err) {
      console.error('Failed to sync alerts telemetry:', err);
    } finally {
      if (isManual) setRefreshing(false);
    }
  };

  const showToast = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Simulate dynamic port incident
  const handleSimulateLiveEvent = () => {
    const scenarios = [
      {
        title: 'Sudden Wind Advisory: Sector 2',
        message: 'Wind gusts exceeding 38 knots in Sector 2. Container STS crane hoisting speeds throttled 40% for safety.',
        type: 'WARNING',
        severity: 'warning',
        terminal: 'T2',
        category: 'Weather',
        actionLabel: 'Check Weather',
        actionRoute: '/operations'
      },
      {
        title: 'Emergency Rerouting Alert: COSCO Universe',
        message: 'Berth queue congestion at Terminal T1 exceeds 8h threshold. ML router recommends diversion to Terminal T3.',
        type: 'CRITICAL',
        severity: 'critical',
        terminal: 'T1',
        category: 'Congestion',
        actionLabel: 'Reroute Now',
        actionRoute: '/routing'
      },
      {
        title: 'Quay Crane 04 Hydraulic Saturation',
        message: 'Hydraulic temperature warning logged on Crane QC-04 at East Pier. Operating capacity capped at 75%.',
        type: 'WARNING',
        severity: 'warning',
        terminal: 'T2',
        category: 'Crane Saturation',
        actionLabel: 'Inspect Cranes',
        actionRoute: '/operations'
      },
      {
        title: 'Deepwater Berth B04 Clearance Complete',
        message: 'Vessel turnaround finished 40 minutes ahead of schedule. Berth B04 available for incoming container vessel.',
        type: 'NORMAL',
        severity: 'normal',
        terminal: 'T3',
        category: 'Port Flow',
        actionLabel: 'View Berths',
        actionRoute: '/operations'
      }
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    alertStore.addAlert(randomScenario);
    showToast(`New dynamic incident logged: "${randomScenario.title}"`);
  };

  // Broadcast Incident Submit
  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!newIncident.title.trim() || !newIncident.message.trim()) {
      alert('Please enter a valid title and message.');
      return;
    }

    alertStore.addAlert({
      title: newIncident.title.trim(),
      message: newIncident.message.trim(),
      type: newIncident.type,
      severity: newIncident.type === 'CRITICAL' ? 'critical' : newIncident.type === 'NORMAL' ? 'normal' : 'warning',
      terminal: newIncident.terminal,
      category: newIncident.category,
      actionLabel: 'Inspect Incident',
      actionRoute: newIncident.category === 'Congestion' ? '/routing' : '/operations'
    });

    setShowBroadcastModal(false);
    showToast(`Incident "${newIncident.title}" broadcasted across Port Centre.`);
    setNewIncident({
      title: '',
      type: 'WARNING',
      terminal: 'T1',
      category: 'Congestion',
      message: ''
    });
  };

  const handleMarkAllRead = () => {
    alertStore.markAllAsRead();
    showToast('All notifications marked as read. Navbar badge cleared.');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications from the registry?')) {
      alertStore.clearAll();
      showToast('All alerts cleared.');
    }
  };

  // Filtered & Searched alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesSearch = !searchTerm || 
        (a.title && a.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.message && a.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.terminal && a.terminal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.category && a.category.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filter === 'ALL') return true;
      if (filter === 'UNREAD') return !a.read;
      return a.type === filter;
    });
  }, [alerts, filter, searchTerm]);

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.type === 'WARNING').length;
  const normalCount = alerts.filter(a => a.type === 'NORMAL').length;

  if (loading) return <LoadingSpinner message="Scanning Port Subsystems & Compiling Real-Time Alerts..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {successNotice && (
        <div style={{
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Header with Dynamic Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Bell size={22} color="var(--color-primary)" />
            Port Alert &amp; Incident Command Centre
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
            Real-time telemetry surveillance: Bottleneck alarms, vessel queue delays, and quay crane saturation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Live Sim Button */}
          <button
            className="btn"
            onClick={handleSimulateLiveEvent}
            title="Inject simulated dynamic port incident"
            style={{ fontSize: '0.78rem', padding: '6px 12px', borderColor: '#8b5cf6', color: '#7c3aed', backgroundColor: '#f5f3ff' }}
          >
            <Sparkles size={13} color="#7c3aed" />
            <span>Simulate Incident</span>
          </button>

          {/* Broadcast Incident Button */}
          <button
            className="btn btn-primary"
            onClick={() => setShowBroadcastModal(true)}
            style={{ fontSize: '0.78rem', padding: '6px 13px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Plus size={14} />
            <span>Broadcast Incident</span>
          </button>

          {/* Sync Telemetry */}
          <button
            className="btn"
            onClick={() => syncTelemetry(true)}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>Sync</span>
          </button>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              className="btn"
              onClick={handleMarkAllRead}
              title="Mark all notifications as read"
              style={{ fontSize: '0.78rem', padding: '6px 11px', color: 'var(--color-primary)' }}
            >
              <Check size={13} />
              <span>Mark All Read</span>
            </button>
          )}

          {/* Clear All */}
          {alerts.length > 0 && (
            <button
              className="btn"
              onClick={handleClearAll}
              title="Clear all alerts from feed"
              style={{ fontSize: '0.78rem', padding: '6px 11px', color: '#ef4444', borderColor: '#fca5a5' }}
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Severity KPI Cards (Clickable to Filter) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Active */}
        <div 
          className="glass-panel" 
          onClick={() => setFilter('ALL')}
          style={{ 
            padding: '16px 20px', 
            borderLeft: '4px solid var(--color-primary)',
            cursor: 'pointer',
            backgroundColor: filter === 'ALL' ? '#f0f7ff' : '#ffffff',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL ALERTS</span>
            <Bell size={16} color="var(--color-primary)" />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {alerts.length} Active
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
          </span>
        </div>

        {/* Critical (Red) */}
        <div 
          className="glass-panel" 
          onClick={() => setFilter('CRITICAL')}
          style={{ 
            padding: '16px 20px', 
            borderLeft: '4px solid #ef4444', 
            backgroundColor: filter === 'CRITICAL' ? '#fee2e2' : '#fef2f2',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c' }}>CRITICAL (RED)</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
            {criticalCount} Incidents
          </p>
          <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>Immediate rerouting recommended</span>
        </div>

        {/* Warning (Yellow) */}
        <div 
          className="glass-panel" 
          onClick={() => setFilter('WARNING')}
          style={{ 
            padding: '16px 20px', 
            borderLeft: '4px solid #f59e0b', 
            backgroundColor: filter === 'WARNING' ? '#fef3c7' : '#fffbeb',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>WARNING (YELLOW)</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {warningCount} Warnings
          </p>
          <span style={{ fontSize: '0.72rem', color: '#b45309' }}>Berth delays &amp; crane load</span>
        </div>

        {/* Normal (Green) */}
        <div 
          className="glass-panel" 
          onClick={() => setFilter('NORMAL')}
          style={{ 
            padding: '16px 20px', 
            borderLeft: '4px solid #10b981', 
            backgroundColor: filter === 'NORMAL' ? '#d1fae5' : '#ecfdf5',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>NORMAL (GREEN)</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {normalCount} Stable
          </p>
          <span style={{ fontSize: '0.72rem', color: '#047857' }}>Uncongested terminal hubs</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Severity Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#ffffff',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          <Filter size={13} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
          
          <button
            onClick={() => setFilter('ALL')}
            style={{
              border: 'none',
              background: filter === 'ALL' ? 'var(--color-primary)' : 'transparent',
              color: filter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All ({alerts.length})
          </button>

          <button
            onClick={() => setFilter('UNREAD')}
            style={{
              border: 'none',
              background: filter === 'UNREAD' ? '#3b82f6' : 'transparent',
              color: filter === 'UNREAD' ? '#ffffff' : '#2563eb',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setFilter('CRITICAL')}
            style={{
              border: 'none',
              background: filter === 'CRITICAL' ? '#ef4444' : 'transparent',
              color: filter === 'CRITICAL' ? '#ffffff' : '#b91c1c',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Critical ({criticalCount})
          </button>

          <button
            onClick={() => setFilter('WARNING')}
            style={{
              border: 'none',
              background: filter === 'WARNING' ? '#f59e0b' : 'transparent',
              color: filter === 'WARNING' ? '#ffffff' : '#b45309',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Warning ({warningCount})
          </button>

          <button
            onClick={() => setFilter('NORMAL')}
            style={{
              border: 'none',
              background: filter === 'NORMAL' ? '#10b981' : 'transparent',
              color: filter === 'NORMAL' ? '#ffffff' : '#047857',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Normal ({normalCount})
          </button>
        </div>

        {/* Search Box */}
        <div style={{
          position: 'relative',
          minWidth: '280px',
          flex: '0 1 320px'
        }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Filter by keyword, terminal, incident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 30px 7px 30px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Alerts Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>No active alerts in this view.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>All port terminal subsystems operating inside nominal safety thresholds.</p>
            <button
              className="btn btn-primary"
              onClick={handleSimulateLiveEvent}
              style={{ marginTop: '14px', fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <Sparkles size={13} />
              <span>Simulate Incident</span>
            </button>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCrit = alert.type === 'CRITICAL';
            const isWarn = alert.type === 'WARNING';
            const isNorm = alert.type === 'NORMAL';

            const borderColor = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
            const bgColor = isCrit ? '#fef2f2' : isWarn ? '#fffbeb' : '#ecfdf5';
            const titleColor = isCrit ? '#991b1b' : isWarn ? '#92400e' : '#065f46';
            const badgeBg = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';

            return (
              <div
                key={alert.id}
                className="glass-panel"
                style={{
                  padding: '18px 22px',
                  borderLeft: `5px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '14px',
                  transition: 'transform 0.15s ease',
                  opacity: alert.acknowledged ? 0.8 : 1
                }}
              >
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {/* Unread Indicator */}
                    {!alert.read && (
                      <span style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        letterSpacing: '0.05em'
                      }}>
                        NEW
                      </span>
                    )}

                    {alert.acknowledged && (
                      <span style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '9999px'
                      }}>
                        ACKNOWLEDGED
                      </span>
                    )}

                    <span style={{
                      backgroundColor: badgeBg,
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}>
                      {alert.type}
                    </span>

                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Terminal: <strong>{alert.terminal || 'All'}</strong>
                    </span>

                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      • Category: <strong>{alert.category || 'Operations'}</strong>
                    </span>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      • {alert.timestamp || alert.time || 'recent'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
                    {alert.title}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {alert.message || alert.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Action Link Button */}
                  {alert.actionRoute && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        alertStore.markAsRead(alert.id);
                        navigate(alert.actionRoute);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        backgroundColor: borderColor,
                        borderColor: borderColor
                      }}
                    >
                      <span>{alert.actionLabel || 'Inspect'}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {/* Acknowledge Button */}
                  {!alert.acknowledged && (
                    <button
                      className="btn"
                      onClick={() => alertStore.acknowledgeAlert(alert.id)}
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                      title="Acknowledge alert without removing"
                    >
                      <Check size={12} />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {/* Dismiss Button */}
                  <button
                    className="btn"
                    onClick={() => alertStore.dismissAlert(alert.id)}
                    style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#ef4444' }}
                    title="Dismiss alert completely"
                  >
                    <X size={12} />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Incident Modal */}
      {showBroadcastModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Broadcast Live Port Incident
                </h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Berth B03 Crane Breakdown"
                  value={newIncident.title}
                  onChange={e => setNewIncident({ ...newIncident, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>
                    Severity Level *
                  </label>
                  <select
                    value={newIncident.type}
                    onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="CRITICAL">CRITICAL (Red)</option>
                    <option value="WARNING">WARNING (Yellow)</option>
                    <option value="NORMAL">NORMAL (Green)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>
                    Terminal Sector *
                  </label>
                  <select
                    value={newIncident.terminal}
                    onChange={e => setNewIncident({ ...newIncident, terminal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="T1">Terminal T1 (North)</option>
                    <option value="T2">Terminal T2 (East Pier)</option>
                    <option value="T3">Terminal T3 (South)</option>
                    <option value="T4">Terminal T4 (Feeder)</option>
                    <option value="ALL">All Port Sectors</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>
                  Category
                </label>
                <select
                  value={newIncident.category}
                  onChange={e => setNewIncident({ ...newIncident, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Congestion">Congestion</option>
                  <option value="Delay Risk">Delay Risk</option>
                  <option value="Crane Saturation">Crane Saturation</option>
                  <option value="Weather">Weather Advisory</option>
                  <option value="Port Flow">Port Flow</option>
                  <option value="Security">Security &amp; Safety</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>
                  Incident Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide operational details, vessel impact, and mitigation recommendations..."
                  value={newIncident.message}
                  onChange={e => setNewIncident({ ...newIncident, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowBroadcastModal(false)}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 16px' }}
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
