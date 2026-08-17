import React from 'react';
import { CheckCircle2, Clock, CalendarCheck, XCircle, RefreshCw } from './Icons';


export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  const configs = {
    confirmed: {
      label: 'Confirmed',
      className: 'badge-confirmed',
      icon: CheckCircle2
    },
    pending: {
      label: 'Pending',
      className: 'badge-pending',
      icon: Clock
    },
    completed: {
      label: 'Completed',
      className: 'badge-completed',
      icon: CalendarCheck
    },
    cancelled: {
      label: 'Cancelled',
      className: 'badge-cancelled',
      icon: XCircle
    },
    rescheduled: {
      label: 'Rescheduled',
      className: 'badge-rescheduled',
      icon: RefreshCw
    }
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    className: 'badge-pending',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <IconComponent size={12} />
      {config.label}
    </span>
  );
}
