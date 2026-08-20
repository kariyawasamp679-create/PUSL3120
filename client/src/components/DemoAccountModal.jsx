import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from './Router';
import { X, ShieldCheck, Stethoscope, User, ArrowRight, Key, Check } from './Icons';

export default function DemoAccountModal({ isOpen, onClose }) {
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAdminQuickLogin = async () => {
    try {
      const res = await login('admin@medipulse.com', 'Password123!');
      onClose();
      navigate('/admin/dashboard');
    } catch (err) {
      alert(`Login error: ${err.message}`);
    }
  };

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{ padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                System Administrator Access
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Initial administrative credentials to manage hospital operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* System Admin Credentials Box */}
        <div
          style={{
            background: 'var(--primary-50)',
            border: '1.5px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.04em' }}>
              Default Administrator Account
            </span>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)', borderRadius: '4px', fontWeight: 600 }}>
              Full System Privileges
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>admin@medipulse.com</strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Password</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Password123!</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdminQuickLogin}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', gap: '8px' }}
          >
            <Key size={16} /> 1-Click Sign In as Administrator <ArrowRight size={15} />
          </button>
        </div>

        {/* Workflow Guide */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            How to Set Up & Test the System
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)', flexShrink: 0 }}>
                <ShieldCheck size={16} />
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>1. Admin Controls:</strong> Log in as Admin to add hospital departments and register doctors with their consultation fees and qualifications.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)', flexShrink: 0 }}>
                <User size={16} />
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>2. Patient Registration:</strong> Create a patient account at the Registration page to book live slots with any doctor added by Admin.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--primary-50)', color: 'var(--primary-500)', flexShrink: 0 }}>
                <Stethoscope size={16} />
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>3. Doctor Consultations:</strong> Log in with the credentials set by Admin to review patient appointments, conduct consultations, and issue digital prescriptions.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            PUSL3120 University System Architecture
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
