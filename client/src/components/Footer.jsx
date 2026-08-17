import React from 'react';
import { Activity, Phone, Mail, MapPin, ShieldCheck, Heart } from './Icons';
import { Link } from './Router';



export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '6rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(7, 12, 26, 0.95)',
        padding: '4rem 0 2rem 0'
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Col 1: Brand & Accreditation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Activity size={20} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                MediPulse <span style={{ color: 'var(--primary-400)' }}>360</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              An enterprise full-stack clinic & hospital management platform offering real-time appointment scheduling, electronic medical records, and digital consultations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> ISO 27001 & NHS Digital Certified Architecture
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Specialties & Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/doctors?department=Cardiology" style={{ color: 'var(--text-secondary)' }}>Cardiovascular Medicine</Link></li>
              <li><Link to="/doctors?department=Dental" style={{ color: 'var(--text-secondary)' }}>Dental Surgery & Hygiene</Link></li>
              <li><Link to="/doctors?department=General" style={{ color: 'var(--text-secondary)' }}>General Practice & Family Health</Link></li>
              <li><Link to="/doctors?department=Pediatrics" style={{ color: 'var(--text-secondary)' }}>Pediatrics & Child Care</Link></li>
              <li><Link to="/departments" style={{ color: 'var(--text-secondary)' }}>All Hospital Departments</Link></li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              User Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li><Link to="/book" style={{ color: 'var(--text-secondary)' }}>Book an Appointment</Link></li>
              <li><Link to="/patient/dashboard" style={{ color: 'var(--text-secondary)' }}>Patient Health Records</Link></li>
              <li><Link to="/doctor/dashboard" style={{ color: 'var(--text-secondary)' }}>Doctor Clinical Dashboard</Link></li>
              <li><Link to="/admin/dashboard" style={{ color: 'var(--text-secondary)' }}>Administrator Controls</Link></li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Clinic Contacts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="var(--primary-400)" />
                <span>Emergency: +44 (0) 20 7946 0999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--primary-400)" />
                <span>support@medipulse360.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="var(--primary-400)" />
                <span>42 Healthcare Plaza, London, UK</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © 2026 MediPulse 360 Full-Stack Healthcare System. Built for PUSL3120 Assessment.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Engineered with MERN Stack + WebSockets + Docker
          </div>
        </div>
      </div>
    </footer>
  );
}
