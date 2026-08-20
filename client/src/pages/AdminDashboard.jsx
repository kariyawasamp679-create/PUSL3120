import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { statsService } from '../services/statsService';
import { departmentService } from '../services/departmentService';
import { userService } from '../services/userService';
import { appointmentService } from '../services/appointmentService';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  ShieldCheck,
  Stethoscope,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Search,
  X,
  Building2,
  RefreshCw,
  HeartPulse,
  Sparkles,
  Baby,
  Activity,
  MapPin,
  Phone
} from '../components/Icons';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { latestEvent } = useSocket();

  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'departments' | 'doctors' | 'patients' | 'appointments'

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  // Add Doctor Form State
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    phone: '',
    specialization: '',
    qualifications: 'MBBS, MD',
    department: '',
    consultationFee: 1500,
    bio: ''
  });

  // Add Patient Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    phone: '',
    bloodGroup: 'O+',
    address: ''
  });

  // Add Department Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    location: 'Building A, Level 1',
    phone: '+44 20 7946 0100',
    color: '#0284c7'
  });

  const [loadingAction, setLoadingAction] = useState(false);

  const loadAdminData = async () => {
    try {
      const [statRes, deptRes, docRes, appRes, patRes] = await Promise.all([
        statsService.getAdminStats(),
        departmentService.getDepartments(),
        userService.getDoctors(),
        appointmentService.getAppointments({ status: statusFilter }),
        userService.getAllUsers({ role: 'patient' })
      ]);
      if (statRes.stats) setStats(statRes.stats);
      if (deptRes.departments) setDepartments(deptRes.departments);
      if (docRes.doctors) setDoctors(docRes.doctors);
      if (appRes.appointments) setAllAppointments(appRes.appointments);
      if (patRes.users) setPatients(patRes.users);
    } catch (err) {
      console.warn('Failed to load admin data:', err.message);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter, latestEvent]);

  // Handle Add Doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await userService.createDoctor(doctorForm);
      setShowAddDoctorModal(false);
      setDoctorForm({
        name: '',
        email: '',
        password: 'Password123!',
        phone: '',
        specialization: '',
        qualifications: 'MBBS, MD',
        department: '',
        consultationFee: 1500,
        bio: ''
      });
      loadAdminData();
    } catch (err) {
      alert(`Failed to add doctor: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Add Patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await userService.createPatient(patientForm);
      setShowAddPatientModal(false);
      alert(`Patient account for "${patientForm.name}" registered successfully!\n\nEmail: ${patientForm.email}\nPassword: ${patientForm.password}\n\nThe patient can now sign in at http://localhost:5173/login`);
      setPatientForm({
        name: '',
        email: '',
        password: 'Password123!',
        phone: '',
        bloodGroup: 'O+',
        address: ''
      });
      loadAdminData();
    } catch (err) {
      alert(`Failed to add patient: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Add Department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      await departmentService.createDepartment(deptForm);
      setShowAddDeptModal(false);
      setDeptForm({
        name: '',
        code: '',
        description: '',
        location: 'Building A, Level 1',
        phone: '+44 20 7946 0100',
        color: '#0284c7'
      });
      loadAdminData();
    } catch (err) {
      alert(`Failed to add department: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Delete Department
  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.deleteDepartment(id);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Doctor/User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the active roster?')) return;
    try {
      await userService.deleteUser(id);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to remove user');
    }
  };

  // Reset & Fresh Database
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database to default seed data? This will clear any newly created test appointments.')) return;
    setLoadingAction(true);
    try {
      await statsService.resetDatabase();
      alert('Database refreshed successfully with clean seed data.');
      await loadAdminData();
    } catch (err) {
      alert(`Failed to reset database: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredAppointments = allAppointments.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.patient?.name?.toLowerCase().includes(q) ||
      app.doctor?.name?.toLowerCase().includes(q) ||
      app.reason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-container" style={{ padding: '2.5rem 1rem', minHeight: '80vh' }}>
      {/* Admin Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
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
            background: 'linear-gradient(90deg, #0284c7, #2563eb, #7c3aed)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
              border: '1.5px solid #7dd3fc',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
            }}
          >
            <ShieldCheck size={28} color="#0284c7" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#0284c7', fontWeight: 800, letterSpacing: '0.05em', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                Hospital Administration
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              Hospital Management Panel
            </h1>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Administrator: <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDatabase}
            className="btn btn-sm"
            disabled={loadingAction}
            style={{
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              border: '1px solid rgba(225, 29, 72, 0.35)',
              fontWeight: 700,
              borderRadius: '8px'
            }}
            title="Reset database with fresh seed data"
          >
            <RefreshCw size={14} /> Reset Data
          </button>
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="btn btn-sm"
            style={{
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          >
            <Building2 size={14} /> Add Department
          </button>
          <button
            onClick={() => setShowAddDoctorModal(true)}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Plus size={14} /> Add Doctor
          </button>
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="btn btn-sm"
            style={{
              backgroundColor: '#fef3c7',
              color: '#b45309',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          >
            <Plus size={14} /> Add Patient
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatsCard
          title="Total Consultations"
          value={stats?.totalAppointments ?? 0}
          icon={Calendar}
          subtitle="Scheduled sessions"
          color="#0284c7"
          bgLight="#e0f2fe"
          borderAccent="#7dd3fc"
          gradient="linear-gradient(90deg, #0284c7, #38bdf8)"
          cardBorder="rgba(2, 132, 199, 0.25)"
        />
        <StatsCard
          title="Total Revenue"
          value={`Rs. ${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle="Consultation fees"
          color="#059669"
          bgLight="#d1fae5"
          borderAccent="#6ee7b7"
          gradient="linear-gradient(90deg, #059669, #34d399)"
          cardBorder="rgba(5, 150, 105, 0.25)"
        />
        <StatsCard
          title="Active Doctors"
          value={stats?.totalDoctors ?? doctors.length}
          icon={Stethoscope}
          subtitle="Consultants on roster"
          color="#7c3aed"
          bgLight="#ede9fe"
          borderAccent="#c4b5fd"
          gradient="linear-gradient(90deg, #7c3aed, #a78bfa)"
          cardBorder="rgba(124, 58, 237, 0.25)"
        />
        <StatsCard
          title="Registered Patients"
          value={stats?.totalPatients ?? patients.length}
          icon={Users}
          subtitle="Active patient accounts"
          color="#d97706"
          bgLight="#fef3c7"
          borderAccent="#fcd34d"
          gradient="linear-gradient(90deg, #d97706, #fbbf24)"
          cardBorder="rgba(217, 119, 6, 0.25)"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="tab-container" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Hospital Overview
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
        >
          Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
        >
          Doctors Roster ({doctors.length})
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
        >
          Patients ({patients.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
        >
          Master Appointments ({allAppointments.length})
        </button>
      </div>

      {/* TAB 1: Overview & Distribution Breakdown */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: '14px',
              border: '1px solid rgba(5, 150, 105, 0.25)',
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
                background: 'linear-gradient(90deg, #059669, #0284c7)'
              }}
            />

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Appointment Status Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Confirmed Appointments', count: stats?.statusCounts?.confirmed ?? 0, color: '#059669', bg: '#d1fae5' },
                { label: 'Completed Consultations', count: stats?.statusCounts?.completed ?? 0, color: '#0284c7', bg: '#e0f2fe' },
                { label: 'Pending Bookings', count: stats?.statusCounts?.pending ?? 0, color: '#d97706', bg: '#fef3c7' },
                { label: 'Cancelled Appointments', count: stats?.statusCounts?.cancelled ?? 0, color: '#e11d48', bg: '#fff1f2' }
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
                    <strong style={{ color: item.color, backgroundColor: item.bg, padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {item.count}
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(5, (item.count / ((stats?.totalAppointments || 1) + 1)) * 100))}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: '14px',
              border: '1px solid rgba(124, 58, 237, 0.25)',
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
                background: 'linear-gradient(90deg, #7c3aed, #0284c7)'
              }}
            />

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Department Capacities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {departments.map((dept) => {
                const n = (dept.name + ' ' + dept.code).toLowerCase();
                let pillColor = '#059669';
                let pillBg = '#d1fae5';
                if (n.includes('cardio') || n.includes('card')) {
                  pillColor = '#ef4444';
                  pillBg = '#fee2e2';
                } else if (n.includes('dent')) {
                  pillColor = '#0284c7';
                  pillBg = '#e0f2fe';
                } else if (n.includes('ped')) {
                  pillColor = '#d97706';
                  pillBg = '#fef3c7';
                } else if (n.includes('ortho')) {
                  pillColor = '#7c3aed';
                  pillBg = '#ede9fe';
                }

                return (
                  <div
                    key={dept._id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: pillBg, color: pillColor }}>
                          {dept.code}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>{dept.name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Location: {dept.location}</div>
                    </div>
                    <span style={{ color: pillColor, fontWeight: 700, fontSize: '0.8rem', background: pillBg, padding: '4px 8px', borderRadius: '6px' }}>
                      {dept.doctorCount || 1} Doctor{(dept.doctorCount || 1) > 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Departments Management */}
      {activeTab === 'departments' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {departments.map((dept) => {
            const n = (dept.name + ' ' + dept.code).toLowerCase();
            let theme = {
              icon: Stethoscope,
              primaryColor: '#059669',
              bgLight: 'rgba(5, 150, 105, 0.08)',
              badgeBg: '#d1fae5',
              badgeText: '#047857',
              borderAccent: '#6ee7b7',
              gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              cardBorder: 'rgba(5, 150, 105, 0.25)'
            };
            if (n.includes('cardio') || n.includes('card')) {
              theme = {
                icon: HeartPulse,
                primaryColor: '#ef4444',
                bgLight: 'rgba(239, 68, 68, 0.08)',
                badgeBg: '#fee2e2',
                badgeText: '#b91c1c',
                borderAccent: '#fca5a5',
                gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                cardBorder: 'rgba(239, 68, 68, 0.25)'
              };
            } else if (n.includes('dent')) {
              theme = {
                icon: Sparkles,
                primaryColor: '#0284c7',
                bgLight: 'rgba(2, 132, 199, 0.08)',
                badgeBg: '#e0f2fe',
                badgeText: '#0369a1',
                borderAccent: '#7dd3fc',
                gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                cardBorder: 'rgba(2, 132, 199, 0.25)'
              };
            } else if (n.includes('ped') || n.includes('child')) {
              theme = {
                icon: Baby,
                primaryColor: '#d97706',
                bgLight: 'rgba(217, 119, 6, 0.08)',
                badgeBg: '#fef3c7',
                badgeText: '#b45309',
                borderAccent: '#fcd34d',
                gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                cardBorder: 'rgba(217, 119, 6, 0.25)'
              };
            } else if (n.includes('ortho') || n.includes('bone')) {
              theme = {
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
                  borderRadius: '12px',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: theme.bgLight,
                        color: theme.primaryColor,
                        border: `1px solid ${theme.borderAccent}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={22} color={theme.primaryColor} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          background: theme.badgeBg,
                          color: theme.badgeText,
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          border: `1px solid ${theme.borderAccent}`
                        }}
                      >
                        {dept.code}
                      </span>
                      <button
                        onClick={() => handleDeleteDept(dept._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                        title="Delete Department"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {dept.name}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {dept.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <MapPin size={13} color={theme.primaryColor} />
                    <span>Location: {dept.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color={theme.primaryColor} />
                    <span>Phone: {dept.phone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Doctor Roster */}
      {activeTab === 'doctors' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {doctors.map((doc) => {
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        background: 'var(--primary-50)',
                        color: 'var(--primary-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        border: '1px solid var(--border-color)',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {doc.avatar ? (
                        <img
                          src={doc.avatar}
                          alt="Doctor"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Stethoscope size={24} />
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteUser(doc._id)}
                      style={{ background: '#fff1f2', border: '1px solid rgba(225, 29, 72, 0.25)', borderRadius: '6px', color: 'var(--accent-rose)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove Doctor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{doc.name}</h4>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: specText,
                      backgroundColor: specBg,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '4px',
                      marginBottom: '4px'
                    }}
                  >
                    {doc.specialization}
                  </span>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{doc.email}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fee</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Rs. {Number(doc.consultationFee || 1500).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: Registered Patients Roster */}
      {activeTab === 'patients' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {patients.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px', gridColumn: '1 / -1' }}>
              <Users size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Registered Patients Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Use the "Add Patient" button above to register a patient, or patients can self-register on the registration page.
              </p>
              <button onClick={() => setShowAddPatientModal(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add First Patient
              </button>
            </div>
          ) : (
            patients.map((pat) => (
              <div
                key={pat._id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface)',
                  boxShadow: 'var(--card-shadow)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
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
                    background: 'linear-gradient(90deg, #d97706, #fbbf24)'
                  }}
                />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        background: '#fef3c7',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        border: '1.5px solid #fcd34d',
                        flexShrink: 0
                      }}
                    >
                      {pat.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          background: '#fef3c7',
                          color: '#b45309',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          border: '1px solid #fde68a'
                        }}
                      >
                        Blood: {pat.bloodGroup || 'O+'}
                      </span>
                      <button
                        onClick={() => handleDeleteUser(pat._id)}
                        style={{ background: '#fff1f2', border: '1px solid rgba(225, 29, 72, 0.25)', borderRadius: '6px', color: 'var(--accent-rose)', cursor: 'pointer', padding: '5px' }}
                        title="Remove Patient Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pat.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{pat.email}</div>
                  {pat.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Phone: {pat.phone}</div>}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {pat._id?.substring(0, 8).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    Active Patient
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: Master Appointments Table */}
      {activeTab === 'appointments' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search patient, doctor, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', margin: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px', textTransform: 'capitalize' }}
                >
                  {st === '' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date & Time</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No appointments registered in the system.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {app.patient?.name || 'Patient'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        Dr. {app.doctor?.name}
                      </td>
                      <td style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
                        {app.department?.name || 'General Practice'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(app.appointmentDate).toLocaleDateString('en-GB')} at {app.timeSlot}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Rs. {Number(app.fee || 1500).toLocaleString()}
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DOCTOR MODAL */}
      {showAddDoctorModal && (
        <div className="modal-backdrop" onClick={() => setShowAddDoctorModal(false)}>
          <div
            className="modal-card animate-fade-in"
            style={{ maxWidth: '600px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add New Doctor</h3>
              <button onClick={() => setShowAddDoctorModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor}>
              <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Alexander Wright"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alexander@medipulse.com"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neurologist"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    required
                    value={doctorForm.department}
                    onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (Rs.) *</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={doctorForm.consultationFee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualifications</label>
                  <input
                    type="text"
                    value={doctorForm.qualifications}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  rows={2}
                  placeholder="Physician credentials and background..."
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loadingAction} className="btn btn-primary btn-sm">
                  {loadingAction ? 'Adding...' : 'Create Doctor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DEPARTMENT MODAL */}
      {showAddDeptModal && (
        <div className="modal-backdrop" onClick={() => setShowAddDeptModal(false)}>
          <div
            className="modal-card animate-fade-in"
            style={{ maxWidth: '540px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ophthalmology"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="OPHTH"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of clinical specialty..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Clinic Location</label>
                  <input
                    type="text"
                    value={deptForm.location}
                    onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    value={deptForm.phone}
                    onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowAddDeptModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loadingAction} className="btn btn-primary btn-sm">
                  {loadingAction ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PATIENT MODAL */}
      {showAddPatientModal && (
        <div className="modal-backdrop" onClick={() => setShowAddPatientModal(false)}>
          <div
            className="modal-card animate-fade-in"
            style={{ maxWidth: '540px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Register New Patient</h3>
              </div>
              <button onClick={() => setShowAddPatientModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePatient}>
              <div className="form-group">
                <label className="form-label">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={patientForm.password}
                    onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+44 7911 123456"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    value={patientForm.bloodGroup}
                    onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                    className="form-select"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. 14 High St, London"
                  value={patientForm.address}
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddPatientModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '8px'
                  }}
                >
                  {loadingAction ? 'Registering...' : 'Register Patient Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
