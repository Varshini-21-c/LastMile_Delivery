import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { WeightCalculator } from '../components/WeightCalculator';
import confetti from 'canvas-confetti';
import {
  Package, PlusCircle, Search, Calendar, Clock, MapPin,
  DollarSign, CheckCircle2, RotateCcw, AlertCircle, Sparkles, ChevronRight, X
} from 'lucide-react';

export const CustomerDashboard = ({ onTrackOrder }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('orders');

  const [formData, setFormData] = useState({
    senderName: user?.name || 'Rohit Mehta',
    senderPhone: user?.phone || '+91 99887 76655',
    pickupAddress: 'Flat 402, Sunshine Apts, 5th Block Koramangala',
    pickupPincode: '560034',
    pickupArea: 'Koramangala',
    pickupCity: 'Bengaluru',
    pickupLatitude: 12.9352,
    pickupLongitude: 77.6245,

    receiverName: 'Siddharth Rao',
    receiverPhone: '+91 97777 88899',
    dropAddress: 'Plot 12, Sector 2, HSR Layout',
    dropPincode: '560102',
    dropArea: 'HSR Layout',
    dropCity: 'Bengaluru',
    dropLatitude: 12.9121,
    dropLongitude: 77.6446,

    lengthCm: 25.0,
    breadthCm: 20.0,
    heightCm: 10.0,
    actualWeightKg: 1.5,
    orderType: 'B2C',
    paymentType: 'PREPAID',
    declaredValue: 1200.0,
    autoAssign: true
  });

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [rescheduleModalOrder, setRescheduleModalOrder] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    rescheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    rescheduledSlot: 'Morning (9:00 AM - 1:00 PM)',
    rescheduleReason: 'Customer requested convenient weekend slot'
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [
    formData.pickupPincode, formData.dropPincode,
    formData.lengthCm, formData.breadthCm, formData.heightCm,
    formData.actualWeightKg, formData.orderType, formData.paymentType, formData.declaredValue
  ]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    if (!formData.pickupPincode || !formData.dropPincode || !formData.actualWeightKg) return;
    setQuoteLoading(true);
    try {
      const q = await api.calculateQuote({
        pickupPincode: formData.pickupPincode,
        pickupArea: formData.pickupArea,
        pickupCity: formData.pickupCity,
        dropPincode: formData.dropPincode,
        dropArea: formData.dropArea,
        dropCity: formData.dropCity,
        lengthCm: parseFloat(formData.lengthCm) || 1,
        breadthCm: parseFloat(formData.breadthCm) || 1,
        heightCm: parseFloat(formData.heightCm) || 1,
        actualWeightKg: parseFloat(formData.actualWeightKg) || 0.1,
        orderType: formData.orderType,
        paymentType: formData.paymentType,
        declaredValue: parseFloat(formData.declaredValue) || 0
      });
      setQuote(q);
    } catch (err) {
      console.warn('Quote calculation error:', err);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const newOrder = await api.createOrder({
        ...formData,
        lengthCm: parseFloat(formData.lengthCm),
        breadthCm: parseFloat(formData.breadthCm),
        heightCm: parseFloat(formData.heightCm),
        actualWeightKg: parseFloat(formData.actualWeightKg),
        declaredValue: parseFloat(formData.declaredValue) || 0
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setBookingSuccess(newOrder);
      loadOrders();
    } catch (err) {
      alert('Error creating order: ' + err.message);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModalOrder) return;
    setRescheduleLoading(true);
    try {
      await api.rescheduleOrder(rescheduleModalOrder.id, rescheduleData);
      setRescheduleModalOrder(null);
      loadOrders();
      alert('Order rescheduled successfully! A delivery agent has been reassigned.');
    } catch (err) {
      alert('Reschedule failed: ' + err.message);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const autofillPreset = (presetType) => {
    if (presetType === 'intra_b2c') {
      setFormData({
        ...formData,
        pickupPincode: '560034',
        pickupArea: 'Koramangala',
        dropPincode: '560102',
        dropArea: 'HSR Layout',
        lengthCm: 25,
        breadthCm: 20,
        heightCm: 10,
        actualWeightKg: 1.2,
        orderType: 'B2C',
        paymentType: 'PREPAID'
      });
    } else if (presetType === 'cross_b2b') {
      setFormData({
        ...formData,
        pickupPincode: '560066',
        pickupArea: 'Whitefield',
        dropPincode: '560058',
        dropArea: 'Peenya Industrial Area',
        lengthCm: 60,
        breadthCm: 50,
        heightCm: 40,
        actualWeightKg: 18.0,
        orderType: 'B2B',
        paymentType: 'COD',
        declaredValue: 7500
      });
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px 40px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>Customer Logistics Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Create orders with auto-calculated rates, track packages in real-time, and manage delivery schedules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setActiveView('orders'); setBookingSuccess(null); }}
            className={activeView === 'orders' ? 'btn-primary' : 'btn-secondary'}
          >
            <Package size={16} /> My Shipments ({orders.length})
          </button>
          <button
            onClick={() => { setActiveView('new_order'); setBookingSuccess(null); }}
            className={activeView === 'new_order' ? 'btn-primary' : 'btn-secondary'}
            style={activeView === 'new_order' ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : {}}
          >
            <PlusCircle size={16} /> Book New Shipment
          </button>
        </div>
      </div>

      {activeView === 'new_order' && (
        <div>
          {bookingSuccess ? (
            <div
              className="glass-panel"
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={36} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                Shipment Booked Successfully!
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Your order is confirmed and intelligent auto-assignment has dispatched a delivery hero.
              </p>
              <div
                className="font-mono"
                style={{
                  display: 'inline-block',
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  color: '#38bdf8',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 24px',
                  borderRadius: '12px',
                  border: '1px dashed #38bdf8',
                  marginBottom: '24px'
                }}
              >
                {bookingSuccess.trackingNumber}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (onTrackOrder) onTrackOrder(bookingSuccess.trackingNumber);
                  }}
                  className="btn-primary"
                >
                  <Search size={16} /> Track Shipment Live
                </button>
                <button
                  onClick={() => { setBookingSuccess(null); setActiveView('orders'); }}
                  className="btn-secondary"
                >
                  View All Orders
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>

              <form onSubmit={handleCreateOrder} className="glass-panel" style={{ padding: '24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => autofillPreset('intra_b2c')}
                    style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    B2C Intra-Zone (Koramangala → HSR)
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillPreset('cross_b2b')}
                    style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#67e8f9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    B2B Cross-Zone (Whitefield → Peenya)
                  </button>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#818cf8" /> 1. Pickup & Delivery Addresses
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pickup Pincode *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pickupPincode}
                      onChange={(e) => setFormData({ ...formData, pickupPincode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pickup Area</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pickupArea}
                      onChange={(e) => setFormData({ ...formData, pickupArea: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pickup Full Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drop Pincode *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dropPincode}
                      onChange={(e) => setFormData({ ...formData, dropPincode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drop Area</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dropArea}
                      onChange={(e) => setFormData({ ...formData, dropArea: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Delivery Destination Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dropAddress}
                      onChange={(e) => setFormData({ ...formData, dropAddress: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} color="#06b6d4" /> 2. Package Dimensions (cm) & Weight (kg)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Length (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={formData.lengthCm}
                      onChange={(e) => setFormData({ ...formData, lengthCm: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Breadth (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={formData.breadthCm}
                      onChange={(e) => setFormData({ ...formData, breadthCm: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Height (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Actual Scale Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.actualWeightKg}
                    onChange={(e) => setFormData({ ...formData, actualWeightKg: e.target.value })}
                    required
                  />
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} color="#10b981" /> 3. Service Type & Payment
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Order Type</label>
                    <select
                      className="form-select"
                      value={formData.orderType}
                      onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    >
                      <option value="B2C">B2C (Retail Delivery)</option>
                      <option value="B2B">B2B (Bulk / Commercial)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payment Mode</label>
                    <select
                      className="form-select"
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    >
                      <option value="PREPAID">Prepaid (Zero COD surcharge)</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                >
                  <CheckCircle2 size={18} /> Confirm & Place Order (₹{quote ? quote.totalAmount : '...'})
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <WeightCalculator
                  lengthCm={formData.lengthCm}
                  breadthCm={formData.breadthCm}
                  heightCm={formData.heightCm}
                  actualWeightKg={formData.actualWeightKg}
                  quote={quote}
                />

                {quote && (
                  <div
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(17, 24, 39, 0.85) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#f59e0b" /> Auto-Calculated Charge Breakdown
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Detected Route Zone:</span>
                        <span style={{ fontWeight: '600', color: quote.isIntraZone ? '#34d399' : '#38bdf8' }}>
                          {quote.pickupZoneName} → {quote.dropZoneName} ({quote.rateZoneType})
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Base Fare (Up to {quote.baseWeightKg} kg):</span>
                        <span style={{ fontWeight: '600', color: '#fff' }}>₹{quote.baseRate}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Extra Weight Surcharge:</span>
                        <span style={{ fontWeight: '600', color: '#fff' }}>₹{quote.extraWeightCharge}</span>
                      </div>

                      {quote.paymentType === 'COD' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>COD Handling Fee:</span>
                          <span style={{ fontWeight: '600', color: '#fbbf24' }}>+₹{quote.codSurcharge}</span>
                        </div>
                      )}

                      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '6px 0' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Total Estimated Cost:</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399' }}>₹{quote.totalAmount}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                      📋 Rate Card Applied: {quote.rateCardDescription || 'Standard Dynamic Rate Card'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'orders' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Loading shipments...
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <Package size={48} color="#6366f1" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>No Orders Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                You haven't placed any delivery orders yet.
              </p>
              <button onClick={() => setActiveView('new_order')} className="btn-primary">
                <PlusCircle size={16} /> Book Your First Delivery
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    borderLeft: `4px solid ${o.status === 'DELIVERED' ? '#10b981' : o.status === 'FAILED' ? '#ef4444' : '#6366f1'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                          {o.trackingNumber}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {o.orderType} • {o.paymentType}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399' }}>₹{o.totalAmount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {o.chargeableWeightKg} kg ({o.lengthCm}×{o.breadthCm}×{o.heightCm} cm)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#67e8f9', fontWeight: '600' }}>PICKUP ({o.pickupZoneName || 'Zone'})</div>
                      <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500' }}>{o.pickupAddress}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: '600' }}>DESTINATION ({o.dropZoneName || 'Zone'})</div>
                      <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500' }}>{o.dropAddress}</div>
                    </div>
                  </div>

                  {o.status === 'FAILED' && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        marginBottom: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171' }}>
                          Delivery Failed: {o.failureReason || 'Customer Unavailable'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Click reschedule to choose a new delivery date & time slot.
                        </div>
                      </div>
                      <button
                        onClick={() => setRescheduleModalOrder(o)}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', fontSize: '0.8rem', padding: '6px 14px' }}
                      >
                        <RotateCcw size={14} /> Reschedule Delivery
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {o.assignedAgent ? (
                        <span>Hero: <strong>{o.assignedAgent.name}</strong></span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Pending agent dispatch</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        {selectedOrder?.id === o.id ? 'Hide Timeline' : 'View Timeline'}
                      </button>
                      <button
                        onClick={() => onTrackOrder && onTrackOrder(o.trackingNumber)}
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        Live Tracking <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {selectedOrder?.id === o.id && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                      <Timeline history={o.trackingHistory} currentStatus={o.status} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {rescheduleModalOrder && (
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
              onClick={() => setRescheduleModalOrder(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '10px' }}>
                <RotateCcw size={22} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Reschedule Delivery</h3>
                <p className="font-mono" style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{rescheduleModalOrder.trackingNumber}</p>
              </div>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Select New Delivery Date *
                </label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleData.rescheduledDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, rescheduledDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Preferred Time Slot *
                </label>
                <select
                  className="form-select"
                  value={rescheduleData.rescheduledSlot}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, rescheduledSlot: e.target.value })}
                >
                  <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                  <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                  <option value="Evening (5:00 PM - 9:00 PM)">Evening (5:00 PM - 9:00 PM)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Reason / Delivery Instructions
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Leave with security or call before arriving"
                  value={rescheduleData.rescheduleReason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, rescheduleReason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setRescheduleModalOrder(null)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={rescheduleLoading} className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  {rescheduleLoading ? 'Reassigning...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
