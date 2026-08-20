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
  CheckCircle2,
  Video,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from '../components/Icons';

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
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Time slot may have just been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '2.5rem 1rem', minHeight: '80vh' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        {/* Wizard Progress Stepper (Horizontal Bar) */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            borderRadius: '16px',
            position: 'relative',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            boxShadow: 'var(--card-shadow)',
            overflow: 'hidden'
          }}
        >
          {/* Top subtle gradient accent strip */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #0284c7, #2563eb, #059669)'
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              width: '100%'
            }}
          >
            {/* Background connecting track line */}
            <div
              style={{
                position: 'absolute',
                top: '22px',
                left: '40px',
                right: '40px',
                height: '3px',
                background: 'var(--border-color)',
                zIndex: 1
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #2563eb)',
                  width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%',
                  transition: 'width 0.35s ease'
                }}
              />
            </div>

            {[
              { num: 1, title: 'Doctor' },
              { num: 2, title: 'Date & Time' },
              { num: 3, title: 'Details' },
              { num: 4, title: 'Confirmation' }
            ].map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (isCompleted) setStep(s.num);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                    zIndex: 2,
                    cursor: isCompleted ? 'pointer' : 'default',
                    minWidth: '70px'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      transition: 'all 0.25s ease',
                      background: isCompleted
                        ? '#059669'
                        : isCurrent
                        ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                        : 'var(--bg-surface)',
                      color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                      border: isCompleted
                        ? '2px solid #a7f3d0'
                        : isCurrent
                        ? '3px solid #bae6fd'
                        : '2px solid var(--border-color)',
                      boxShadow: isCurrent
                        ? '0 4px 14px rgba(2, 132, 199, 0.4)'
                        : isCompleted
                        ? '0 2px 8px rgba(5, 150, 105, 0.3)'
                        : 'none',
                      transform: isCurrent ? 'scale(1.08)' : 'scale(1)'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : s.num}
                  </div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: isCurrent ? 800 : isCompleted ? 700 : 600,
                      color: isCurrent
                        ? '#0284c7'
                        : isCompleted
                        ? '#059669'
                        : 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-rose-bg)',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              borderRadius: '8px',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Department & Doctor */}
        {step === 1 && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '2rem',
              borderRadius: '14px',
              border: '1px solid rgba(2, 132, 199, 0.25)',
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
                background: 'linear-gradient(90deg, #0284c7, #2563eb)'
              }}
            />

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Select a Doctor
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Choose a medical specialty or pick your physician.
            </p>

            {/* Department Filter Pills */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 700 }}>
                Filter by Department
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDept('')}
                  className={`btn btn-sm ${selectedDept === '' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    backgroundColor: selectedDept === '' ? '#0284c7' : undefined
                  }}
                >
                  All Specialties ({doctors.length})
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept._id}
                    type="button"
                    onClick={() => setSelectedDept(dept._id)}
                    className={`btn btn-sm ${selectedDept === dept._id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      borderRadius: '8px',
                      fontWeight: 700,
                      backgroundColor: selectedDept === dept._id ? '#0284c7' : undefined
                    }}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
              }}
            >
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor?._id === doc._id;

                // Color themes
                const spec = (doc.specialization || '').toLowerCase();
                let specBg = '#d1fae5';
                let specText = '#047857';
                let topGradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)';

                if (spec.includes('cardio')) {
                  specBg = '#fee2e2';
                  specText = '#b91c1c';
                  topGradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                } else if (spec.includes('dent')) {
                  specBg = '#e0f2fe';
                  specText = '#0369a1';
                  topGradient = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                } else if (spec.includes('ped')) {
                  specBg = '#fef3c7';
                  specText = '#b45309';
                  topGradient = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
                } else if (spec.includes('ortho')) {
                  specBg = '#ede9fe';
                  specText = '#6d28d9';
                  topGradient = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
                }

                return (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc)}
                    className="glass-panel-hover"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      background: isSelected ? '#eff6ff' : 'var(--bg-surface)',
                      border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isSelected ? '0 6px 20px rgba(2, 132, 199, 0.25)' : 'var(--card-shadow)'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: topGradient
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <div
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: isSelected ? '2px solid #0284c7' : '1.5px solid var(--border-color)',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                            alt={doc.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{doc.name}</h4>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              color: specText,
                              backgroundColor: specBg,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              marginTop: '2px'
                            }}
                          >
                            {doc.specialization}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {doc.qualifications || 'Consultant Specialist'}
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.75rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fee</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#0284c7' : 'var(--text-primary)' }}>
                        Rs. {Number(doc.consultationFee || 1500).toLocaleString()}
                      </span>
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
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  borderRadius: '8px',
                  fontWeight: 700
                }}
              >
                Continue to Date & Time <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Pick Date & Time Slot */}
        {step === 2 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Select Date & Time Slot
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Doctor: <strong style={{ color: 'var(--text-primary)' }}>{selectedDoctor?.name}</strong> ({selectedDoctor?.specialization})
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Date Input Box */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                  Consultation Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.9rem' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Available Hours: {selectedDoctor?.workingHours?.start || '09:00'} - {selectedDoctor?.workingHours?.end || '17:00'}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="btn btn-primary"
              >
                Continue to Details <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Consultation Details */}
        {step === 3 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Consultation Details
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Select your appointment mode and provide a reason for the consultation.
            </p>

            {/* Mode: In-person vs Video */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Consultation Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setConsultationType('in-person')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: consultationType === 'in-person' ? 'var(--accent-emerald-bg)' : 'var(--bg-surface)',
                    border: consultationType === 'in-person' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <MapPin size={20} color="var(--accent-emerald)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>In-Person Clinic Visit</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>At 42 Healthcare Plaza, London</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('video-consultation')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: consultationType === 'video-consultation' ? 'var(--primary-50)' : 'var(--bg-surface)',
                    border: consultationType === 'video-consultation' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Video size={20} color="var(--primary-500)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Video Consultation</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Online telehealth & live chat</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Symptoms Chips */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Relevant Symptoms (Optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SYMPTOM_OPTIONS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                        color: isSelected ? 'var(--primary-600)' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '} {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason for Appointment */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Reason for Appointment *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Routine review, symptoms description, or follow-up check..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Order Review Box */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Doctor:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedDoctor?.name}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Date & Slot:</span>
                  <div style={{ fontWeight: 600, color: 'var(--primary-500)' }}>{selectedDate} at {selectedSlot}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Mode:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {consultationType === 'in-person' ? 'In-Person' : 'Video Telehealth'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Fee:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Rs. {Number(selectedDoctor?.consultationFee || 1500).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-secondary"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                disabled={submitting || !reason.trim()}
                onClick={handleConfirmBooking}
                className="btn btn-primary"
              >
                {submitting ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && bookedAppointment && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '10px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--accent-emerald-bg)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '1px solid rgba(5, 150, 105, 0.3)'
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Appointment Confirmed
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              Your appointment with <strong>Dr. {bookedAppointment.doctor?.name}</strong> has been successfully scheduled.
            </p>

            <div style={{ maxWidth: '420px', margin: '0 auto 2rem auto', background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '8px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Ref:</span>
                <strong style={{ color: 'var(--primary-500)' }}>{bookedAppointment._id?.substring(0, 8).toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{new Date(bookedAppointment.appointmentDate).toDateString()} at {bookedAppointment.timeSlot}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{bookedAppointment.type === 'video-consultation' ? 'Live Telehealth' : 'In-Person'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-confirmed">Confirmed</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="btn btn-primary"
              >
                Go to Patient Dashboard
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setBookedAppointment(null);
                  setSelectedSlot('');
                  setReason('');
                }}
                className="btn btn-secondary"
              >
                Book Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
