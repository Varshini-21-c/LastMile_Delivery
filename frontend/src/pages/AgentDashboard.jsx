import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import {
  Truck, MapPin, Phone, CheckCircle2, AlertTriangle,
  Navigation, Package, Radio, ArrowRight, UserCheck, X
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);

  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState(null);

  const [failedModalOrder, setFailedModalOrder] = useState(null);
  const [failureReason, setFailureReason] = useState('Customer Unavailable / Door Locked');
  const [failureNotes, setFailureNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const bangaloreLocations = [
    { name: 'Koramangala (South)', lat: 12.9352, lng: 77.6245 },
    { name: 'HSR Layout (South)', lat: 12.9121, lng: 77.6446 },
    { name: 'Indiranagar (Central)', lat: 12.9784, lng: 77.6408 },
    { name: 'Whitefield (East)', lat: 12.9698, lng: 77.7500 },
    { name: 'Hebbal (North)', lat: 13.0358, lng: 77.5970 },
    { name: 'Peenya (West)', lat: 12.9982, lng: 77.5530 }
  ];

  useEffect(() => {
    loadAgentOrders();
  }, []);

  const loadAgentOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAgentOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load agent orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    try {
      await api.toggleAgentAvailability(nextState);
      refreshUser();
    } catch (err) {
      setIsAvailable(!nextState);
      alert('Error updating status: ' + err.message);
    }
  };

  const handleSimulateGPS = async (loc) => {
    try {
      await api.updateAgentLocation(loc.lat, loc.lng);
      refreshUser();
      alert(`GPS location updated to ${loc.name} (${loc.lat}, ${loc.lng})`);
    } catch (err) {
      alert('Error updating GPS: ' + err.message);
    }
  };

  const handleAdvanceStatus = async (orderId, newStatus, remarks = '') => {
    setActionLoading(true);
    try {
      await api.updateOrderStatus(orderId, {
        status: newStatus,
        remarks: remarks || `Agent updated status to ${newStatus}`,
        currentLatitude: user?.currentLatitude || 12.9352,
        currentLongitude: user?.currentLongitude || 77.6245
      });
      loadAgentOrders();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportFailure = async (e) => {
    e.preventDefault();
    if (!failedModalOrder) return;

    setActionLoading(true);
    try {
      await api.updateOrderStatus(failedModalOrder.id, {
        status: 'FAILED',
        failureReason: failureReason,
        failureNotes: failureNotes,
        remarks: `Delivery attempt failed: ${failureReason}`,
        currentLatitude: user?.currentLatitude || 12.9352,
        currentLongitude: user?.currentLongitude || 77.6245
      });
      setFailedModalOrder(null);
      setFailureNotes('');
      loadAgentOrders();
    } catch (err) {
      alert('Failed to report failure: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px 40px' }}>

      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{user?.name || 'Delivery Hero'}</h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: isAvailable ? '#34d399' : '#f87171',
                  fontWeight: '700',
                  border: `1px solid ${isAvailable ? '#10b981' : '#ef4444'}`
                }}
              >
                {isAvailable ? '● ONLINE & ACTIVE' : '○ OFFLINE'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Assigned Zone: <strong>{user?.zoneName || 'South Metro Hub'}</strong> • Active Queue: <strong>{orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

          <button
            onClick={handleToggleAvailability}
            className={isAvailable ? 'btn-danger' : 'btn-success'}
            style={{ fontSize: '0.85rem' }}
          >
            <Radio size={16} /> {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <MapPin size={16} color="#06b6d4" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Simulate GPS:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
              onChange={(e) => {
                const loc = bangaloreLocations.find(l => l.name === e.target.value);
                if (loc) handleSimulateGPS(loc);
              }}
              defaultValue="Koramangala (South)"
            >
              {bangaloreLocations.map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} color="#6366f1" /> Assigned Deliveries ({orders.length})
        </h3>
        <button onClick={loadAgentOrders} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading task queue...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Truck size={48} color="#06b6d4" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>No Active Deliveries Assigned</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your queue is clear. When new orders are booked in your zone, auto-dispatch will route them here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {orders.map((o) => {
            const isCompleted = o.status === 'DELIVERED' || o.status === 'CANCELLED';
            return (
              <div
                key={o.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: `5px solid ${o.status === 'DELIVERED' ? '#10b981' : o.status === 'FAILED' ? '#ef4444' : '#06b6d4'}`,
                  opacity: isCompleted ? 0.8 : 1
                }}
              >

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                        {o.trackingNumber}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Order Type: <strong>{o.orderType}</strong> • Payment: <strong>{o.paymentType}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: o.paymentType === 'COD' ? '#fbbf24' : '#34d399' }}>
                      {o.paymentType === 'COD' ? `Collect ₹${o.totalAmount} (COD)` : `Prepaid (₹0 Due)`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Weight: {o.chargeableWeightKg} kg • {o.lengthCm}×{o.breadthCm}×{o.heightCm} cm
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #06b6d4' }}>
                    <div style={{ fontSize: '0.72rem', color: '#67e8f9', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Pickup ({o.pickupZoneName || 'Zone'})
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{o.senderName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{o.pickupAddress} (PIN: {o.pickupPincode})</div>
                    <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {o.senderPhone}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '0.72rem', color: '#6ee7b7', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Delivery Customer ({o.dropZoneName || 'Zone'})
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{o.receiverName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{o.dropAddress} (PIN: {o.dropPincode})</div>
                    <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {o.receiverPhone}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setSelectedTimelineOrder(selectedTimelineOrder?.id === o.id ? null : o)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    {selectedTimelineOrder?.id === o.id ? 'Hide Timeline' : 'View Journey Log'}
                  </button>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {o.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleAdvanceStatus(o.id, 'PICKED_UP', 'Package picked up from sender by agent')}
                        disabled={actionLoading}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', fontSize: '0.85rem' }}
                      >
                        <Package size={16} /> Mark as Picked Up
                      </button>
                    )}

                    {o.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleAdvanceStatus(o.id, 'IN_TRANSIT', 'Package dispatched to transit hub')}
                        disabled={actionLoading}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', fontSize: '0.85rem' }}
                      >
                        <Truck size={16} /> Mark In Transit
                      </button>
                    )}

                    {o.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleAdvanceStatus(o.id, 'OUT_FOR_DELIVERY', 'Agent out for delivery to destination')}
                        disabled={actionLoading}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', fontSize: '0.85rem' }}
                      >
                        <Navigation size={16} /> Mark Out for Delivery
                      </button>
                    )}

                    {o.status === 'OUT_FOR_DELIVERY' && (
                      <>
                        <button
                          onClick={() => handleAdvanceStatus(o.id, 'DELIVERED', 'Package successfully delivered and handed to customer')}
                          disabled={actionLoading}
                          className="btn-success"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <CheckCircle2 size={16} /> Complete Delivery
                        </button>
                        <button
                          onClick={() => setFailedModalOrder(o)}
                          disabled={actionLoading}
                          className="btn-danger"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <AlertTriangle size={16} /> Report Delivery Failed
                        </button>
                      </>
                    )}

                    {o.status === 'DELIVERED' && (
                      <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Successfully Delivered
                      </span>
                    )}

                    {o.status === 'FAILED' && (
                      <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={16} /> Awaiting Customer Reschedule ({o.failureReason})
                      </span>
                    )}
                  </div>
                </div>

                {selectedTimelineOrder?.id === o.id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <Timeline history={o.trackingHistory} currentStatus={o.status} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {failedModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button
              onClick={() => setFailedModalOrder(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '10px' }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Report Delivery Attempt Failure</h3>
                <p className="font-mono" style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{failedModalOrder.trackingNumber}</p>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Logging a failed attempt will instantly notify the customer via SMS & Email with a 1-click reschedule link.
            </p>

            <form onSubmit={handleReportFailure}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Failure Reason *
                </label>
                <select
                  className="form-select"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                >
                  <option value="Customer Unavailable / Door Locked">Customer Unavailable / Door Locked</option>
                  <option value="Incorrect Address / Incomplete PIN">Incorrect Address / Incomplete PIN</option>
                  <option value="Customer Refused Delivery / COD Payment Issue">Customer Refused Delivery / COD Payment Issue</option>
                  <option value="Customer Requested Delivery Later">Customer Requested Delivery Later</option>
                  <option value="Access Restricted / Security Denial">Access Restricted / Security Denial</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Additional Notes / Agent Remarks
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="e.g. Called customer 3 times, phone switched off at destination gate."
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setFailedModalOrder(null)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn-danger" style={{ flex: 2 }}>
                  {actionLoading ? 'Reporting...' : 'Confirm Delivery Failure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
