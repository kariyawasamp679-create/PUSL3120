import React from 'react';
import { Clock, Check } from './Icons';


export default function SlotPicker({ slots = [], selectedSlot, onSelectSlot, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Clock size={24} className="animate-pulse-slow" style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--primary-400)' }} />
        <span>Loading live doctor availability...</span>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Please select a doctor and date to check available appointment slots.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Select Consultation Time Slot
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Available
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Booked
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '10px'
        }}
      >
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.time;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectSlot(slot.time)}
              style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                background: isSelected
                  ? 'var(--primary-gradient)'
                  : isAvailable
                  ? 'rgba(30, 41, 59, 0.7)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isSelected
                  ? '#ffffff'
                  : isAvailable
                  ? '#f8fafc'
                  : 'var(--text-muted)',
                border: isSelected
                  ? '1px solid var(--primary-400)'
                  : isAvailable
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.03)',
                opacity: isAvailable ? 1 : 0.45,
                boxShadow: isSelected ? '0 0 15px rgba(14, 165, 233, 0.4)' : 'none'
              }}
            >
              <Clock size={14} />
              {slot.time}
              {isSelected && <Check size={14} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
