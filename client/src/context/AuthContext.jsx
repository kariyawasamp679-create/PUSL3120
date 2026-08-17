import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('medipulse_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid');
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(userData);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updates) => {
    const res = await authService.updateProfile(updates);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  // Demo 1-Click Quick Login
  const loginDemoAccount = async (roleType) => {
    const accounts = {
      admin: { email: 'admin@medipulse.com', password: 'Password123!' },
      doctor: { email: 'dr.sarah@medipulse.com', password: 'Password123!' },
      dentist: { email: 'dr.marcus@medipulse.com', password: 'Password123!' },
      gp: { email: 'dr.emily@medipulse.com', password: 'Password123!' },
      patient: { email: 'jane.doe@example.com', password: 'Password123!' }
    };

    const target = accounts[roleType] || accounts.patient;
    return await login(target.email, target.password);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    role: user?.role || 'guest',
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    loginDemoAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
