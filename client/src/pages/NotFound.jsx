import React from 'react';
import { Link } from '../components/Router';
import { Activity, Home, ArrowLeft } from '../components/Icons';



export default function NotFound() {
  return (
    <div className="app-container" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', maxWidth: '560px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(14, 165, 233, 0.15)',
            color: 'var(--primary-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <Activity size={32} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-400)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          The clinical route or medical page you requested does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <Home size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
