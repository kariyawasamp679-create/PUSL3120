import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from '../components/Router';
import { userService } from '../services/userService';

import { departmentService } from '../services/departmentService';
import { Search, Calendar, Star, Clock, MapPin, Award, CheckCircle2 } from '../components/Icons';


export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const deptParam = searchParams.get('department');
    if (deptParam) setSelectedDept(deptParam);

    async function load() {
      try {
        const [docRes, deptRes] = await Promise.all([
          userService.getDoctors(),
          departmentService.getDepartments()
        ]);
        if (docRes.doctors) setDoctors(docRes.doctors);
        if (deptRes.departments) setDepartments(deptRes.departments);
      } catch (err) {
        console.warn(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [searchParams]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = !search || doc.name.toLowerCase().includes(search.toLowerCase()) || doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !selectedDept || (doc.department?._id === selectedDept || doc.department?.name?.toLowerCase().includes(selectedDept.toLowerCase()));
    return matchesSearch && matchesDept;
  });

  return (
    <div className="app-container" style={{ padding: '3.5rem 1.5rem', minHeight: '85vh' }}>
      <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700 }}>
          Clinical Directory
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
          Find Board-Certified Specialists
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Browse our certified physicians and book in-person or telehealth consultations.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.75rem',
          marginBottom: '2.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by doctor name or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '42px', margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedDept('')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: selectedDept === '' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: '1px solid var(--border-color)'
            }}
          >
            All Specialties
          </button>
          {departments.map((dept) => (
            <button
              key={dept._id}
              onClick={() => setSelectedDept(dept._id)}
              style={{
                padding: '8px 16px',
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

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Doctors Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search query or department filter.</p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="glass-panel glass-panel-hover"
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <img
                    src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                    alt={doc.name}
                    style={{ width: '68px', height: '68px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(14, 165, 233, 0.4)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{doc.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600, display: 'block' }}>
                      {doc.specialization}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.qualifications}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {doc.bio || 'Experienced senior consultant with a focus on comprehensive preventive diagnosis.'}
                </p>

                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <div>📍 Location: {doc.department?.location || 'Main Hospital Wing'}</div>
                  <div>🕒 Availability: {doc.workingHours?.start || '09:00'} - {doc.workingHours?.end || '17:00'}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session Fee</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>£{doc.consultationFee || 45}</div>
                </div>

                <Link
                  to={`/book?doctor=${doc._id}`}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  <Calendar size={16} /> Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
