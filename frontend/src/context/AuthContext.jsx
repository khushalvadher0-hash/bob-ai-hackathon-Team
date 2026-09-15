import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const TOKEN_KEY = 'port_optimizer_token';
const USER_KEY = 'port_optimizer_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from localStorage on startup / refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify token validity with backend /api/auth/me
          try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            if (res.data) {
              setUser(res.data);
              localStorage.setItem(USER_KEY, JSON.stringify(res.data));
            }
          } catch (err) {
            // If 401 Unauthorized or expired, invalidate local session
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              logout();
            }
          }
        }
      } catch (e) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: email.trim().toLowerCase(),
      password
    });

    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  };

  const signup = async (name, email, password, role = 'supervisor') => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    });

    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
