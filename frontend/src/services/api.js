import axios from 'axios';
import { vesselsData } from '../data/vesselsData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present in localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('port_optimizer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Clear session on 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid session if we receive unauthorized
      localStorage.removeItem('port_optimizer_token');
      localStorage.removeItem('port_optimizer_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Normalized helper to get vessels (handles direct array or { count, vessels: [] })
=======
// Normalized helper to get vessels (queries /api/vessels with fallback to /vessels and shared dataset)
export const getVessels = async () => {
  try {
    const res = await client.get('/api/vessels');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    if (res.data && Array.isArray(res.data.vessels) && res.data.vessels.length > 0) {
      return res.data.vessels;
    }
  } catch (err) {
    try {
      const res = await client.get('/vessels');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn('Backend unavailable, utilizing shared vessels dataset fallback:', e);
    }
  }
  return vesselsData;
};

export const getVesselById = async (id) => {
  try {
    const res = await client.get(`/api/vessels/${id}`);
    return res.data;
  } catch (err) {
    const found = vesselsData.find(v => String(v.vessel_id).toUpperCase() === String(id).toUpperCase());
    if (found) return found;
    return vesselsData[0];
  }
};


// Alias for backwards compatibility
export const getVessel = getVesselById;

// Normalized helper to get congestion predictions
export const getCongestion = async () => {
  const res = await client.get('/api/congestion');
  return res.data;
};

export const getTerminalCongestion = async (terminalId) => {
  const res = await client.get(`/api/congestion/${terminalId}`);
  return res.data;
};

// Person 4: Route recommendations
export const getRouteRecommendation = async (vesselId) => {
  const res = await client.get(`/api/routes/${vesselId}`);
  return res.data;
};

export const getAllRouteRecommendations = async () => {
  const res = await client.get('/api/routes');
  return res.data;
};

// Person 4: 72-Hour Operations Plan
export const get72HourOperations = async () => {
  const res = await client.get('/api/operations/72h');
  return res.data;
};
export const getOperations72h = get72HourOperations;

// Person 4: Berth Schedule
export const getBerthSchedule = async () => {
  const res = await client.get('/api/operations/berths');
  return Array.isArray(res.data) ? res.data : (res.data?.berths || res.data?.schedule || []);
};
export const getBerths = getBerthSchedule;

// Person 4: Crane Allocation
export const getCraneAllocation = async () => {
  const res = await client.get('/api/operations/cranes');
  return Array.isArray(res.data) ? res.data : (res.data?.cranes || []);
};
export const getCranes = getCraneAllocation;

export const getOptimizationResult = async (terminalId = null) => {
  const url = terminalId ? `/api/optimize?terminal_id=${terminalId}` : '/optimize';
  const res = await client.get(url);
  return res.data;
};

export const getPlan = async () => {
  const res = await client.get('/plan');
  return res.data;
};

export const getHealth = async () => {
  const res = await client.get('/health');
  return res.data;
};



