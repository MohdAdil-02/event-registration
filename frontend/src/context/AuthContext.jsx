import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gate_token');
    const savedUser = localStorage.getItem('gate_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem('gate_token', token);
    localStorage.setItem('gate_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    persistSession(data.token, data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await client.post('/auth/register', { name, email, password });
    persistSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('gate_token');
    localStorage.removeItem('gate_user');
    setUser(null);
  };

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isOrganizer, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
