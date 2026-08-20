import React from 'react';
import { Link } from '../components/Router';
import { Activity, Home } from '../components/Icons';

export default function NotFound() {
  return (
    <div className="app-container" style={{ padding: '5rem 1rem', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', maxWidth: '500px', borderRadius: '10px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '8px',
            background: 'var(--primary-50)',
            color: 'var(--primary-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}
        >
          <Activity size={28} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-500)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          The page you requested does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1.25rem' }}>
          <Home size={15} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
