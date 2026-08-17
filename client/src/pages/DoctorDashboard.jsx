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
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Stethoscope,
  Activity,
  Video,
  X,
  Printer
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
    <div className="app-container" style={{ padding: '3rem 1.5rem', minHeight: '85vh' }}>
      {/* Doctor Header */}
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
            src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
            alt="Doctor"
            style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-400)' }}
          />
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
              Practitioner Clinical Portal
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {user?.name || 'Dr. Practitioner'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user?.specialization || 'Clinical Specialist'} • {user?.qualifications || 'MBBS'} • Fee: <strong style={{ color: '#38bdf8' }}>£{user?.consultationFee || 45}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Active Practice Room
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatsCard
          title="Today's Patient Queue"
          value={stats?.todayAppointments ?? todayAppointments.length}
          icon={Clock}
          subtitle="Scheduled for today"
          color="#0ea5e9"
        />
        <StatsCard
          title="Total Assigned"
          value={stats?.totalAssigned ?? appointments.length}
          icon={Calendar}
          subtitle="All-time consultations"
          color="#8b5cf6"
        />
        <StatsCard
          title="Completed Cases"
          value={stats?.completedCount ?? appointments.filter((a) => a.status === 'completed').length}
          icon={CheckCircle2}
          subtitle="Successfully discharged"
          color="#10b981"
        />
        <StatsCard
          title="Prescriptions Issued"
          value={stats?.totalPrescriptions ?? records.length}
          icon={FileText}
          subtitle="Clinical medical records"
          color="#f59e0b"
        />
      </div>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('today')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'today' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'today' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} /> Today's Agenda ({todayAppointments.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'all' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={18} /> All Appointments ({appointments.length})
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
          <FileText size={18} /> Clinical Records ({records.length})
        </button>
      </div>

      {/* TAB 1: Today's Agenda */}
      {activeTab === 'today' && (
        <div>
          {todayAppointments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto', color: '#10b981' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>No More Patients for Today</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                All consultations for today have been completed or none are scheduled.
              </p>
            </div>
          ) : (
            <div className="grid-cols-2">
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
        <div className="grid-cols-2">
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
        <div className="grid-cols-2">
          {records.map((rec) => (
            <div
              key={rec._id}
              className="glass-panel glass-panel-hover"
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Patient Case Report
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(rec.visitDate || rec.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {rec.diagnosis}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Patient: <strong style={{ color: '#ffffff' }}>{rec.patient?.name}</strong> (Blood: {rec.patient?.bloodGroup || 'N/A'})
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {rec.clinicalNotes || 'Treatment plan formulated and dispensed.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  {rec.prescriptions?.length || 0} Rx Items
                </span>
                <button
                  onClick={() => {
                    setViewRecord(rec);
                    setShowViewRecordModal(true);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
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
              maxWidth: '820px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2.5rem',
              backgroundColor: '#0f172a',
              borderRadius: '18px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  Issue Clinical Report & Prescription (Rx)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Patient: <strong style={{ color: '#ffffff' }}>{creatingRecordForApp.patient?.name}</strong> • Slot: {creatingRecordForApp.timeSlot}
                </p>
              </div>
              <button
                onClick={() => setCreatingRecordForApp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord}>
              {/* Primary Diagnosis */}
              <div className="form-group">
                <label className="form-label">Primary Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis / Hypertension Stage 1 / Dental Caries"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Vitals Signs Grid */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Clinical Vitals Measured
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blood Pressure</span>
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Heart Rate (bpm)</span>
                    <input
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temp (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight (kg)</span>
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
                <label className="form-label">Clinical Observations & Advice</label>
                <textarea
                  rows={3}
                  placeholder="Notes on examination findings, patient history, and dietary/exercise guidance..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Dynamic Prescriptions List */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(30, 41, 59, 0.4)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--primary-400)' }}>
                    Prescribed Medications (Rx)
                  </label>
                  <button
                    type="button"
                    onClick={addMedicationRow}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={14} /> Add Medication
                  </button>
                </div>

                {prescriptions.map((p, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 36px', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Medication Name (e.g. Amoxicillin)"
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
                      placeholder="Frequency (Twice daily)"
                      value={p.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Duration (7 days)"
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
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Lab Tests & Follow-Up */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Recommended Diagnostic Lab Tests</label>
                  <input
                    type="text"
                    placeholder="e.g. Lipid Profile, Full Blood Count, ECG"
                    value={labTests}
                    onChange={(e) => setLabTests(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Follow-Up Review Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCreatingRecordForApp(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecord}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem' }}
                >
                  {submittingRecord ? 'Publishing & Syncing...' : 'Complete Visit & Publish Rx'}
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
