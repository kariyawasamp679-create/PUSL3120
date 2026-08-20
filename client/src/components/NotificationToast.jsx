import React from 'react';
import { useSocket } from '../context/SocketContext';
import { CheckCircle, Calendar, FileText, X } from './Icons';

export default function NotificationToast() {
  const { notifications, markAsRead } = useSocket();

  // Show only unread notifications (up to 3 latest)
  const activeToasts = notifications.filter((n) => !n.read).slice(0, 3);

  if (activeToasts.length === 0) return null;

  const getIcon = (title = '') => {
    if (title.includes('Booking') || title.includes('Appointment')) return <Calendar size={16} color="var(--primary-500)" />;
    if (title.includes('Medical') || title.includes('Prescription')) return <FileText size={16} color="var(--accent-emerald)" />;
    return <CheckCircle size={16} color="var(--primary-500)" />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '360px',
        width: '100%'
      }}
    >
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-panel animate-fade-in"
          style={{
            padding: '0.85rem 1rem',
            background: 'var(--bg-modal)',
            boxShadow: 'var(--card-shadow-hover)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {getIcon(toast.title)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {toast.title}
              </h4>
              <button
                onClick={() => markAsRead(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={13} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {toast.message}
            </p>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Live update
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
