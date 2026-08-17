import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';

import { useSocket } from '../context/SocketContext';
import DemoAccountModal from './DemoAccountModal';
import {
  Activity,
  Calendar,
  User,
  LogOut,
  Bell,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  Clock
} from './Icons';


export default function Navbar() {
  const { user, isAuthenticated, isDoctor, isAdmin, isPatient, logout } = useAuth();
  const { isConnected, notifications, unreadCount, markAsRead, clearNotifications } = useSocket();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(11, 19, 41, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '74px' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(14, 165, 233, 0.4)'
              }}
            >
              <Activity size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                MediPulse <span style={{ color: 'var(--primary-400)' }}>360</span>
                {/* Live WebSocket Status Dot */}
                <span
                  title={isConnected ? 'Real-Time WebSocket Active' : 'Connecting to WebSocket...'}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#10b981' : '#f59e0b',
                    boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
                    display: 'inline-block'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Healthcare Portal
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/doctors"
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/doctors') ? 'var(--primary-400)' : 'var(--text-secondary)'
              }}
            >
              Our Doctors
            </Link>

            <Link
              to="/departments"
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/departments') ? 'var(--primary-400)' : 'var(--text-secondary)'
              }}
            >
              Specialties
            </Link>

            {isPatient && (
              <Link
                to="/patient/dashboard"
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: isActive('/patient/dashboard') ? 'var(--primary-400)' : 'var(--text-secondary)'
                }}
              >
                My Health Portal
              </Link>
            )}

            {isDoctor && (
              <Link
                to="/doctor/dashboard"
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: isActive('/doctor/dashboard') ? 'var(--primary-400)' : 'var(--text-secondary)'
                }}
              >
                Doctor Portal
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: isActive('/admin/dashboard') ? 'var(--primary-400)' : 'var(--text-secondary)'
                }}
              >
                Admin Control
              </Link>
            )}

            <Link
              to="/book"
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}
            >
              <Calendar size={16} /> Book Appointment
            </Link>
          </nav>

          {/* Right Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 1-Click Demo Logins Button */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="btn btn-secondary"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.8rem',
                borderColor: 'rgba(139, 92, 246, 0.4)',
                background: 'rgba(139, 92, 246, 0.12)',
                color: '#c084fc'
              }}
            >
              <Sparkles size={14} /> Demo Roles
            </button>

            {/* Real-Time Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-color)',
                  color: unreadCount > 0 ? 'var(--primary-400)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '320px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '14px',
                    padding: '1rem',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
                    zIndex: 200
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                      Live Activity ({notifications.length})
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        style={{ fontSize: '0.75rem', color: 'var(--primary-400)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: n.read ? 'transparent' : 'rgba(14, 165, 233, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Session Menu */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    color: '#ffffff'
                  }}
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                    alt="avatar"
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {showUserMenu && (
                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '210px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '6px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role?.toUpperCase()}</div>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        background: 'transparent',
                        color: '#f43f5e',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <DemoAccountModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </>
  );
}
