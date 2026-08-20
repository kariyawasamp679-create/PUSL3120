import React from 'react';
import { Activity, Phone, Mail, MapPin, CheckCircle2 } from './Icons';
import { Link } from './Router';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '4rem',
        borderTop: '3px solid #38bdf8',
        background: 'linear-gradient(135deg, #075985 0%, #0369a1 50%, #0284c7 100%)',
        padding: '3.5rem 0 1.75rem 0',
        color: '#ffffff',
        boxShadow: '0 -4px 20px rgba(2, 132, 199, 0.15)'
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Col 1: Brand & Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                <Activity size={20} color="#0284c7" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                MediPulse <span style={{ color: '#bae6fd' }}>360</span>
              </span>
            </div>
            <p style={{ color: '#e0f2fe', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              A modern healthcare management and clinical scheduling platform with electronic prescriptions, doctor rosters, and real-time consultation support.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a7f3d0', fontSize: '0.8rem', fontWeight: 700 }}>
              <CheckCircle2 size={16} color="#34d399" /> Hospital Management Suite
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.02em' }}>
              Medical Specialties
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li><Link to="/doctors?department=Cardiology" style={{ color: '#bae6fd', textDecoration: 'none' }}>Cardiovascular Medicine</Link></li>
              <li><Link to="/doctors?department=Dental" style={{ color: '#bae6fd', textDecoration: 'none' }}>Dental Surgery</Link></li>
              <li><Link to="/doctors?department=General" style={{ color: '#bae6fd', textDecoration: 'none' }}>General Practice</Link></li>
              <li><Link to="/doctors?department=Pediatrics" style={{ color: '#bae6fd', textDecoration: 'none' }}>Pediatrics</Link></li>
              <li><Link to="/departments" style={{ color: '#bae6fd', textDecoration: 'none' }}>All Departments</Link></li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.02em' }}>
              Navigation & Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li><Link to="/book" style={{ color: '#bae6fd', textDecoration: 'none' }}>Book an Appointment</Link></li>
              <li><Link to="/doctors" style={{ color: '#bae6fd', textDecoration: 'none' }}>Our Doctors</Link></li>
              <li><Link to="/patient/dashboard" style={{ color: '#bae6fd', textDecoration: 'none' }}>Patient Dashboard</Link></li>
              <li><Link to="/doctor/dashboard" style={{ color: '#bae6fd', textDecoration: 'none' }}>Doctor Dashboard</Link></li>
              <li><Link to="/admin/dashboard" style={{ color: '#bae6fd', textDecoration: 'none' }}>Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '0.02em' }}>
              Hospital Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#e0f2fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#7dd3fc" />
                <span>Tel: +44 (0) 20 7946 0999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#7dd3fc" />
                <span>contact@medipulse360.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} color="#7dd3fc" />
                <span>42 Healthcare Plaza, London, UK</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: '#bae6fd'
          }}
        >
          <div>
            © 2026 MediPulse 360 – PUSL3120 Full-Stack Healthcare Management System.
          </div>
          <div>
            React • Node.js • Express • MongoDB • Socket.IO
          </div>
        </div>
      </div>
    </footer>
  );
}
