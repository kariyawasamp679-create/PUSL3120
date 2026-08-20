import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, Video, MapPin, FileText, MessageSquare } from './Icons';

export default function AppointmentCard({
  appointment,
  userRole = 'patient',
  onStatusChange,
  onOpenChat,
  onOpenRecord,
  onReschedule
}) {
  const isDoctor = userRole === 'doctor';
  const partner = isDoctor ? appointment.patient : appointment.doctor;
  const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getStatusGradient = () => {
    switch (appointment.status) {
      case 'confirmed':
        return 'linear-gradient(90deg, #059669, #34d399)';
      case 'completed':
        return 'linear-gradient(90deg, #0284c7, #38bdf8)';
      case 'cancelled':
        return 'linear-gradient(90deg, #e11d48, #f43f5e)';
      default:
        return 'linear-gradient(90deg, #d97706, #fbbf24)';
    }
  };

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        borderRadius: '14px',
        border: '1px solid rgba(2, 132, 199, 0.2)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Gradient Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: getStatusGradient()
        }}
      />

      {/* Top Row: Partner info & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1.5px solid #bae6fd',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <img
              src={partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <span
              style={{
                fontSize: '0.725rem',
                textTransform: 'uppercase',
                color: '#0284c7',
                fontWeight: 800,
                letterSpacing: '0.05em',
                background: '#e0f2fe',
                padding: '2px 7px',
                borderRadius: '4px',
                border: '1px solid #bae6fd'
              }}
            >
              {isDoctor ? 'Patient' : (appointment.department?.name || 'Specialty')}
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '3px' }}>
              {partner?.name || 'Participant'}
            </h4>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              {isDoctor ? `Contact: ${partner?.phone || partner?.email}` : (partner?.specialization || 'Specialist')}
            </div>
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      {/* Details Box */}
      <div
        style={{
          background: 'var(--bg-primary)',
          padding: '10px 14px',
          borderRadius: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.825rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 700 }}>
          <Calendar size={14} color="#0284c7" />
          <span>{dateStr}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <Clock size={14} color="#0284c7" />
          <span>{appointment.timeSlot}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          {appointment.type === 'video-consultation' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #bae6fd' }}>
              <Video size={13} color="#0284c7" />
              Telehealth
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              <MapPin size={13} color="#059669" />
              {appointment.department?.location || 'Clinic Room 3'}
            </span>
          )}
        </div>
        {appointment.fee && (
          <div style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--text-primary)' }}>
            Rs. {Number(appointment.fee).toLocaleString()}
          </div>
        )}
      </div>

      {/* Reason for Consultation */}
      <div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px', letterSpacing: '0.04em' }}>
          Reason
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
          {appointment.reason}
        </p>

        {appointment.symptoms && appointment.symptoms.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
            {appointment.symptoms.map((sym, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.725rem',
                  padding: '2px 8px',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600
                }}
              >
                {sym}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Live Chat Button */}
          {appointment.status !== 'cancelled' && (
            <button
              onClick={() => onOpenChat && onOpenChat(appointment)}
              className="btn btn-secondary btn-sm"
            >
              <MessageSquare size={13} color="var(--primary-500)" />
              <span>Live Chat</span>
            </button>
          )}

          {/* Doctor: Issue Prescription / Medical Record */}
          {isDoctor && appointment.status !== 'cancelled' && (
            <button
              onClick={() => onOpenRecord && onOpenRecord(appointment)}
              className="btn btn-primary btn-sm"
            >
              <FileText size={13} />
              <span>{appointment.status === 'completed' ? 'View Record' : 'Clinical Record'}</span>
            </button>
          )}
        </div>

        {/* Status Modifiers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <>
              {onReschedule && (
                <button
                  onClick={() => onReschedule(appointment)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-500)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '3px 6px'
                  }}
                >
                  Reschedule
                </button>
              )}

              {onStatusChange && (
                <button
                  onClick={() => onStatusChange(appointment._id, 'cancelled')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-rose)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '3px 6px'
                  }}
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
