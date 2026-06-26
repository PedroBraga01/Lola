import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMe();
      setUser(data.user);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(null); // Not an error if not logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    window.location.href = api.getAuthUrl();
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return { user, loading, error, login, logout, checkAuth };
}

export default useAuth;
