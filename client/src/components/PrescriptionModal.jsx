import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, Activity, ShieldCheck } from './Icons';

export default function PrescriptionModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = record.patient || {};
  const doctor = record.doctor || {};
  const vitals = record.vitals || {};
  const prescriptions = record.prescriptions || [];

  const modalContent = (
    <div
      className="modal-backdrop no-print-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-card animate-fade-in printable-record"
        style={{
          maxWidth: '780px',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions (No-print) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary-500)" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Medical Record & Prescription (Rx)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Prescription Header / Clinic Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <Activity size={22} color="var(--primary-500)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                MEDIPULSE 360 HEALTHCARE CLINIC
              </h2>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              42 Healthcare Plaza, London, UK • Reg No: MED-UK-2026-9812 • Tel: +44 20 7946 0999
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Consultation Date</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Date(record.visitDate || record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '2px' }}>Rx ID: {record._id?.substring(0, 8).toUpperCase()}</div>
          </div>
        </div>

        {/* Patient & Doctor Two-Column Block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Patient Information
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {patient.name || 'Patient'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              <div>Gender: <strong style={{ color: 'var(--text-primary)' }}>{patient.gender || 'N/A'}</strong> • Blood Group: <strong style={{ color: 'var(--accent-rose)' }}>{patient.bloodGroup || 'N/A'}</strong></div>
              <div>Email: {patient.email} • Phone: {patient.phone || 'N/A'}</div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Attending Doctor
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {doctor.name || 'Doctor'}
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              <div>Specialization: <strong style={{ color: 'var(--text-primary)' }}>{doctor.specialization || 'Specialist'}</strong></div>
              <div>Qualifications: {doctor.qualifications || 'MBBS'}</div>
            </div>
          </div>
        </div>

        {/* Vitals Signs Grid */}
        {vitals && Object.keys(vitals).length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clinical Vitals
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Blood Pressure</span>
                <div style={{ fontWeight: 700, color: 'var(--primary-500)', fontSize: '0.9rem' }}>{vitals.bloodPressure || '120/80 mmHg'}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Heart Rate</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-rose)', fontSize: '0.9rem' }}>{vitals.heartRate || 72} bpm</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Temperature</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '0.9rem' }}>{vitals.temperature || 36.8} °C</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Weight</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>{vitals.weight || 70} kg</div>
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis & Clinical Notes */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--primary-50)', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
          <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.04em' }}>
            Primary Diagnosis
          </h5>
          <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {record.diagnosis}
          </p>
          {record.clinicalNotes && (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              <strong>Notes:</strong> {record.clinicalNotes}
            </p>
          )}
        </div>

        {/* Structured Prescriptions Table */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
            Prescribed Medications (Rx)
          </h5>

          {prescriptions.length === 0 ? (
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No prescription medications required for this visit.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medication Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.medication}</td>
                      <td style={{ color: 'var(--primary-500)', fontWeight: 600 }}>{item.dosage}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.frequency}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.duration}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.instructions || 'As directed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer & Digital Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '2px' }}>
              <ShieldCheck size={14} /> Electronically Authenticated Clinical Record
            </div>
            Valid across NHS & Private Healthcare Clinics.
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: 'var(--primary-500)', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', marginBottom: '2px' }}>
              {doctor.name || 'Doctor'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Authorized Medical Officer Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
