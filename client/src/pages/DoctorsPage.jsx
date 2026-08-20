import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from '../components/Router';
import { userService } from '../services/userService';
import { departmentService } from '../services/departmentService';
import { Search, Calendar, MapPin, Clock, Stethoscope, User, ArrowRight } from '../components/Icons';

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
    const matchesSearch =
      !search ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      !selectedDept ||
      doc.department?._id === selectedDept ||
      doc.department?.name?.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="app-container" style={{ padding: '2.5rem 1rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Find a Doctor
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Browse clinic specialists, check consultation fees, and schedule appointments.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '10px'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedDept('')}
            className={`btn btn-sm ${selectedDept === '' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px' }}
          >
            All Specialties
          </button>
          {departments.map((dept) => (
            <button
              key={dept._id}
              onClick={() => setSelectedDept(dept._id)}
              className={`btn btn-sm ${selectedDept === dept._id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '6px' }}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '10px' }}>
          <Stethoscope size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {doctors.length === 0 ? 'No Doctors on Hospital Roster' : 'No Matching Doctors Found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {doctors.length === 0
              ? 'The hospital roster is currently empty. System Administrators can register doctors in the Admin Panel.'
              : 'Try adjusting your search query or specialty filter.'}
          </p>
          {doctors.length === 0 && (
            <Link to="/login" className="btn btn-primary btn-sm">
              Admin Login
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredDoctors.map((doc) => {
            const spec = (doc.specialization || '').toLowerCase();
            let specColor = '#059669';
            let specBg = '#d1fae5';
            let specText = '#047857';
            let topGradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)';

            if (spec.includes('cardio')) {
              specColor = '#ef4444';
              specBg = '#fee2e2';
              specText = '#b91c1c';
              topGradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            } else if (spec.includes('dent')) {
              specColor = '#0284c7';
              specBg = '#e0f2fe';
              specText = '#0369a1';
              topGradient = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
            } else if (spec.includes('ped')) {
              specColor = '#d97706';
              specBg = '#fef3c7';
              specText = '#b45309';
              topGradient = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
            } else if (spec.includes('ortho')) {
              specColor = '#7c3aed';
              specBg = '#ede9fe';
              specText = '#6d28d9';
              topGradient = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
            }

            return (
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
                  border: '1px solid var(--border-color)',
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
                    background: topGradient
                  }}
                />

                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        background: 'var(--primary-50)',
                        color: 'var(--primary-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        border: '1px solid var(--border-color)',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {doc.avatar ? (
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Stethoscope size={24} />
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: specText,
                          backgroundColor: specBg,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '2px',
                          marginBottom: '2px'
                        }}
                      >
                        {doc.specialization}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {doc.qualifications || 'Consultant Specialist'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {doc.bio || 'Experienced physician providing clinical assessments and personalized care.'}
                  </p>

                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color={specColor} />
                      <span>Location: {doc.department?.location || 'Main Clinic Wing'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color={specColor} />
                      <span>Hours: {doc.workingHours?.start || '09:00'} - {doc.workingHours?.end || '17:00'}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Fee</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Rs. {Number(doc.consultationFee || 1500).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    to={`/book?doctor=${doc._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Book Consultation <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
