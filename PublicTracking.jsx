import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { WeightCalculator } from '../components/WeightCalculator';
import { Search, Package, MapPin, Calendar, Clock, User, Phone, AlertTriangle, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';

export const PublicTracking = ({ defaultTrackingNumber = '', onOpenReschedule = null }) => {
  const [trackingNumber, setTrackingNumber] = useState(defaultTrackingNumber || 'TRK-2026-');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (defaultTrackingNumber) {
      setTrackingNumber(defaultTrackingNumber);
      handleTrack(defaultTrackingNumber);
    }
  }, [defaultTrackingNumber]);

  const handleTrack = async (trackNo) => {
    const num = (trackNo || trackingNumber).trim();
    if (!num) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.trackOrder(num);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Tracking number not found.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex, status) => {
    const orderSteps = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (status === 'FAILED') return 'failed';
    const currentIndex = orderSteps.indexOf(status);
    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex === stepIndex - 1) return 'active';
    return 'pending';
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 16px 40px' }}>

      <div
        className="glass-panel"
        style={{
          padding: '36px 28px',
          textAlign: 'center',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '16px', marginBottom: '14px' }}>
          <Package size={32} color="#818cf8" />
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
          Real-Time Shipment Tracking
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px' }}>
          Enter your shipment tracking ID to get live status, agent updates, and immutable journey milestones.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
          style={{
            maxWidth: '620px',
            margin: '0 auto',
            display: 'flex',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', color: 'var(--text-muted)' }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            className="font-mono"
            placeholder="e.g. TRK-2026-AB12CD"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: '600',
              padding: '10px 4px',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Package'}
          </button>
        </form>

        <div style={{ marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Try looking up sample tracking IDs from seed data (or click above tabs to create an order)
        </div>
      </div>

      {error && (
        <div
          className="glass-card"
          style={{
            padding: '18px 24px',
            marginBottom: '24px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fca5a5'
          }}
        >
          <AlertTriangle size={22} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              borderLeft: `5px solid ${order.status === 'DELIVERED' ? '#10b981' : order.status === 'FAILED' ? '#ef4444' : '#6366f1'}`
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
                  {order.trackingNumber}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Booked on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • {order.orderType} • {order.paymentType}
              </div>
            </div>

            {order.status === 'FAILED' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.4)', textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fca5a5', marginBottom: '4px' }}>
                  Delivery Unsuccessful: {order.failureReason || 'Customer Unavailable'}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Choose a new delivery slot to re-dispatch an agent.
                </p>
                {onOpenReschedule && (
                  <button
                    onClick={() => onOpenReschedule(order)}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    <RotateCcw size={14} /> Reschedule Delivery Now
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', minWidth: '600px' }}>

              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '30px',
                  right: '30px',
                  height: '3px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 0
                }}
              />

              {[
                { key: 'CREATED', label: 'Order Placed' },
                { key: 'ASSIGNED', label: 'Agent Assigned' },
                { key: 'PICKED_UP', label: 'Picked Up' },
                { key: 'IN_TRANSIT', label: 'In Transit' },
                { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                { key: 'DELIVERED', label: 'Delivered' }
              ].map((step, idx) => {
                const stepState = getStepStatus(idx, order.status);
                const isPassed = stepState === 'completed';
                const isCurrent = step.key === order.status;

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1,
                      textAlign: 'center',
                      width: '100px'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isCurrent ? '#6366f1' : isPassed ? '#10b981' : '#1f2937',
                        border: isCurrent ? '3px solid #818cf8' : '2px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        marginBottom: '8px',
                        boxShadow: isCurrent ? '0 0 16px rgba(99, 102, 241, 0.6)' : 'none'
                      }}
                    >
                      {isPassed ? <CheckCircle size={18} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: isCurrent ? '700' : '500', color: isCurrent ? '#fff' : isPassed ? '#a7f3d0' : 'var(--text-muted)' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="#06b6d4" /> Route Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #06b6d4' }}>
                    <div style={{ fontSize: '0.75rem', color: '#67e8f9', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Pickup Address ({order.pickupZoneName || 'Zone'})
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>{order.senderName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{order.pickupAddress}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PIN: {order.pickupPincode}</div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Delivery Destination ({order.dropZoneName || 'Zone'})
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>{order.receiverName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{order.dropAddress}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PIN: {order.dropPincode}</div>
                  </div>
                </div>
              </div>

              {order.assignedAgent && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="#818cf8" /> Assigned Delivery Hero
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>
                      {order.assignedAgent.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{order.assignedAgent.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} /> {order.assignedAgent.phone || 'Contact via support'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#67e8f9', marginTop: '2px' }}>
                        Base Zone: {order.assignedAgent.zoneName || 'Metro Bengaluru'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <WeightCalculator
                lengthCm={order.lengthCm}
                breadthCm={order.breadthCm}
                heightCm={order.heightCm}
                actualWeightKg={order.actualWeightKg}
              />
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#818cf8" /> Live Journey Timeline
              </h3>
              <Timeline history={order.trackingHistory} currentStatus={order.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
