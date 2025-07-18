import bcrypt from 'bcryptjs';
import { Admin } from '../types';

const AUTH_TOKEN_KEY = 'desa_auth_token';
const ADMIN_KEY = 'desa_admin_data';

// Hash password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password using bcrypt
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Token management
export const setAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const tokenData = parseToken(token);
    if (!tokenData) return false;
    
    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - tokenData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return tokenAge < maxAge;
  } catch {
    return false;
  }
};

// Admin data management
export const setAdminData = (admin: Admin) => {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const getAdminData = (): Admin | null => {
  try {
    const adminData = localStorage.getItem(ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  } catch {
    return null;
  }
};

// JWT-like token generation (simple implementation)
export const generateToken = (admin: Admin): string => {
  const payload = {
    id: admin.id,
    email: admin.email,
    nama: admin.nama,
    timestamp: Date.now()
  };
  
  return btoa(JSON.stringify(payload));
};

export const parseToken = (token: string): { id: number; email: string; nama: string; timestamp: number } | null => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

// Role-based access control
export const hasPermission = (requiredRole: string = 'admin'): boolean => {
  return isAuthenticated(); // Simple implementation - all authenticated users are admins
};

// Auto logout on token expiry
export const checkTokenExpiry = () => {
  if (!isAuthenticated()) {
    removeAuthToken();
    window.location.href = '/admin/login';
  }
};

// Initialize auth check
export const initializeAuth = () => {
  // Check token expiry every 5 minutes
  setInterval(checkTokenExpiry, 5 * 60 * 1000);
};