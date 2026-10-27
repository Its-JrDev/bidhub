'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, AuthUser } from '@/features/auth/store';

export function useCurrentUser() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(!user);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return;
        }
      }
      clearUser();
    } catch {
      clearUser();
    } finally {
      setLoading(false);
    }
  }, [setUser, clearUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearUser();
      router.push('/login');
      router.refresh();
    }
  }, [clearUser, router]);

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    logout,
    refetch: fetchUser,
  };
}
