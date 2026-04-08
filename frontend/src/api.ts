import axios from 'axios';
import type { Product, Country, Tank, AllocationRequest, AllocationResult } from './types';

const API_BASE_URL = "https://iso-tank-allocator.azurewebsites.net";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getFleet = async (): Promise<Tank[]> => {
  const response = await api.get('/api/fleet'); // ✅ FIXED
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/api/products'); // ✅ FIXED
  return response.data;
};

export const getCountries = async (): Promise<Country[]> => {
  const response = await api.get('/api/countries'); // ✅ FIXED
  return response.data;
};

export const calculateAllocation = async (req: AllocationRequest): Promise<AllocationResult[]> => {
  const response = await api.post('/api/allocate', req); // ✅ FIXED
  return response.data;
};

export default api;