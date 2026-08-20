import React, { useState, useEffect } from 'react';
import { Link } from '../components/Router';
import { departmentService } from '../services/departmentService';
import { userService } from '../services/userService';
import {
  Activity,
  Calendar,
  Clock,
  Video,
  ArrowRight,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Baby,
  Users,
  CheckCircle2,
  PhoneCall,
  FileText,
  Shield
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
        if (deptRes.departments) setDepartments(deptRes.departments);
        if (docRes.doctors) setFeaturedDoctors(docRes.doctors.slice(0, 3));
      } catch (err) {
        console.warn('Error loading homepage data:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getDeptTheme = (name = '', code = '') => {
    const n = (name + ' ' + code).toLowerCase();
    if (n.includes('cardio') || n.includes('card')) {
      return {
        icon: HeartPulse,
        primaryColor: '#ef4444',
        bgLight: 'rgba(239, 68, 68, 0.08)',
        badgeBg: '#fee2e2',
        badgeText: '#b91c1c',
        borderAccent: '#fca5a5',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        cardBorder: 'rgba(239, 68, 68, 0.25)'
      };
    }
    if (n.includes('dent')) {
      return {
        icon: Sparkles,
        primaryColor: '#0284c7',
        bgLight: 'rgba(2, 132, 199, 0.08)',
        badgeBg: '#e0f2fe',
        badgeText: '#0369a1',
        borderAccent: '#7dd3fc',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        cardBorder: 'rgba(2, 132, 199, 0.25)'
      };
    }
    if (n.includes('ped') || n.includes('child')) {
      return {
        icon: Baby,
        primaryColor: '#d97706',
        bgLight: 'rgba(217, 119, 6, 0.08)',
        badgeBg: '#fef3c7',
        badgeText: '#b45309',
        borderAccent: '#fcd34d',
        gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        cardBorder: 'rgba(217, 119, 6, 0.25)'
      };
    }
    if (n.includes('ortho') || n.includes('bone')) {
      return {
        icon: Activity,
        primaryColor: '#7c3aed',
        bgLight: 'rgba(124, 58, 237, 0.08)',
        badgeBg: '#ede9fe',
        badgeText: '#6d28d9',
        borderAccent: '#c4b5fd',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        cardBorder: 'rgba(124, 58, 237, 0.25)'
      };
    }
    // General Practice / Default
    return {
      icon: Stethoscope,
      primaryColor: '#059669',
      bgLight: 'rgba(5, 150, 105, 0.08)',
      badgeBg: '#d1fae5',
      badgeText: '#047857',
      borderAccent: '#6ee7b7',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      cardBorder: 'rgba(5, 150, 105, 0.25)'
    };
  };

  return (
    <div style={{ paddingBottom: '2.5rem' }}>
      {/* Hero Section */}
      <section style={{ padding: '3.5rem 0 3rem 0' }}>
        <div className="app-container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '999px',
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                color: 'var(--primary-600)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1.25rem'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
              Hospital & Clinic Appointment Management System
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Schedule Doctor Appointments & Consultations Online
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '640px', margin: '0 auto 2rem auto' }}>
              Connect with hospital specialists in Cardiology, Dental Care, General Practice, Pediatrics, and Orthopedics. Book in-person visits or live video consultations with instant slot confirmation.
            </p>

            {/* CTA Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link to="/book" className="btn btn-primary btn-lg">
                <Calendar size={17} /> Book an Appointment
              </Link>
              <Link to="/doctors" className="btn btn-secondary btn-lg">
                Find a Doctor <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* 4 Feature Highlight Cards */}
          <div
            style={{
              marginTop: '3.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {/* Card 1: Verified Doctors */}
            <div
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #0284c7, #38bdf8)'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      border: '1.5px solid #7dd3fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
                    }}
                  >
                    <Stethoscope size={24} color="#0284c7" />
                  </div>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd'
                    }}
                  >
                    Certified MDs
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Verified Doctors
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Consult board-certified physicians across primary care and specialized hospital departments.
                </p>
              </div>
            </div>

            {/* Card 2: In-Person & Telehealth */}
            <div
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #059669, #34d399)'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: '#d1fae5',
                      color: '#059669',
                      border: '1.5px solid #6ee7b7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
                    }}
                  >
                    <Video size={24} color="#059669" />
                  </div>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      backgroundColor: '#d1fae5',
                      color: '#047857',
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    HD Video & Clinic
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  In-Person & Telehealth
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Choose traditional hospital clinic visits or attend secure live video appointments from home.
                </p>
              </div>
            </div>

            {/* Card 3: Real-Time Availability */}
            <div
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #7c3aed, #a78bfa)'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: '#ede9fe',
                      color: '#7c3aed',
                      border: '1.5px solid #c4b5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)'
                    }}
                  >
                    <Clock size={24} color="#7c3aed" />
                  </div>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      border: '1px solid #ddd6fe'
                    }}
                  >
                    Instant Booking
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Real-Time Availability
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Live slot calendar prevents double-booking and updates availability instantly across all users.
                </p>
              </div>
            </div>

            {/* Card 4: Digital Prescriptions */}
            <div
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #d97706, #fbbf24)'
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: '#fef3c7',
                      color: '#d97706',
                      border: '1.5px solid #fcd34d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
                    }}
                  >
                    <FileText size={24} color="#d97706" />
                  </div>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a'
                    }}
                  >
                    Digital Rx
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Digital Prescriptions
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Access full consultation notes, recorded vitals, and printable electronic prescription sheets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Departments Section (Horizontal Grid with Vibrant Colors) */}
      <section style={{ padding: '3.5rem 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 700, letterSpacing: '0.04em' }}>
                Hospital Departments
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                Medical Specialties
              </h2>
            </div>
            <Link to="/departments" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-500)' }}>
              View all departments <ArrowRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {departments.map((dept) => {
              const theme = getDeptTheme(dept.name, dept.code);
              const Icon = theme.icon;

              return (
                <div
                  key={dept._id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                    borderRadius: '14px',
                    border: `1px solid ${theme.cardBorder}`,
                    backgroundColor: 'var(--bg-surface)',
                    boxShadow: 'var(--card-shadow)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Color Accent Strip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: theme.gradient
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          backgroundColor: theme.bgLight,
                          color: theme.primaryColor,
                          border: `1px solid ${theme.borderAccent}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={24} color={theme.primaryColor} />
                      </div>

                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '5px',
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                          border: `1px solid ${theme.borderAccent}`
                        }}
                      >
                        {dept.code}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {dept.name}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {dept.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {dept.location || 'Clinic'}
                    </span>
                    <Link
                      to={`/book?department=${dept._id}`}
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: theme.primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Book <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 700, letterSpacing: '0.04em' }}>
                Consultants & Physicians
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                Featured Doctors
              </h2>
            </div>
            <Link to="/doctors" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-500)' }}>
              View all doctors <ArrowRight size={15} />
            </Link>
          </div>

          {featuredDoctors.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '10px' }}>
              <Stethoscope size={36} style={{ margin: '0 auto 0.5rem auto', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Doctors on Roster Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                System Administrators can add doctors and clinic units through the Admin Portal.
              </p>
              <Link to="/login" className="btn btn-primary btn-sm">
                Admin Sign In
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {featuredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-surface)',
                    boxShadow: 'var(--card-shadow)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <img
                        src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                        alt={doc.name}
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {doc.name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 600, display: 'block' }}>
                          {doc.specialization}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.qualifications || 'Consultant Specialist'}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {doc.bio || 'Consultant physician providing clinical assessments and patient consultations.'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Fee</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Rs. {Number(doc.consultationFee || 1500).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      to={`/book?doctor=${doc._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Emergency Callout Section */}
      <section style={{ padding: '2rem 0' }}>
        <div className="app-container">
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'var(--accent-rose-bg)',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <PhoneCall size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Need Immediate Clinical Assistance?
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  For urgent health evaluations and clinical emergencies, call our dedicated triage hotline.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href="tel:+442079460000" className="btn btn-secondary">
                <PhoneCall size={15} /> +44 20 7946 0000
              </a>
              <Link to="/book" className="btn btn-primary">
                Book Visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
