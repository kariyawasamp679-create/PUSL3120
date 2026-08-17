import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, CheckCircle, Calendar, FileText } from './Icons';


export default function NotificationToast() {
  const { notifications, markAsRead } = useSocket();

  // Show only unread notifications (up to 3 latest)
  const activeToasts = notifications.filter((n) => !n.read).slice(0, 3);

  if (activeToasts.length === 0) return null;

  const getIcon = (title = '') => {
    if (title.includes('Booking') || title.includes('Appointment')) return <Calendar size={18} color="#0ea5e9" />;
    if (title.includes('Medical') || title.includes('Prescription')) return <FileText size={18} color="#10b981" />;
    return <CheckCircle size={18} color="#38bdf8" />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: '100%'
      }}
    >
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-panel animate-fade-in"
          style={{
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(14, 165, 233, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {getIcon(toast.title)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                {toast.title}
              </h4>
              <button
                onClick={() => markAsRead(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {toast.message}
            </p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Just now (Real-Time WebSocket)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
