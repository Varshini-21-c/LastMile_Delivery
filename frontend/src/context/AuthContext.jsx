import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('delivery_jwt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      } else {

        try {
          const authRes = await api.login({ email: 'customer.rohit@gmail.com', password: 'customer123' });
          localStorage.setItem('delivery_jwt_token', authRes.token);
          setToken(authRes.token);
          setUser(authRes.user);
        } catch (e) {
          console.warn('Backend not yet reachable on startup', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('delivery_jwt_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      localStorage.setItem('delivery_jwt_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('delivery_jwt_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role) => {
    setLoading(true);
    try {
      let credentials = { email: 'customer.rohit@gmail.com', password: 'customer123' };
      if (role === 'ROLE_ADMIN') {
        credentials = { email: 'admin@delivery.com', password: 'admin123' };
      } else if (role === 'ROLE_AGENT') {
        credentials = { email: 'agent.rajesh@delivery.com', password: 'agent123' };
      }
      const res = await api.login(credentials);
      localStorage.setItem('delivery_jwt_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Demo switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await api.getCurrentUser();
      setUser(u);
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
