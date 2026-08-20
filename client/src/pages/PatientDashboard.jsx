import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { appointmentService } from '../services/appointmentService';
import { recordService } from '../services/recordService';
import AppointmentCard from '../components/AppointmentCard';
import PrescriptionModal from '../components/PrescriptionModal';
import LiveConsultationModal from '../components/LiveConsultationModal';
import SlotPicker from '../components/SlotPicker';
import StatsCard from '../components/StatsCard';
import {
  Calendar,
  FileText,
  User,
  Heart,
  CheckCircle2,
  Plus,
  X,
  MapPin,
  Phone
} from '../components/Icons';
import { Link } from '../components/Router';

export default function PatientDashboard() {
  const { user, updateProfile } = useAuth();
  const { latestEvent } = useSocket();

  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'records' | 'profile'
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [activeChatAppointment, setActiveChatAppointment] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Reschedule Modal
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleSlotsList, setRescheduleSlotsList] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContactName: user?.emergencyContact?.name || '',
    emergencyContactPhone: user?.emergencyContact?.phone || '',
    emergencyContactRelation: user?.emergencyContact?.relation || ''
  });
  const [profileMsg, setProfileMsg] = useState('');

  // Fetch Patient Appointments & Records
  const loadDashboardData = async () => {
    try {
      const [appRes, recRes] = await Promise.all([
        appointmentService.getAppointments({ status: statusFilter }),
        recordService.getRecords()
      ]);
      if (appRes.appointments) setAppointments(appRes.appointments);
      if (recRes.records) setRecords(recRes.records);
    } catch (err) {
      console.warn('Failed to load patient dashboard:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter, latestEvent]);

  // Handle Cancellation
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.updateStatus(appointmentId, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by patient'
      });
      loadDashboardData();
    } catch (err) {
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = async (app) => {
    setRescheduleAppointment(app);
    const initialDate = new Date(app.appointmentDate).toISOString().split('T')[0];
    setRescheduleDate(initialDate);
    setRescheduleSlot('');
    fetchRescheduleSlots(app.doctor?._id || app.doctor, initialDate);
  };

  const fetchRescheduleSlots = async (doctorId, date) => {
    setLoadingRescheduleSlots(true);
    try {
      const res = await appointmentService.getAvailableSlots(doctorId, date);
      if (res.slots) {
        setRescheduleSlotsList(res.slots);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleAppointment || !rescheduleDate || !rescheduleSlot) return;
    try {
      await appointmentService.reschedule(rescheduleAppointment._id, {
        newDate: rescheduleDate,
        newTimeSlot: rescheduleSlot
      });
      setRescheduleAppointment(null);
      loadDashboardData();
    } catch (err) {
      alert(`Reschedule failed: ${err.message}`);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await updateProfile({
        phone: profileForm.phone,
        address: profileForm.address,
        emergencyContact: {
          name: profileForm.emergencyContactName,
          phone: profileForm.emergencyContactPhone,
          relation: profileForm.emergencyContactRelation
        }
      });
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    }
  };

  const upcomingCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="app-container" style={{ padding: '2.5rem 1rem', minHeight: '80vh' }}>
      {/* Patient Welcome Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--card-shadow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Gradient Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #0284c7, #059669, #7c3aed)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '14px',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #7dd3fc',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.18)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256'}
              alt="Patient"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#0284c7',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  background: '#e0f2fe',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #bae6fd'
                }}
              >
                Patient Portal
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#059669',
                  fontWeight: 800,
                  background: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #a7f3d0'
                }}
              >
                ID: {user?._id?.substring(0, 8).toUpperCase() || 'P-9812'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#e11d48',
                  fontWeight: 800,
                  background: '#ffe4e6',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #fecdd3'
                }}
              >
                Blood: {user?.bloodGroup || 'A+'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              Welcome, {user?.name || 'Patient'}
            </h1>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Email: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
              {user?.phone && <span> • Phone: <strong style={{ color: 'var(--text-primary)' }}>{user?.phone}</strong></span>}
            </div>
          </div>
        </div>

        <Link
          to="/book"
          className="btn btn-sm"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            padding: '10px 18px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} /> Book Appointment
        </Link>
      </div>

      {/* KPI Overview Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatsCard
          title="Upcoming Appointments"
          value={upcomingCount}
          icon={Calendar}
          subtitle="Scheduled visits"
          color="#0284c7"
          bgLight="#e0f2fe"
          borderAccent="#7dd3fc"
          gradient="linear-gradient(90deg, #0284c7, #38bdf8)"
          cardBorder="rgba(2, 132, 199, 0.25)"
        />
        <StatsCard
          title="Prescriptions & Records"
          value={records.length}
          icon={FileText}
          subtitle="Issued medical files"
          color="#059669"
          bgLight="#d1fae5"
          borderAccent="#6ee7b7"
          gradient="linear-gradient(90deg, #059669, #34d399)"
          cardBorder="rgba(5, 150, 105, 0.25)"
        />
        <StatsCard
          title="Completed Visits"
          value={completedCount}
          icon={CheckCircle2}
          subtitle="Past consultations"
          color="#7c3aed"
          bgLight="#ede9fe"
          borderAccent="#c4b5fd"
          gradient="linear-gradient(90deg, #7c3aed, #a78bfa)"
          cardBorder="rgba(124, 58, 237, 0.25)"
        />
        <StatsCard
          title="Emergency Contact"
          value={user?.emergencyContact?.name ? 'Configured' : 'Not set'}
          icon={Heart}
          subtitle={user?.emergencyContact?.name ? `${user.emergencyContact.name} (${user.emergencyContact.relation || 'Emergency'})` : 'Configure in profile'}
          color="#e11d48"
          bgLight="#ffe4e6"
          borderAccent="#fda4af"
          gradient="linear-gradient(90deg, #e11d48, #f43f5e)"
          cardBorder="rgba(225, 29, 72, 0.25)"
        />
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="tab-container" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
        >
          <Calendar size={15} /> My Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
        >
          <FileText size={15} /> Medical Records ({records.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={15} /> Profile & Emergency Contact
        </button>
      </div>

      {/* TAB 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {['', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '6px', textTransform: 'capitalize' }}
              >
                {st === '' ? 'All Appointments' : st}
              </button>
            ))}
          </div>

          {appointments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '14px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Calendar size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Consultations Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                You have no scheduled consultations matching this status filter.
              </p>
              <Link to="/book" className="btn btn-primary btn-sm">
                <Plus size={14} /> Book an Appointment
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {appointments.map((app) => (
                <AppointmentCard
                  key={app._id}
                  appointment={app}
                  userRole="patient"
                  onStatusChange={handleCancel}
                  onOpenChat={(a) => {
                    setActiveChatAppointment(a);
                    setShowChatModal(true);
                  }}
                  onReschedule={handleOpenReschedule}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Prescriptions & Medical History */}
      {activeTab === 'records' && (
        <div>
          {records.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '14px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Medical Records Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Clinical reports, digital prescriptions, and vital stats issued by doctors will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {records.map((rec) => (
                <div
                  key={rec._id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-surface)',
                    boxShadow: 'var(--card-shadow)',
                    border: '1px solid rgba(5, 150, 105, 0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #059669, #0284c7)'
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            color: '#059669',
                            background: '#d1fae5',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          Diagnosis
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                          {rec.diagnosis}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {new Date(rec.visitDate || rec.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      {rec.clinicalNotes || 'Routine medical consultation with prescribed treatment plan.'}
                    </p>

                    {/* Vitals preview pills */}
                    {rec.vitals && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: '#e0f2fe', color: '#0284c7', borderRadius: '4px', fontWeight: 700, border: '1px solid #bae6fd' }}>
                          BP: {rec.vitals.bloodPressure || '120/80'}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: '#ffe4e6', color: '#e11d48', borderRadius: '4px', fontWeight: 700, border: '1px solid #fecdd3' }}>
                          HR: {rec.vitals.heartRate || 72} bpm
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: '#d1fae5', color: '#059669', borderRadius: '4px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                          Meds: {rec.prescriptions?.length || 0}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Dr. {rec.doctor?.name} ({rec.doctor?.specialization})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setShowRecordModal(true);
                      }}
                      className="btn btn-sm"
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        borderRadius: '6px',
                        padding: '6px 12px',
                        boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileText size={14} /> View / Print Rx
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            maxWidth: '640px',
            borderRadius: '14px',
            border: '1px solid rgba(225, 29, 72, 0.25)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--card-shadow)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #e11d48, #d97706)'
            }}
          />

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Health Profile & Emergency Details
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Update your phone, residential address, and emergency contact.
          </p>

          {profileMsg && (
            <div style={{ padding: '0.65rem 0.85rem', background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.85rem', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              Emergency Contact
            </h4>

            <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  value={profileForm.emergencyContactName}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse, Parent, Sibling"
                  value={profileForm.emergencyContactRelation}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContactRelation: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  value={profileForm.emergencyContactPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
              Save Profile
            </button>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div className="modal-backdrop" onClick={() => setRescheduleAppointment(null)}>
          <div
            className="modal-card animate-fade-in"
            style={{ maxWidth: '600px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleAppointment(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Select a new date and time slot with Dr. {rescheduleAppointment.doctor?.name}.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  fetchRescheduleSlots(rescheduleAppointment.doctor?._id || rescheduleAppointment.doctor, e.target.value);
                }}
                className="form-input"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <SlotPicker
                slots={rescheduleSlotsList}
                selectedSlot={rescheduleSlot}
                onSelectSlot={(slot) => setRescheduleSlot(slot)}
                isLoading={loadingRescheduleSlots}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                disabled={!rescheduleSlot}
                onClick={handleConfirmReschedule}
                className="btn btn-primary btn-sm"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription View Modal */}
      <PrescriptionModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        record={selectedRecord}
      />

      {/* Live Consultation Chat Modal */}
      <LiveConsultationModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        appointment={activeChatAppointment}
      />
    </div>
  );
}
