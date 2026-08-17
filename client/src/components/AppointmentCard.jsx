import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, Video, MapPin, User, FileText, MessageSquare, AlertCircle } from './Icons';


export default function AppointmentCard({
  appointment,
  userRole = 'patient',
  onStatusChange,
  onOpenChat,
  onOpenRecord,
  onReschedule
}) {
  const isDoctor = userRole === 'doctor';
  const isAdmin = userRole === 'admin';
  const isPatient = userRole === 'patient';

  const partner = isDoctor ? appointment.patient : appointment.doctor;
  const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
      {/* Top Row: Partner info & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            alt="avatar"
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
          />
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
              {isDoctor ? 'Patient' : (appointment.department?.name || 'Department')}
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              {partner?.name || 'Participant'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isDoctor ? `Contact: ${partner?.phone || partner?.email}` : (partner?.specialization || 'Clinical Specialist')}
            </div>
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      {/* Details Box */}
      <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600 }}>
          <Calendar size={15} color="var(--primary-400)" />
          <span>{dateStr}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Clock size={15} color="var(--primary-400)" />
          <span>{appointment.timeSlot}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          {appointment.type === 'video-consultation' ? (
            <>
              <Video size={15} color="#38bdf8" />
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Live Telehealth</span>
            </>
          ) : (
            <>
              <MapPin size={15} color="#10b981" />
              <span>{appointment.department?.location || 'Clinic Room 3'}</span>
            </>
          )}
        </div>
      </div>

      {/* Reason for Consultation */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
          Consultation Reason
        </div>
        <p style={{ fontSize: '0.875rem', color: '#f8fafc', lineHeight: 1.4 }}>
          {appointment.reason}
        </p>

        {appointment.symptoms && appointment.symptoms.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {appointment.symptoms.map((sym, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '999px',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                {sym}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live Chat Button */}
          {appointment.status !== 'cancelled' && (
            <button
              onClick={() => onOpenChat && onOpenChat(appointment)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '4px' }}
            >
              <MessageSquare size={14} color="var(--primary-400)" />
              <span>Live Chat</span>
            </button>
          )}

          {/* Doctor: Issue Prescription / Medical Record */}
          {isDoctor && appointment.status !== 'cancelled' && (
            <button
              onClick={() => onOpenRecord && onOpenRecord(appointment)}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '4px' }}
            >
              <FileText size={14} />
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
                    color: 'var(--primary-400)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 8px'
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
                    color: '#f43f5e',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 8px'
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
