import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '../components/Router';
import { useAuth } from '../context/AuthContext';

import { useSocket } from '../context/SocketContext';
import { departmentService } from '../services/departmentService';
import { userService } from '../services/userService';
import { appointmentService } from '../services/appointmentService';
import SlotPicker from '../components/SlotPicker';
import {
  Calendar,
  Clock,
  User,
  Activity,
  CheckCircle2,
  Video,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  HeartPulse
} from '../components/Icons';

// Zero-dependency pure Canvas celebration confetti
function triggerCelebration() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#38bdf8', '#ef4444'];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: canvas.width * 0.5,
      y: canvas.height * 0.55,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    }));

    let animationFrame;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.alpha -= 0.012;
        p.rotation += p.vRot;

        if (p.alpha > 0) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (active) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrame);
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    }

    animate();
  } catch (e) {
    // Ignore in headless / non-canvas environments
  }
}



const SYMPTOM_OPTIONS = [
  'Chest Tightness / Palpitations',
  'Shortness of Breath',
  'Routine Health Checkup',
  'Toothache / Tooth Sensitivity',
  'Fever / Cold / Flu',
  'Joint Pain / Muscle Strain',
  'Skin Rash / Allergy',
  'Prescription Refill',
  'Blood Pressure Review'
];

export default function BookAppointment() {
  const { user, isAuthenticated } = useAuth();
  const { socket, latestEvent } = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step state (1: Doctor, 2: Date/Slot, 3: Details, 4: Confirmed)
  const [step, setStep] = useState(1);

  // Data lists
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  // Selection states
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // Loading & error states
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Load initial departments & doctors
  useEffect(() => {
    async function init() {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentService.getDepartments(),
          userService.getDoctors()
        ]);
        if (deptRes.departments) setDepartments(deptRes.departments);
        if (docRes.doctors) setDoctors(docRes.doctors);

        // Pre-select from query params if available
        const urlDept = searchParams.get('department');
        const urlDoctor = searchParams.get('doctor');

        if (urlDept) setSelectedDept(urlDept);
        if (urlDoctor && docRes.doctors) {
          const doc = docRes.doctors.find((d) => d._id === urlDoctor);
          if (doc) {
            setSelectedDoctor(doc);
            if (doc.department?._id || doc.department) {
              setSelectedDept(doc.department?._id || doc.department);
            }
          }
        }
      } catch (err) {
        console.warn('Error initializing booking wizard:', err.message);
      }
    }
    init();
  }, [searchParams]);

  // Load available slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await appointmentService.getAvailableSlots(selectedDoctor._id, selectedDate);
        if (res.slots) {
          setSlots(res.slots);
          // If previously selected slot became unavailable, clear it
          const currentSlotAvailable = res.slots.find((s) => s.time === selectedSlot && s.available);
          if (!currentSlotAvailable) {
            setSelectedSlot('');
          }
        }
      } catch (err) {
        console.warn('Failed to load slots:', err.message);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedDoctor, selectedDate, latestEvent]);

  // Handle Symptom toggle
  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  // Filtered doctors by selected department
  const filteredDoctors = selectedDept
    ? doctors.filter((doc) => (doc.department?._id || doc.department) === selectedDept)
    : doctors;

  // Submit Booking
  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/book' } } });
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason) {
      setError('Please fill in all required booking details.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        doctorId: selectedDoctor._id,
        departmentId: selectedDept || (selectedDoctor.department?._id || selectedDoctor.department),
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        type: consultationType,
        reason,
        symptoms: selectedSymptoms
      };

      const res = await appointmentService.createAppointment(payload);
      if (res.appointment) {
        setBookedAppointment(res.appointment);
        setStep(4);

        // Celebration Confetti!
        triggerCelebration();

      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Time slot may have just been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '3rem 1.5rem', minHeight: '85vh' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        {/* Wizard Progress Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
          {[
            { num: 1, title: 'Doctor & Specialty' },
            { num: 2, title: 'Date & Time Slot' },
            { num: 3, title: 'Reason & Symptoms' },
            { num: 4, title: 'Confirmation' }
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 2,
                  flex: 1
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    transition: 'all 0.25s ease',
                    background: isCompleted || isCurrent ? 'var(--primary-gradient)' : 'rgba(30, 41, 59, 0.8)',
                    color: '#ffffff',
                    boxShadow: isCurrent ? '0 0 15px rgba(14, 165, 233, 0.5)' : 'none',
                    border: isCurrent ? '2px solid var(--primary-400)' : '1px solid var(--border-color)'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : s.num}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isCurrent ? 'var(--primary-400)' : isCompleted ? '#ffffff' : 'var(--text-muted)',
                    textAlign: 'center'
                  }}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              color: '#fda4af',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '2rem'
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Department & Doctor */}
        {step === 1 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Select Specialty & Practitioner
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Choose a medical specialty or select from our board-certified clinical doctors.
            </p>

            {/* Department Filter Pills */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                Filter by Specialty Department
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDept('')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: selectedDept === '' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  All Specialties ({doctors.length})
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept._id}
                    type="button"
                    onClick={() => setSelectedDept(dept._id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: selectedDept === dept._id ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor?._id === doc._id;

                return (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '14px',
                      background: isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                      border: isSelected ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 20px rgba(14, 165, 233, 0.3)' : 'none',
                      display: 'flex',
                      gap: '12px'
                    }}
                  >
                    <img
                      src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                      alt={doc.name}
                      style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{doc.name}</h4>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                          £{doc.consultationFee || 45}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                        {doc.specialization}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {doc.qualifications}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={!selectedDoctor}
                onClick={() => setStep(2)}
                className="btn btn-primary"
                style={{ opacity: selectedDoctor ? 1 : 0.5, padding: '0.75rem 1.5rem' }}
              >
                Continue to Date & Slot <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Pick Date & Time Slot */}
        {step === 2 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Select Appointment Date & Time Slot
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Selected Doctor: <strong style={{ color: '#ffffff' }}>{selectedDoctor?.name}</strong> ({selectedDoctor?.specialization})
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2.5rem' }}>
              {/* Date Input Box */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Choose Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '1rem', padding: '0.85rem' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                  Practitioner Hours: 09:00 - 17:00 (30-minute consultation blocks).
                </div>
              </div>

              {/* Real-Time Live Slot Picker */}
              <div>
                <SlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  isLoading={loadingSlots}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="btn btn-primary"
                style={{ opacity: selectedSlot ? 1 : 0.5 }}
              >
                Continue to Reason <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Consultation Details */}
        {step === 3 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Consultation Details & Symptoms
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Provide details regarding your visit so Dr. {selectedDoctor?.name} can prepare clinical notes.
            </p>

            {/* Mode: In-person vs Video */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Consultation Delivery Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setConsultationType('in-person')}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: consultationType === 'in-person' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                    border: consultationType === 'in-person' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <MapPin size={20} color="#10b981" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700 }}>In-Person Clinic Visit</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>At 42 Healthcare Plaza</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('video-consultation')}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: consultationType === 'video-consultation' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                    border: consultationType === 'video-consultation' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Video size={20} color="#38bdf8" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700 }}>Live Tele-Consultation</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Encrypted WebSocket video & chat</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Symptoms Chips */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Relevant Symptoms (Optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SYMPTOM_OPTIONS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: isSelected ? 'rgba(14, 165, 233, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? 'var(--primary-400)' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--primary-400)' : '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '} {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason for Appointment */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Reason for Consultation *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Discuss routine cardiology ECG results, review blood pressure readings..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Order Review Box */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Booking Summary
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Practitioner:</span>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{selectedDoctor?.name}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>{selectedDate} at {selectedSlot}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Mode:</span>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>{consultationType === 'in-person' ? 'In-Person' : 'Video Telehealth'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total Fee:</span>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>£{selectedDoctor?.consultationFee || 45}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={submitting || !reason.trim()}
                onClick={handleConfirmBooking}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
              >
                {submitting ? 'Confirming with WebSocket...' : 'Instant Confirm & Book'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && bookedAppointment && (
          <div className="glass-panel animate-fade-in" style={{ padding: '3.5rem 2.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                border: '2px solid #10b981',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Appointment Confirmed!
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 2rem auto' }}>
              Your appointment with <strong>Dr. {bookedAppointment.doctor?.name}</strong> has been confirmed and broadcast in real time to the hospital queue.
            </p>

            <div style={{ maxWidth: '480px', margin: '0 auto 2.5rem auto', background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '14px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Ref:</span>
                <strong style={{ color: 'var(--primary-400)' }}>{bookedAppointment._id?.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Slot:</span>
                <strong style={{ color: '#ffffff' }}>{new Date(bookedAppointment.appointmentDate).toDateString()} at {bookedAppointment.timeSlot}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                <strong style={{ color: '#10b981' }}>{bookedAppointment.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-confirmed">Confirmed</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Go to Patient Portal
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setBookedAppointment(null);
                  setSelectedSlot('');
                  setReason('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
