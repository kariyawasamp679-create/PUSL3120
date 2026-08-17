import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, Stethoscope, User, Sparkles, HeartPulse, Activity } from './Icons';


export default function DemoAccountModal({ isOpen, onClose }) {
  const { loginDemoAccount, user } = useAuth();

  if (!isOpen) return null;

  const demoRoles = [
    {
      id: 'admin',
      roleName: 'Hospital Administrator',
      email: 'admin@medipulse.com',
      name: 'Eleanor Vance',
      description: 'Manage clinic departments, assign doctors, view system revenue & analytics.',
      icon: ShieldCheck,
      color: '#8b5cf6',
      badge: 'Admin Portal'
    },
    {
      id: 'doctor',
      roleName: 'Dr. Sarah Jenkins',
      email: 'dr.sarah@medipulse.com',
      name: 'Cardiology Specialist',
      description: 'View daily schedule, confirm appointments, write clinical notes and issue prescriptions.',
      icon: HeartPulse,
      color: '#ef4444',
      badge: 'Doctor Portal'
    },
    {
      id: 'dentist',
      roleName: 'Dr. Marcus Vance',
      email: 'dr.marcus@medipulse.com',
      name: 'Dental Surgeon & Implantologist',
      description: 'Perform oral surgery bookings, check patient teeth sensitive history, update status.',
      icon: Sparkles,
      color: '#0ea5e9',
      badge: 'Doctor Portal'
    },
    {
      id: 'gp',
      roleName: 'Dr. Emily Watson',
      email: 'dr.emily@medipulse.com',
      name: 'General Practitioner',
      description: 'Family medicine consultations, manage patient queues, and tele-consultation chat.',
      icon: Stethoscope,
      color: '#10b981',
      badge: 'Doctor Portal'
    },
    {
      id: 'patient',
      roleName: 'Jane Doe',
      email: 'jane.doe@example.com',
      name: 'Registered Patient (Blood: A+)',
      description: 'Book instant slots, reschedule, view past medical history, download prescriptions.',
      icon: User,
      color: '#38bdf8',
      badge: 'Patient Portal'
    }
  ];

  const handleSelectRole = async (roleId) => {
    try {
      await loginDemoAccount(roleId);
      onClose();
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Select Demo Role (1-Click Login)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Easily evaluate all 3 user portals and multi-role features without manual typing.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {demoRoles.map((role) => {
            const Icon = role.icon;
            const isCurrent = user?.email === role.email;

            return (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: isCurrent ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                  border: isCurrent ? '1px solid var(--primary-500)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = role.color;
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isCurrent ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.background = isCurrent ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.6)';
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: `${role.color}20`,
                    color: role.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={24} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                      {role.roleName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: `${role.color}25`,
                        color: role.color,
                        fontWeight: 700
                      }}
                    >
                      {role.badge}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginLeft: 'auto' }}>
                        ● Active Session
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {role.email} • Password123!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {role.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
