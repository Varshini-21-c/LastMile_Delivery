import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Clock, MapPin, User, ShieldAlert, ArrowRight } from 'lucide-react';

export const Timeline = ({ history = [], currentStatus }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Clock size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
        <p>No tracking events recorded yet.</p>
      </div>
    );
  }

  const sorted = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '16px' }}>

      <div
        style={{
          position: 'absolute',
          top: '16px',
          bottom: '24px',
          left: '27px',
          width: '2px',
          background: 'linear-gradient(to bottom, #6366f1, #3b82f6, rgba(255, 255, 255, 0.1))'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sorted.map((item, idx) => {
          const isLatest = idx === 0;
          return (
            <div
              key={item.id || idx}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                paddingLeft: '32px'
              }}
            >

              <div
                style={{
                  position: 'absolute',
                  left: '3px',
                  top: '4px',
                  width: isLatest ? '18px' : '14px',
                  height: isLatest ? '18px' : '14px',
                  borderRadius: '50%',
                  backgroundColor: isLatest ? '#6366f1' : '#374151',
                  border: isLatest ? '3px solid #1e1b4b' : '2px solid #111827',
                  boxShadow: isLatest ? '0 0 12px #6366f1' : 'none',
                  zIndex: 2,
                  transition: 'all 0.3s ease'
                }}
              />

              <div
                className="glass-card"
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  backgroundColor: isLatest ? 'rgba(31, 41, 55, 0.85)' : 'rgba(31, 41, 55, 0.4)',
                  borderColor: isLatest ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <StatusBadge status={item.status} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '500' }}>
                  {item.remarks}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  {item.actorName && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} />
                      {item.actorName} ({item.actorRole})
                    </span>
                  )}
                  {item.locationLatitude && item.locationLongitude && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                      <MapPin size={12} />
                      {item.locationLatitude.toFixed(4)}, {item.locationLongitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
