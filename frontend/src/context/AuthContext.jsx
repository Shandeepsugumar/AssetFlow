import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: user.role
      ? user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : user.role
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session bootstrap — rehydrate user from stored token on mount
  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('assetflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        setToken(storedToken);
        const result = await authApi.getMe();
        if (result.success && result.data?.user) {
          setUser(normalizeUser(result.data.user));
        } else {
          localStorage.removeItem('assetflow_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('assetflow_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    if (result.success && result.data) {
      localStorage.setItem('assetflow_token', result.data.token);
      setToken(result.data.token);
      setUser(normalizeUser(result.data.user));
    }
    return result;
  }, []);

  const signup = useCallback(async (data) => {
    const result = await authApi.signup(data);
    if (result.success && result.data) {
      localStorage.setItem('assetflow_token', result.data.token);
      setToken(result.data.token);
      setUser(normalizeUser(result.data.user));
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('assetflow_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
