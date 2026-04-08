import axios from 'axios';
import type { Product, Country, Tank, AllocationRequest, AllocationResult } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getFleet = async (): Promise<Tank[]> => {
  const response = await api.get('/fleet');
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const getCountries = async (): Promise<Country[]> => {
  const response = await api.get('/countries');
  return response.data;
};

export const calculateAllocation = async (req: AllocationRequest): Promise<AllocationResult[]> => {
  const response = await api.post('/allocate', req);
  return response.data;
};

export default api;
