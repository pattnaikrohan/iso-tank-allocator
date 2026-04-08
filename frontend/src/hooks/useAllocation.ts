import { useState, useEffect, useCallback } from 'react';
import type { Product, Country, Tank, AllocationRequest, AllocationResult } from '../types';
import { getFleet, getProducts, getCountries, calculateAllocation } from '../api';

export const useAllocation = () => {
  const [fleet, setFleet] = useState<Tank[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [results, setResults] = useState<AllocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, p, c] = await Promise.all([getFleet(), getProducts(), getCountries()]);
        setFleet(f);
        setProducts(p);
        setCountries(c);
      } catch (err) {
        setError('Failed to fetch reference data');
      }
    };
    fetchData();
  }, []);

  const runAllocation = useCallback(async (req: AllocationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculateAllocation(req);
      setResults(res);
    } catch (err) {
      setError('Allocation calculation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { fleet, products, countries, results, loading, error, runAllocation, setResults };
};
