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
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  X
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
      setProfileMsg('Health profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    }
  };

  const upcomingCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="app-container" style={{ padding: '3rem 1.5rem', minHeight: '85vh' }}>
      {/* Patient Welcome Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256'}
            alt="Patient"
            style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-400)' }}
          />
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
              Patient Health Portal
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              Welcome, {user?.name || 'Patient'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Blood Group: <strong style={{ color: '#ef4444' }}>{user?.bloodGroup || 'A+'}</strong> • Patient ID: <strong style={{ color: '#ffffff' }}>{user?._id?.substring(0, 8).toUpperCase() || 'P-9812'}</strong>
            </div>
          </div>
        </div>

        <Link to="/book" className="btn btn-primary" style={{ padding: '0.75rem 1.4rem' }}>
          <Plus size={16} /> Book New Appointment
        </Link>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatsCard
          title="Upcoming Appointments"
          value={upcomingCount}
          icon={Calendar}
          subtitle="Scheduled consultations"
          color="#0ea5e9"
        />
        <StatsCard
          title="Clinical Prescriptions"
          value={records.length}
          icon={FileText}
          subtitle="Issued medical reports"
          color="#10b981"
        />
        <StatsCard
          title="Completed Consultations"
          value={completedCount}
          icon={CheckCircle2}
          subtitle="Past hospital visits"
          color="#8b5cf6"
        />
        <StatsCard
          title="Emergency Contact"
          value={user?.emergencyContact?.name ? 'Verified' : 'Pending'}
          icon={Heart}
          subtitle={user?.emergencyContact?.name || 'Tap Profile to set'}
          color="#f43f5e"
        />
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'appointments' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'appointments' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={18} /> My Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('records')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'records' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'records' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={18} /> Prescriptions & History ({records.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'profile' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <User size={18} /> Health Profile & Contacts
        </button>
      </div>

      {/* TAB 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: statusFilter === st ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: '1px solid var(--border-color)'
                }}
              >
                {st === '' ? 'All Appointments' : st}
              </button>
            ))}
          </div>

          {appointments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Appointments Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                You have no scheduled consultations matching the selected filter.
              </p>
              <Link to="/book" className="btn btn-primary">Book Consultation</Link>
            </div>
          ) : (
            <div className="grid-cols-2">
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
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Medical Records Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Clinical reports and prescriptions issued by attending doctors will be documented here.
              </p>
            </div>
          ) : (
            <div className="grid-cols-2">
              {records.map((rec) => (
                <div
                  key={rec._id}
                  className="glass-panel glass-panel-hover"
                  style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Diagnosis
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                          {rec.diagnosis}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(rec.visitDate || rec.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {rec.clinicalNotes || 'Routine consultation completed with prescribed treatment plan.'}
                    </p>

                    {/* Vitals preview pills */}
                    {rec.vitals && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', borderRadius: '6px' }}>
                          BP: {rec.vitals.bloodPressure || '120/80'}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '6px' }}>
                          HR: {rec.vitals.heartRate || 72} bpm
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '6px' }}>
                          Medications: {rec.prescriptions?.length || 0}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Dr. {rec.doctor?.name} ({rec.doctor?.specialization})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setShowRecordModal(true);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                    >
                      <FileText size={14} /> View Rx / Print
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
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Patient Information & Emergency Contacts
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Keep your contact details up to date for clinic appointments and urgent notifications.
          </p>

          {profileMsg && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Home Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="form-input"
              />
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-400)', marginTop: '1.5rem', marginBottom: '1rem' }}>
              Emergency Contact Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
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
                  placeholder="e.g. Spouse / Parent / Sister"
                  value={profileForm.emergencyContactRelation}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContactRelation: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Phone</label>
              <input
                type="tel"
                value={profileForm.emergencyContactPhone}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '650px',
              padding: '2rem',
              backgroundColor: '#0f172a',
              borderRadius: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleAppointment(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Selecting a new time slot with Dr. {rescheduleAppointment.doctor?.name}.
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Choose New Date</label>
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

            <div style={{ marginBottom: '2rem' }}>
              <SlotPicker
                slots={rescheduleSlotsList}
                selectedSlot={rescheduleSlot}
                onSelectSlot={(slot) => setRescheduleSlot(slot)}
                isLoading={loadingRescheduleSlots}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                disabled={!rescheduleSlot}
                onClick={handleConfirmReschedule}
                className="btn btn-primary"
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
