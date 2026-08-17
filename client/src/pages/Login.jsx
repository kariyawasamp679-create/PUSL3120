import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '../components/Router';
import { useAuth } from '../context/AuthContext';

import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, HeartPulse, Stethoscope, User } from '../components/Icons';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginDemoAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      // Route based on role
      if (res.user?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (from && from !== '/login') {
        navigate(from);
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const res = await loginDemoAccount(roleKey);
      if (res.user?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '3.5rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)'
            }}
          >
            <Activity size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
            MediPulse 360 Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Access Patient, Doctor, or Administrative Portal
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              color: '#fda4af',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="name@medipulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Shortcut Section */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="#c084fc" /> 1-Click Test Role Logins (For Evaluators)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'flex-start', gap: '6px', color: '#c084fc' }}
            >
              <ShieldCheck size={14} /> Admin Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor')}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'flex-start', gap: '6px', color: '#ef4444' }}
            >
              <HeartPulse size={14} /> Cardiologist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('dentist')}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'flex-start', gap: '6px', color: '#38bdf8' }}
            >
              <Sparkles size={14} /> Dental Surgeon
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'flex-start', gap: '6px', color: '#34d399' }}
            >
              <User size={14} /> Patient (Jane)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have a patient account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-400)', fontWeight: 700 }}>
            Create Patient Account
          </Link>
        </div>
      </div>
    </div>
  );
}
