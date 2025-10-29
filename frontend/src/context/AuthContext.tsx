// ============================================
// FILE: frontend/src/context/AuthContext.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';
import apiService from '../services/apiService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  tokenExpiry: Date | null;
  isTokenExpiringSoon: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.isAuthenticated();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(() => {
    return authService.getTokenExpiry();
  });
  const [isTokenExpiringSoon, setIsTokenExpiringSoon] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkExpiry = () => {
      setIsTokenExpiringSoon(authService.isTokenExpiringSoon());
      setTokenExpiry(authService.getTokenExpiry());
      
      if (!authService.isAuthenticated()) {
        logout();
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{ message: string; token?: string }>('/api/login', {
        email,
        password,
      });

      const token = response.token || btoa(`${email}:${Date.now()}`);
      authService.setToken(token);
      
      setIsAuthenticated(true);
      setTokenExpiry(authService.getTokenExpiry());
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.clearAuth();
    setIsAuthenticated(false);
    setTokenExpiry(null);
    setIsTokenExpiringSoon(false);
    window.location.href = '/';
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    tokenExpiry,
    isTokenExpiringSoon,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;