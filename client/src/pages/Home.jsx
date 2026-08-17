import React, { useState, useEffect } from 'react';
import { Link } from '../components/Router';
import { departmentService } from '../services/departmentService';

import { userService } from '../services/userService';
import {
  Activity,
  Calendar,
  ShieldCheck,
  Clock,
  Video,
  Award,
  ArrowRight,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Baby,
  Users,
  CheckCircle2,
  PhoneCall
} from '../components/Icons';


export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentService.getDepartments(),
          userService.getDoctors()
        ]);
        if (deptRes.departments) setDepartments(deptRes.departments.slice(0, 4));
        if (docRes.doctors) setFeaturedDoctors(docRes.doctors.slice(0, 3));
      } catch (err) {
        console.warn('Error loading homepage data:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getDeptIcon = (name = '') => {
    if (name.includes('Cardio')) return HeartPulse;
    if (name.includes('Dent')) return Sparkles;
    if (name.includes('Ped')) return Baby;
    return Stethoscope;
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative' }}>
        <div className="app-container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Live Pulsing Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                color: 'var(--primary-400)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.5rem'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
              Real-Time Intelligent Healthcare & Tele-Consultation Platform
            </div>

            <h1 style={{ fontSize: '3.25rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Advanced Clinical Care & <span className="gradient-text">Instant Specialist Booking</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '680px', margin: '0 auto 2.5rem auto' }}>
              Schedule in-person or live video appointments with certified practitioners in Cardiology, Dental Surgery, General Practice, and Pediatrics. Experience real-time slot synchronisation and digital prescriptions.
            </p>

            {/* CTA Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/book" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1.05rem' }}>
                <Calendar size={18} /> Book Consultation Now
              </Link>
              <Link to="/doctors" className="btn btn-secondary" style={{ padding: '0.85rem 1.6rem', fontSize: '1.05rem' }}>
                Find Specialists <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div
            className="glass-panel"
            style={{
              marginTop: '4rem',
              padding: '1.75rem 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>99.8%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Diagnostic Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>&lt; 15 Mins</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Wait Time</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>15,000+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Consultations Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>24 / 7</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Real-Time Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Departments Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Center of Excellence
              </span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                Medical Specialties & Departments
              </h2>
            </div>
            <Link to="/departments" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              View all specialties <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-cols-4">
            {departments.map((dept) => {
              const Icon = getDeptIcon(dept.name);
              return (
                <div
                  key={dept._id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px'
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: `${dept.color || '#0ea5e9'}20`,
                        color: dept.color || '#0ea5e9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                      {dept.name}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {dept.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {dept.doctorCount || 1} Specialist{(dept.doctorCount || 1) > 1 ? 's' : ''}
                    </span>
                    <Link to={`/book?department=${dept._id}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                      Book &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section style={{ padding: '4rem 0', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
              Certified Practitioners
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              Meet Our Senior Consultants
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Board-certified practitioners with decades of clinical excellence.
            </p>
          </div>

          <div className="grid-cols-3">
            {featuredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="glass-panel glass-panel-hover"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                    <img
                      src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                      alt={doc.name}
                      style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(14, 165, 233, 0.4)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                        {doc.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, display: 'block' }}>
                        {doc.specialization}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.qualifications}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {doc.bio || 'Experienced consultant dedicated to evidence-based healthcare and patient wellness.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation Fee</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      £{doc.consultationFee || 45}
                    </div>
                  </div>

                  <Link
                    to={`/book?doctor=${doc._id}`}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Callout Banner */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="app-container">
          <div
            className="glass-panel"
            style={{
              padding: '2.5rem 3rem',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem'
            }}
          >
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                <PhoneCall size={16} /> Urgent Care & 24/7 Triage
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                Require Urgent Medical Assistance?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', marginTop: '6px' }}>
                For emergency medical assistance or trauma cases, contact our emergency duty officer directly or dial 999.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="tel:+442079460999"
                className="btn btn-danger"
                style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', fontWeight: 700 }}
              >
                Call +44 (0) 20 7946 0999
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
