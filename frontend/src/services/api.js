import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalized helper to get vessels (handles direct array or { count, vessels: [] })
export const getVessels = async () => {
  const res = await client.get('/api/vessels');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  if (res.data && Array.isArray(res.data.vessels)) {
    return res.data.vessels;
  }
  return [];
};

export const getVesselById = async (id) => {
  const res = await client.get(`/api/vessels/${id}`);
  return res.data;
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

export const getHealth = async () => {
  const res = await client.get('/health');
  return res.data;
};

