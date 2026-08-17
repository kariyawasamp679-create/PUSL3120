import React from 'react';
import { X, Printer, FileText, Heart, Activity, CheckCircle2, ShieldCheck } from './Icons';


export default function PrescriptionModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = record.patient || {};
  const doctor = record.doctor || {};
  const vitals = record.vitals || {};
  const prescriptions = record.prescriptions || [];

  return (
    <div
      className="no-print-backdrop"
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
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in printable-record"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2.5rem',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(14, 165, 233, 0.4)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions (No-print) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary-400)" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Official Medical Record & Prescription
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Prescription Header / Clinic Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Activity size={24} color="var(--primary-400)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                MEDIPULSE 360 CLINICAL HEALTHCARE
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              42 Healthcare Plaza, London, UK • Reg No: MED-UK-2026-9812 • Tel: +44 (0) 20 7946 0999
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation Date</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              {new Date(record.visitDate || record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Rx ID: {record._id?.substring(0, 10).toUpperCase()}</div>
          </div>
        </div>

        {/* Patient & Doctor Two-Column Block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
              Patient Information
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {patient.name || 'Patient'}
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <div>Gender: <strong style={{ color: '#ffffff' }}>{patient.gender || 'N/A'}</strong> • Blood Group: <strong style={{ color: '#ef4444' }}>{patient.bloodGroup || 'N/A'}</strong></div>
              <div>Email: {patient.email} • Phone: {patient.phone || 'N/A'}</div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
              Attending Practitioner
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {doctor.name || 'Doctor'}
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <div>Specialization: <strong style={{ color: '#ffffff' }}>{doctor.specialization || 'Clinical Specialist'}</strong></div>
              <div>Qualifications: {doctor.qualifications || 'MBBS'}</div>
            </div>
          </div>
        </div>

        {/* Vitals Signs Grid */}
        {vitals && Object.keys(vitals).length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
              Clinical Vitals
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blood Pressure</span>
                <div style={{ fontWeight: 700, color: '#38bdf8' }}>{vitals.bloodPressure || '120/80 mmHg'}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Heart Rate</span>
                <div style={{ fontWeight: 700, color: '#f43f5e' }}>{vitals.heartRate || 72} bpm</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temperature</span>
                <div style={{ fontWeight: 700, color: '#f59e0b' }}>{vitals.temperature || 36.8} °C</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight</span>
                <div style={{ fontWeight: 700, color: '#10b981' }}>{vitals.weight || 70} kg</div>
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis & Clinical Notes */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(14, 165, 233, 0.08)', borderRadius: '10px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Primary Diagnosis
          </h5>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            {record.diagnosis}
          </p>
          {record.clinicalNotes && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              <strong>Clinical Assessment:</strong> {record.clinicalNotes}
            </p>
          )}
        </div>

        {/* Structured Prescriptions Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Prescribed Medications (Rx)
          </h5>

          {prescriptions.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No prescription medications required for this visit.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Medication Name</th>
                    <th style={{ padding: '8px' }}>Dosage</th>
                    <th style={{ padding: '8px' }}>Frequency</th>
                    <th style={{ padding: '8px' }}>Duration</th>
                    <th style={{ padding: '8px' }}>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#ffffff' }}>{item.medication}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--primary-400)' }}>{item.dosage}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{item.frequency}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{item.duration}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{item.instructions || 'As directed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer & Digital Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600, marginBottom: '2px' }}>
              <ShieldCheck size={14} /> Electronically Authenticated Medical Record
            </div>
            Valid across NHS & Private Healthcare Services.
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: 'var(--primary-400)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '4px', marginBottom: '4px' }}>
              {doctor.name || 'Practitioner Signature'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Authorized Medical Officer Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
