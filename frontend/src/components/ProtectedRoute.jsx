import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-workspace)',
        color: 'var(--text-secondary)',
        gap: '16px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}>
          <Anchor size={24} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Authenticating Port Operations Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
