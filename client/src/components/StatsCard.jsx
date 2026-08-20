import React from 'react';
import { ArrowUpRight } from './Icons';

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'var(--primary-500)',
  bgLight = 'var(--primary-50)',
  borderAccent = 'var(--primary-200)',
  gradient,
  cardBorder = 'var(--border-color)'
}) {
  const topGradient = gradient || `linear-gradient(90deg, ${color}, ${color})`;

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.5rem',
        borderRadius: '14px',
        border: `1px solid ${cardBorder}`,
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
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
          background: topGradient
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: bgLight,
            color: color,
            border: `1.5px solid ${borderAccent}`,
            boxShadow: `0 4px 12px ${bgLight}`
          }}
        >
          {Icon && <Icon size={22} color={color} />}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {value}
          </span>
          {trend && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={13} /> {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
