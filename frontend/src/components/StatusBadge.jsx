import React from 'react';
import { Package, Clock, CheckCircle2, AlertTriangle, Truck, RotateCcw, XCircle, Navigation } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'CREATED':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.3)',
          text: '#60a5fa',
          icon: Clock,
          label: 'Order Created',
          pulse: false
        };
      case 'ASSIGNED':
        return {
          bg: 'rgba(139, 92, 246, 0.15)',
          border: 'rgba(139, 92, 246, 0.3)',
          text: '#a78bfa',
          icon: Package,
          label: 'Agent Assigned',
          pulse: false
        };
      case 'PICKED_UP':
        return {
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.3)',
          text: '#22d3ee',
          icon: Package,
          label: 'Picked Up',
          pulse: true
        };
      case 'IN_TRANSIT':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.3)',
          text: '#fbbf24',
          icon: Truck,
          label: 'In Transit',
          pulse: true
        };
      case 'OUT_FOR_DELIVERY':
        return {
          bg: 'rgba(236, 72, 153, 0.15)',
          border: 'rgba(236, 72, 153, 0.3)',
          text: '#f472b6',
          icon: Navigation,
          label: 'Out for Delivery',
          pulse: true
        };
      case 'DELIVERED':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.3)',
          text: '#34d399',
          icon: CheckCircle2,
          label: 'Delivered',
          pulse: false
        };
      case 'FAILED':
        return {
          bg: 'rgba(239, 68, 68, 0.18)',
          border: 'rgba(239, 68, 68, 0.4)',
          text: '#f87171',
          icon: AlertTriangle,
          label: 'Delivery Failed',
          pulse: true
        };
      case 'RESCHEDULED':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.3)',
          text: '#facc15',
          icon: RotateCcw,
          label: 'Rescheduled',
          pulse: false
        };
      case 'CANCELLED':
        return {
          bg: 'rgba(107, 114, 128, 0.15)',
          border: 'rgba(107, 114, 128, 0.3)',
          text: '#9ca3af',
          icon: XCircle,
          label: 'Cancelled',
          pulse: false
        };
      default:
        return {
          bg: 'rgba(107, 114, 128, 0.15)',
          border: 'rgba(107, 114, 128, 0.3)',
          text: '#9ca3af',
          icon: Clock,
          label: status || 'Unknown',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        fontSize: '0.8rem',
        fontWeight: '600',
        letterSpacing: '0.02em',
        boxShadow: config.pulse ? `0 0 10px ${config.border}` : 'none'
      }}
    >
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span>{config.label}</span>
      {config.pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.text,
            animation: 'pulseGlow 1.5s infinite'
          }}
        />
      )}
    </span>
  );
};
