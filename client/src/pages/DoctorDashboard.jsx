import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { appointmentService } from '../services/appointmentService';
import { recordService } from '../services/recordService';
import { statsService } from '../services/statsService';
import AppointmentCard from '../components/AppointmentCard';
import PrescriptionModal from '../components/PrescriptionModal';
import LiveConsultationModal from '../components/LiveConsultationModal';
import StatsCard from '../components/StatsCard';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  X
} from '../components/Icons';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { latestEvent } = useSocket();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'all' | 'records'
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Chat Modal
  const [activeChatAppointment, setActiveChatAppointment] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Prescription View Modal
  const [viewRecord, setViewRecord] = useState(null);
  const [showViewRecordModal, setShowViewRecordModal] = useState(false);

  // Create Medical Record & Prescription Modal State
  const [creatingRecordForApp, setCreatingRecordForApp] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    heartRate: 72,
    temperature: 36.8,
    weight: 70
  });
  const [prescriptions, setPrescriptions] = useState([
    { medication: '', dosage: '500 mg', frequency: 'Twice daily', duration: '7 days', instructions: 'After meals' }
  ]);
  const [labTests, setLabTests] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submittingRecord, setSubmittingRecord] = useState(false);

  const loadDoctorData = async () => {
    try {
      const [appRes, statRes, recRes] = await Promise.all([
        appointmentService.getAppointments(),
        statsService.getDoctorStats(),
        recordService.getRecords()
      ]);
      if (appRes.appointments) setAppointments(appRes.appointments);
      if (statRes.stats) setStats(statRes.stats);
      if (recRes.records) setRecords(recRes.records);
    } catch (err) {
      console.warn('Failed to load doctor dashboard:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [latestEvent]);

  // Status Updater
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateStatus(appointmentId, { status: newStatus });
      loadDoctorData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Add medication row
  const addMedicationRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medication: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
    ]);
  };

  // Remove medication row
  const removeMedicationRow = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  // Handle prescription field change
  const handleMedChange = (idx, field, value) => {
    const updated = [...prescriptions];
    updated[idx][field] = value;
    setPrescriptions(updated);
  };

  // Submit Medical Record
  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!creatingRecordForApp || !diagnosis.trim()) return;

    setSubmittingRecord(true);
    try {
      const payload = {
        patientId: creatingRecordForApp.patient?._id || creatingRecordForApp.patient,
        appointmentId: creatingRecordForApp._id,
        diagnosis,
        clinicalNotes,
        vitals,
        prescriptions: prescriptions.filter((p) => p.medication.trim().length > 0),
        labTestsRecommended: labTests ? labTests.split(',').map((t) => t.trim()) : [],
        followUpDate: followUpDate || null
      };

      await recordService.createRecord(payload);
      setCreatingRecordForApp(null);
      setDiagnosis('');
      setClinicalNotes('');
      setPrescriptions([{ medication: '', dosage: '500 mg', frequency: 'Twice daily', duration: '7 days', instructions: 'After meals' }]);
      loadDoctorData();
    } catch (err) {
      alert(`Failed to save record: ${err.message}`);
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Filter today's appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => {
    const appDateStr = new Date(a.appointmentDate).toISOString().split('T')[0];
    return appDateStr === todayStr && a.status !== 'cancelled';
  });

  return (
    <div className="app-container" style={{ padding: '2.5rem 1rem', minHeight: '80vh' }}>
      {/* Doctor Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderRadius: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
            alt="Doctor"
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }}
          />
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Doctor Portal
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {user?.name || 'Doctor'}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user?.specialization || 'Specialist'} • Fee: <strong style={{ color: 'var(--primary-500)' }}>Rs. {Number(user?.consultationFee || 1500).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} /> On Duty
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatsCard
          title="Today's Queue"
          value={stats?.todayAppointments ?? todayAppointments.length}
          icon={Clock}
          subtitle="Scheduled today"
          color="var(--primary-500)"
        />
        <StatsCard
          title="Total Assigned"
          value={stats?.totalAssigned ?? appointments.length}
          icon={Calendar}
          subtitle="All consultations"
          color="var(--accent-purple)"
        />
        <StatsCard
          title="Completed Cases"
          value={stats?.completedCount ?? appointments.filter((a) => a.status === 'completed').length}
          icon={CheckCircle2}
          subtitle="Finished visits"
          color="var(--accent-emerald)"
        />
        <StatsCard
          title="Prescriptions Issued"
          value={stats?.totalPrescriptions ?? records.length}
          icon={FileText}
          subtitle="Clinical reports"
          color="var(--accent-amber)"
        />
      </div>

      {/* Tab Selectors */}
      <div className="tab-container" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('today')}
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
        >
          <Clock size={15} /> Today's Agenda ({todayAppointments.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          <Calendar size={15} /> All Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
        >
          <FileText size={15} /> Medical Records ({records.length})
        </button>
      </div>

      {/* TAB 1: Today's Agenda */}
      {activeTab === 'today' && (
        <div>
          {todayAppointments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '10px' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--accent-emerald)' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Appointments for Today</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                All consultations for today have been completed or none are scheduled.
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
              {todayAppointments.map((app) => (
                <AppointmentCard
                  key={app._id}
                  appointment={app}
                  userRole="doctor"
                  onStatusChange={handleUpdateStatus}
                  onOpenChat={(a) => {
                    setActiveChatAppointment(a);
                    setShowChatModal(true);
                  }}
                  onOpenRecord={(a) => setCreatingRecordForApp(a)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: All Assigned Appointments */}
      {activeTab === 'all' && (
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
              userRole="doctor"
              onStatusChange={handleUpdateStatus}
              onOpenChat={(a) => {
                setActiveChatAppointment(a);
                setShowChatModal(true);
              }}
              onOpenRecord={(a) => setCreatingRecordForApp(a)}
            />
          ))}
        </div>
      )}

      {/* TAB 3: Issued Medical Records */}
      {activeTab === 'records' && (
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
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '10px' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Diagnosis
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(rec.visitDate || rec.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {rec.diagnosis}
                </h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Patient: <strong style={{ color: 'var(--text-primary)' }}>{rec.patient?.name}</strong> (Blood: {rec.patient?.bloodGroup || 'N/A'})
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {rec.clinicalNotes || 'Treatment plan formulated and dispensed.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  {rec.prescriptions?.length || 0} Medications
                </span>
                <button
                  onClick={() => {
                    setViewRecord(rec);
                    setShowViewRecordModal(true);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <FileText size={14} /> View Rx Sheet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MEDICAL RECORD & PRESCRIPTION MODAL */}
      {creatingRecordForApp && (
        <div className="modal-backdrop" onClick={() => setCreatingRecordForApp(null)}>
          <div
            className="modal-card animate-fade-in"
            style={{
              maxWidth: '800px',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Clinical Report & Prescription (Rx)
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Patient: <strong style={{ color: 'var(--text-primary)' }}>{creatingRecordForApp.patient?.name}</strong> • Time: {creatingRecordForApp.timeSlot}
                </p>
              </div>
              <button
                onClick={() => setCreatingRecordForApp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord}>
              {/* Primary Diagnosis */}
              <div className="form-group">
                <label className="form-label">Primary Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis, Hypertension, Dental Caries..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Vitals Signs Grid */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                  Patient Vitals
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Blood Pressure</span>
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Heart Rate (bpm)</span>
                    <input
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Temp (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Weight (kg)</span>
                    <input
                      type="number"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="form-group">
                <label className="form-label">Clinical Observations & Treatment Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes on examination findings, patient history, and dietary/exercise guidance..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Dynamic Prescriptions List */}
              <div style={{ marginBottom: '1.25rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--primary-600)' }}>
                    Prescription Medications (Rx)
                  </label>
                  <button
                    type="button"
                    onClick={addMedicationRow}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} /> Add Drug
                  </button>
                </div>

                {prescriptions.map((p, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 32px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Medication Name"
                      value={p.medication}
                      onChange={(e) => handleMedChange(idx, 'medication', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={p.dosage}
                      onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={p.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={p.duration}
                      onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={p.instructions}
                      onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                      className="form-input"
                    />
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicationRow(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Lab Tests & Follow-Up */}
              <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Recommended Lab Tests</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Blood Count, ECG, Lipid Panel"
                    value={labTests}
                    onChange={(e) => setLabTests(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setCreatingRecordForApp(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecord}
                  className="btn btn-primary btn-sm"
                >
                  {submittingRecord ? 'Saving...' : 'Save & Complete Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription View Modal */}
      <PrescriptionModal
        isOpen={showViewRecordModal}
        onClose={() => setShowViewRecordModal(false)}
        record={viewRecord}
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
