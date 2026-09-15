import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getVessels = async () => {
  const res = await client.get('/api/vessels');
  return res.data;
};

export const getVessel = async (id) => {
  const res = await client.get(`/api/vessels/${id}`);
  return res.data;
};

export const getCongestion = async () => {
  const res = await client.get('/api/congestion');
  return res.data;
};

export const getTerminalCongestion = async (id) => {
  const res = await client.get(`/api/congestion/${id}`);
  return res.data;
};

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
