import React from 'react';
import { Clock, Check } from './Icons';

export default function SlotPicker({ slots = [], selectedSlot, onSelectSlot, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Clock size={24} style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--primary-500)' }} />
        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>Checking doctor availability...</span>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
        Please select a doctor and date to view available time slots.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Available Time Slots
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} /> Available
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} /> Booked
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
          gap: '8px'
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
                padding: '0.6rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)',
                background: isSelected
                  ? 'var(--primary-500)'
                  : isAvailable
                  ? 'var(--bg-surface)'
                  : 'var(--bg-primary)',
                color: isSelected
                  ? '#ffffff'
                  : isAvailable
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
                border: isSelected
                  ? '1px solid var(--primary-600)'
                  : isAvailable
                  ? '1px solid var(--border-color)'
                  : '1px solid var(--border-color)',
                opacity: isAvailable ? 1 : 0.45
              }}
            >
              <Clock size={13} color={isSelected ? '#ffffff' : isAvailable ? 'var(--primary-500)' : 'var(--text-muted)'} />
              {slot.time}
              {isSelected && <Check size={13} color="#ffffff" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
