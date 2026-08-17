import React, { useState, useEffect } from 'react';
import { Link } from '../components/Router';
import { departmentService } from '../services/departmentService';

import { HeartPulse, Sparkles, Stethoscope, Baby, Activity, ArrowRight, Phone, MapPin, Users } from '../components/Icons';


export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await departmentService.getDepartments();
        if (res.departments) setDepartments(res.departments);
      } catch (err) {
        console.warn(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const getDeptIcon = (name = '') => {
    if (name.includes('Cardio')) return HeartPulse;
    if (name.includes('Dent')) return Sparkles;
    if (name.includes('Ped')) return Baby;
    return Stethoscope;
  };

  return (
    <div className="app-container" style={{ padding: '3.5rem 1.5rem', minHeight: '85vh' }}>
      <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
          Centers of Excellence
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
          Hospital Specialties & Units
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Advanced clinical departments equipped with cutting-edge medical technologies.
        </p>
      </div>

      <div className="grid-cols-3">
        {departments.map((dept) => {
          const Icon = getDeptIcon(dept.name);

          return (
            <div
              key={dept._id}
              className="glass-panel glass-panel-hover"
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: `${dept.color || '#0ea5e9'}20`,
                    color: dept.color || '#0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}
                >
                  <Icon size={28} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                    {dept.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                    {dept.code}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {dept.description}
                </p>

                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--primary-400)" />
                    <span>{dept.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--primary-400)" />
                    <span>{dept.phone}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                  {dept.doctorCount || 1} Specialist{(dept.doctorCount || 1) > 1 ? 's' : ''} on duty
                </span>

                <Link
                  to={`/book?department=${dept._id}`}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Book Specialty <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
