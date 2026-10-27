'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    auctions: number;
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data.categories || data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar categorías');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setCategories(data.categories || data.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || 'Error al conectar');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
}
