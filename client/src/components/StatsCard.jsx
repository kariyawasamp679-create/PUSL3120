import React from 'react';
import { ArrowUpRight } from './Icons';


export default function StatsCard({ title, value, icon: Icon, trend, subtitle, color = 'var(--primary-500)' }) {
  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative gradient blur in corner */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: color,
          opacity: 0.15,
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `rgba(255, 255, 255, 0.05)`,
            color: color,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center' }}>
            <ArrowUpRight size={14} /> {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
