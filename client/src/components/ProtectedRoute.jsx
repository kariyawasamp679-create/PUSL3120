import React from 'react';
import { Navigate, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';


export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse-slow" style={{ color: 'var(--primary-400)', fontSize: '1.2rem', fontWeight: 600 }}>
            Authenticating MediPulse session...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="app-container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: '#f43f5e', marginBottom: '1rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your account ({user?.role}) does not have administrative permissions for this portal.
          </p>
          <a href="/" className="btn btn-primary">Return to Homepage</a>
        </div>
      </div>
    );
  }

  return children;
}
