import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from './Router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import DemoAccountModal from './DemoAccountModal';
import {
  Activity,
  Calendar,
  LogOut,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  ShieldCheck
} from './Icons';

export default function Navbar() {
  const { user, isAuthenticated, isDoctor, isAdmin, isPatient, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { isConnected, notifications, unreadCount, markAsRead, clearNotifications } = useSocket();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          boxShadow: '0 4px 20px rgba(2, 132, 199, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Activity size={22} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                MediPulse <span style={{ color: '#bae6fd' }}>360</span>
                {/* Live WebSocket Status Dot */}
                <span
                  title={isConnected ? 'Live WebSocket Connected' : 'Connecting to Server...'}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#34d399' : '#fbbf24',
                    display: 'inline-block',
                    boxShadow: isConnected ? '0 0 8px #34d399' : 'none'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#e0f2fe', fontWeight: 600 }}>
                Hospital & Clinic System
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
            <Link
              to="/doctors"
              style={{
                fontSize: '0.9rem',
                fontWeight: isActive('/doctors') ? 800 : 600,
                color: isActive('/doctors') ? '#0284c7' : '#e0f2fe',
                backgroundColor: isActive('/doctors') ? '#ffffff' : 'transparent',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
                textDecoration: 'none'
              }}
            >
              Doctors
            </Link>

            <Link
              to="/departments"
              style={{
                fontSize: '0.9rem',
                fontWeight: isActive('/departments') ? 800 : 600,
                color: isActive('/departments') ? '#0284c7' : '#e0f2fe',
                backgroundColor: isActive('/departments') ? '#ffffff' : 'transparent',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
                textDecoration: 'none'
              }}
            >
              Departments
            </Link>

            {isPatient && (
              <Link
                to="/patient/dashboard"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: isActive('/patient/dashboard') ? 800 : 600,
                  color: isActive('/patient/dashboard') ? '#0284c7' : '#e0f2fe',
                  backgroundColor: isActive('/patient/dashboard') ? '#ffffff' : 'transparent',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none'
                }}
              >
                Patient Portal
              </Link>
            )}

            {isDoctor && (
              <Link
                to="/doctor/dashboard"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: isActive('/doctor/dashboard') ? 800 : 600,
                  color: isActive('/doctor/dashboard') ? '#0284c7' : '#e0f2fe',
                  backgroundColor: isActive('/doctor/dashboard') ? '#ffffff' : 'transparent',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none'
                }}
              >
                Doctor Portal
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: isActive('/admin/dashboard') ? 800 : 600,
                  color: isActive('/admin/dashboard') ? '#0284c7' : '#e0f2fe',
                  backgroundColor: isActive('/admin/dashboard') ? '#ffffff' : 'transparent',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none'
                }}
              >
                Admin Panel
              </Link>
            )}

            <Link
              to="/book"
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                fontWeight: 800,
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={15} color="#0284c7" /> Book Appointment
            </Link>
          </nav>

          {/* Right Action Tools (Theme Toggle, Admin Access, Notifications, Profile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle color theme"
            >
              {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#ffffff" />}
            </button>

            {/* Admin Credentials Access Button */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                gap: '6px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="View Administrator credentials"
            >
              <ShieldCheck size={14} color="#ffffff" /> Admin Access
            </button>

            {/* Real-Time Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                aria-label="Notifications"
              >
                <Bell size={17} color="#ffffff" />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #ffffff'
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
                    top: '44px',
                    right: 0,
                    width: '300px',
                    background: 'var(--bg-modal)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    boxShadow: 'var(--card-shadow-hover)',
                    zIndex: 200
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Notifications ({notifications.length})
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        style={{ fontSize: '0.75rem', color: 'var(--primary-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            background: n.read ? 'transparent' : 'var(--primary-50)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
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
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                    alt="avatar"
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ffffff' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} color="#ffffff" />
                </button>

                {showUserMenu && (
                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      position: 'absolute',
                      top: '44px',
                      right: 0,
                      width: '200px',
                      background: 'var(--bg-modal)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '6px',
                      zIndex: 200,
                      boxShadow: 'var(--card-shadow-hover)'
                    }}
                  >
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role: {user?.role}</div>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        background: 'transparent',
                        color: 'var(--accent-rose)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to="/login"
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '8px'
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0284c7',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} color="#ffffff" /> : <Menu size={18} color="#ffffff" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="animate-fade-in"
            style={{
              padding: '1rem 1.25rem',
              background: '#0369a1',
              borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '8px 12px',
                fontWeight: 700,
                borderRadius: '6px',
                color: isActive('/doctors') ? '#0284c7' : '#ffffff',
                backgroundColor: isActive('/doctors') ? '#ffffff' : 'transparent',
                textDecoration: 'none'
              }}
            >
              Doctors
            </Link>
            <Link
              to="/departments"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '8px 12px',
                fontWeight: 700,
                borderRadius: '6px',
                color: isActive('/departments') ? '#0284c7' : '#ffffff',
                backgroundColor: isActive('/departments') ? '#ffffff' : 'transparent',
                textDecoration: 'none'
              }}
            >
              Departments
            </Link>
            {isPatient && (
              <Link
                to="/patient/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '8px 12px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  color: isActive('/patient/dashboard') ? '#0284c7' : '#ffffff',
                  backgroundColor: isActive('/patient/dashboard') ? '#ffffff' : 'transparent',
                  textDecoration: 'none'
                }}
              >
                Patient Portal
              </Link>
            )}
            {isDoctor && (
              <Link
                to="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '8px 12px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  color: isActive('/doctor/dashboard') ? '#0284c7' : '#ffffff',
                  backgroundColor: isActive('/doctor/dashboard') ? '#ffffff' : 'transparent',
                  textDecoration: 'none'
                }}
              >
                Doctor Portal
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '8px 12px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  color: isActive('/admin/dashboard') ? '#0284c7' : '#ffffff',
                  backgroundColor: isActive('/admin/dashboard') ? '#ffffff' : 'transparent',
                  textDecoration: 'none'
                }}
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="btn"
              style={{
                width: '100%',
                marginTop: '6px',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                fontWeight: 800,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px'
              }}
            >
              <Calendar size={16} color="#0284c7" /> Book Appointment
            </Link>
          </div>
        )}
      </header>

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <DemoAccountModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </>
  );
}
