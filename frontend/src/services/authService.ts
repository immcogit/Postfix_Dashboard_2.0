// ============================================
// FILE 1: frontend/src/services/authService.ts
// ============================================
// Path: postfix-dashboard/frontend/src/services/authService.ts

import { config } from '../config';

interface AuthToken {
  token: string;
  expiry: number;
}

class AuthService {
  private tokenKey = config.auth.tokenKey;
  private expiryKey = config.auth.tokenExpiryKey;

  setToken(token: string): void {
    const expiryTime = Date.now() + (config.auth.expiryHours * 60 * 60 * 1000);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiryKey, expiryTime.toString());
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.expiryKey);

    if (!token || !expiry) {
      return null;
    }

    if (Date.now() > parseInt(expiry)) {
      this.clearAuth();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getTokenExpiry(): Date | null {
    const expiry = localStorage.getItem(this.expiryKey);
    if (!expiry) return null;
    return new Date(parseInt(expiry));
  }

  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem(this.expiryKey);
    if (!expiry) return false;
    
    const expiryTime = parseInt(expiry);
    const oneHour = 60 * 60 * 1000;
    return (expiryTime - Date.now()) < oneHour;
  }

  getTimeUntilExpiry(): number {
    const expiry = localStorage.getItem(this.expiryKey);
    if (!expiry) return 0;
    
    const remaining = parseInt(expiry) - Date.now();
    return Math.max(0, remaining);
  }
}

export const authService = new AuthService();
export default authService;
