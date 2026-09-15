import { generateRealtimeAlerts } from './alertsService';
import { vesselsData } from '../data/vesselsData';

const STORAGE_KEY = 'port_alerts_store_v1';
const LISTENERS = new Set();

function emitChange() {
  LISTENERS.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.warn('Alert listener error:', e);
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('port-alerts-updated'));
  }
}

/**
 * Initializes default alerts if not stored yet.
 */
function getInitialAlerts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading alerts from storage:', e);
  }

  // Generate dynamic defaults
  const generated = generateRealtimeAlerts([], vesselsData).map((a, idx) => ({
    ...a,
    read: false,
    acknowledged: false,
    timestamp: a.timestamp || `${(idx + 1) * 3}m ago`
  }));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
  } catch (e) {}

  return generated;
}

let currentAlerts = getInitialAlerts();

export const alertStore = {
  getAlerts() {
    return [...currentAlerts];
  },

  getUnreadCount() {
    return currentAlerts.filter(a => !a.read).length;
  },

  getCriticalCount() {
    return currentAlerts.filter(a => a.type === 'CRITICAL').length;
  },

  markAsRead(id) {
    currentAlerts = currentAlerts.map(a => a.id === id ? { ...a, read: true } : a);
    this.persist();
  },

  markAllAsRead() {
    currentAlerts = currentAlerts.map(a => ({ ...a, read: true }));
    this.persist();
  },

  acknowledgeAlert(id) {
    currentAlerts = currentAlerts.map(a => a.id === id ? { ...a, read: true, acknowledged: true } : a);
    this.persist();
  },

  dismissAlert(id) {
    currentAlerts = currentAlerts.filter(a => a.id !== id);
    this.persist();
  },

  clearAll() {
    currentAlerts = [];
    this.persist();
  },

  resetDefaults(telemetry = [], vessels = []) {
    const newAlerts = generateRealtimeAlerts(telemetry, vessels).map((a, idx) => ({
      ...a,
      read: false,
      acknowledged: false,
      timestamp: a.timestamp || `${(idx + 1) * 2}m ago`
    }));
    currentAlerts = newAlerts;
    this.persist();
  },

  addAlert(alertData) {
    const newAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: alertData.type || 'WARNING',
      severity: alertData.severity || (alertData.type === 'CRITICAL' ? 'critical' : alertData.type === 'NORMAL' ? 'normal' : 'warning'),
      title: alertData.title || 'Port Telemetry Alert',
      message: alertData.message || 'Operational incident logged in port registry.',
      category: alertData.category || 'Operations',
      terminal: alertData.terminal || 'T1',
      timestamp: 'Just now',
      actionLabel: alertData.actionLabel || 'Inspect',
      actionRoute: alertData.actionRoute || '/operations',
      read: false,
      acknowledged: false
    };

    currentAlerts = [newAlert, ...currentAlerts];
    this.persist();
    return newAlert;
  },

  persist() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAlerts));
      }
    } catch (e) {}
    emitChange();
  },

  subscribe(callback) {
    LISTENERS.add(callback);
    return () => {
      LISTENERS.delete(callback);
    };
  }
};

export default alertStore;
