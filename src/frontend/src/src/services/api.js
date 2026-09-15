import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalized helper to handle array or { count, vessels: [] }
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

// Aliased for backwards compatibility
export const getVessel = getVesselById;

// Normalized helper to handle array or { count, predictions: [] }
export const getCongestion = async () => {
  const res = await client.get('/api/congestion');
  if (Array.isArray(res.data)) {
    return res.data;
  }
  if (res.data && Array.isArray(res.data.predictions)) {
    return res.data.predictions;
  }
  if (res.data && Array.isArray(res.data.terminals)) {
    return res.data.terminals;
  }
  return [];
};

export const getTerminalCongestion = async (terminalId) => {
  const res = await client.get(`/api/congestion/${terminalId}`);
  return res.data;
};

// Functions for Person 4 future integration
export const getRouteRecommendation = async (vesselId) => {
  const res = await client.get(`/api/routes/${vesselId}`);
  return res.data;
};

export const getOperations72h = async () => {
  const res = await client.get('/api/operations/72h');
  return res.data;
};

export const getBerths = async () => {
  const res = await client.get('/api/operations/berths');
  return res.data;
};

export const getCranes = async () => {
  const res = await client.get('/api/operations/cranes');
  return res.data;
};

export const getHealth = async () => {
  const res = await client.get('/health');
  return res.data;
};
