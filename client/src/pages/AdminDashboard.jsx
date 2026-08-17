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
  Edit2,
  Search,
  Activity,
  X,
  CheckCircle2,
  Building2,
  RefreshCw
} from '../components/Icons';



export default function AdminDashboard() {
  const { user } = useAuth();
  const { latestEvent } = useSocket();

  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'departments' | 'doctors' | 'appointments'

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // Add Doctor Form State
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    phone: '',
    specialization: '',
    qualifications: 'MBBS, MD',
    department: '',
    consultationFee: 50,
    bio: ''
  });

  // Add Department Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    location: 'Building A, Level 1',
    phone: '+44 20 7946 0100',
    color: '#0ea5e9'
  });

  const [loadingAction, setLoadingAction] = useState(false);

  const loadAdminData = async () => {
    try {
      const [statRes, deptRes, docRes, appRes] = await Promise.all([
        statsService.getAdminStats(),
        departmentService.getDepartments(),
        userService.getDoctors(),
        appointmentService.getAppointments({ status: statusFilter })
      ]);
      if (statRes.stats) setStats(statRes.stats);
      if (deptRes.departments) setDepartments(deptRes.departments);
      if (docRes.doctors) setDoctors(docRes.doctors);
      if (appRes.appointments) setAllAppointments(appRes.appointments);
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
        consultationFee: 50,
        bio: ''
      });
      loadAdminData();
    } catch (err) {
      alert(`Failed to add doctor: ${err.message}`);
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
        color: '#0ea5e9'
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

  // Reset & Fresh Database
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to FRESH/WIPE the database and re-seed clean default data? This will clear all existing appointments and records.')) return;
    setLoadingAction(true);
    try {
      await statsService.resetDatabase();
      alert('Database has been completely refreshed and seeded with clean initial data!');
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
    <div className="app-container" style={{ padding: '3rem 1.5rem', minHeight: '85vh' }}>
      {/* Admin Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)'
            }}
          >
            <ShieldCheck size={36} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700 }}>
              Hospital Executive Portal
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              System Administration & Clinical Controls
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Director: <strong style={{ color: '#ffffff' }}>{user?.name}</strong> • Real-Time Database State Connected
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDatabase}
            className="btn btn-secondary"
            disabled={loadingAction}
            style={{ fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
            title="Wipe database and re-seed clean default departments and accounts"
          >
            <RefreshCw size={16} /> Fresh & Reset DB
          </button>
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <Building2 size={16} /> Add Specialty
          </button>
          <button
            onClick={() => setShowAddDoctorModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>


      {/* KPI Metrics */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatsCard
          title="Total Consultations"
          value={stats?.totalAppointments ?? 0}
          icon={Calendar}
          subtitle="All scheduled sessions"
          color="#0ea5e9"
          trend="+18% this month"
        />
        <StatsCard
          title="Hospital Revenue"
          value={`£${stats?.totalRevenue ?? 0}`}
          icon={DollarSign}
          subtitle="Consultation earnings"
          color="#10b981"
          trend="+24% YoY"
        />
        <StatsCard
          title="Active Doctors"
          value={stats?.totalDoctors ?? doctors.length}
          icon={Stethoscope}
          subtitle="Practicing consultants"
          color="#8b5cf6"
        />
        <StatsCard
          title="Registered Patients"
          value={stats?.totalPatients ?? 0}
          icon={Users}
          subtitle="Electronic health profiles"
          color="#f59e0b"
        />
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Hospital Overview
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'departments' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'departments' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Specialties & Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'doctors' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'doctors' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Doctor Roster ({doctors.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'appointments' ? '2px solid var(--primary-400)' : '2px solid transparent',
            color: activeTab === 'appointments' ? 'var(--primary-400)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Master Appointments Oversight ({allAppointments.length})
        </button>
      </div>

      {/* TAB 1: Overview & Distribution Breakdown */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
              Appointments Status Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Confirmed Sessions', count: stats?.statusCounts?.confirmed ?? 0, color: '#10b981' },
                { label: 'Completed Consultations', count: stats?.statusCounts?.completed ?? 0, color: '#0ea5e9' },
                { label: 'Pending Allocations', count: stats?.statusCounts?.pending ?? 0, color: '#f59e0b' },
                { label: 'Cancelled / Released Slots', count: stats?.statusCounts?.cancelled ?? 0, color: '#f43f5e' }
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <strong style={{ color: item.color }}>{item.count}</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
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

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
              Departmental Utilization
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {departments.map((dept) => (
                <div key={dept._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{dept.name}</span>
                    <span style={{ color: 'var(--primary-400)' }}>{dept.doctorCount || 1} Doctors</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dept.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Departments Management */}
      {activeTab === 'departments' && (
        <div className="grid-cols-3">
          {departments.map((dept) => (
            <div key={dept._id} className="glass-panel glass-panel-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ padding: '3px 8px', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--primary-400)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {dept.code}
                  </span>
                  <button
                    onClick={() => handleDeleteDept(dept._id)}
                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
                    title="Delete Department"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {dept.name}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {dept.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>📍 {dept.location}</div>
                <div>📞 {dept.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Doctor Roster */}
      {activeTab === 'doctors' && (
        <div className="grid-cols-3">
          {doctors.map((doc) => (
            <div key={doc._id} className="glass-panel glass-panel-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <img
                    src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                    alt="Doctor"
                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleDeleteUser(doc._id)}
                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                    title="Remove Doctor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>{doc.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600 }}>{doc.specialization}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{doc.email}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fee / Consultation</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>£{doc.consultationFee || 45}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Master Appointments Table */}
      {activeTab === 'appointments' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', maxWidth: '350px', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search patient, doctor, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', margin: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    background: statusFilter === st ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {st === '' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>Patient</th>
                  <th style={{ padding: '12px 8px' }}>Doctor</th>
                  <th style={{ padding: '12px 8px' }}>Specialty</th>
                  <th style={{ padding: '12px 8px' }}>Date & Slot</th>
                  <th style={{ padding: '12px 8px' }}>Fee</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: '#ffffff' }}>
                      {app.patient?.name || 'Patient'}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      Dr. {app.doctor?.name}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--primary-400)' }}>
                      {app.department?.name || 'General Practice'}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      {new Date(app.appointmentDate).toLocaleDateString('en-GB')} at {app.timeSlot}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: '#ffffff' }}>
                      £{app.fee || 45}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DOCTOR MODAL */}
      {showAddDoctorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '2.5rem',
              backgroundColor: '#0f172a',
              borderRadius: '18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>Add New Medical Doctor</h3>
              <button onClick={() => setShowAddDoctorModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consultant Neurologist"
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
                    <option value="">Select Specialty</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (£)</label>
                  <input
                    type="number"
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
                <label className="form-label">Bio / Clinical Profile</label>
                <textarea
                  rows={2}
                  placeholder="Specialist credentials, background, and research focus..."
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loadingAction} className="btn btn-primary">
                  {loadingAction ? 'Adding...' : 'Create Doctor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DEPARTMENT MODAL */}
      {showAddDeptModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2.5rem',
              backgroundColor: '#0f172a',
              borderRadius: '18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>Add Specialty Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
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
                  <label className="form-label">Code (Unique) *</label>
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
                <label className="form-label">Department Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview of treatments, diagnostic equipment, and surgical facilities..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddDeptModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loadingAction} className="btn btn-primary">
                  {loadingAction ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
