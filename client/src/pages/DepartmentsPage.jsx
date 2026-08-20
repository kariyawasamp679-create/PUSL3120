import React, { useState, useEffect } from 'react';
import { Link } from '../components/Router';
import { departmentService } from '../services/departmentService';
import { HeartPulse, Sparkles, Stethoscope, Baby, Activity, ArrowRight, Phone, MapPin, Building2 } from '../components/Icons';

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
    <div className="app-container" style={{ padding: '2.5rem 1rem', minHeight: '80vh' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
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
            fontWeight: 700,
            marginBottom: '0.85rem'
          }}
        >
          <Building2 size={15} /> Hospital Clinical Units
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Hospital Departments & Specialties
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Explore dedicated clinical units, consultant specialties, and contact triage across MediPulse 360.
        </p>
      </div>

      {/* Responsive Horizontal Grid of Colored Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
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
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '14px',
                border: `1px solid ${theme.cardBorder}`,
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--card-shadow-hover)',
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
                  height: '5px',
                  background: theme.gradient
                }}
              />

              <div>
                {/* Icon & Code Badge Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      backgroundColor: theme.bgLight,
                      color: theme.primaryColor,
                      border: `1.5px solid ${theme.borderAccent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${theme.bgLight}`
                    }}
                  >
                    <Icon size={26} color={theme.primaryColor} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      border: `1px solid ${theme.borderAccent}`,
                      letterSpacing: '0.04em'
                    }}
                  >
                    {dept.code}
                  </span>
                </div>

                {/* Department Name */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {dept.name}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {dept.description}
                </p>

                {/* Clinical Location & Contact Info */}
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color={theme.primaryColor} />
                    <span><strong>Location:</strong> {dept.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color={theme.primaryColor} />
                    <span><strong>Phone:</strong> {dept.phone}</span>
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Active Unit
                </span>

                <Link
                  to={`/book?department=${dept._id}`}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '8px',
                    padding: '0.45rem 1rem',
                    boxShadow: `0 2px 8px ${theme.bgLight}`
                  }}
                >
                  Book Department <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
