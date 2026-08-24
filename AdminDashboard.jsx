import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import {
  ShieldCheck, DollarSign, Package, Truck, Users, MapPin,
  Settings, RefreshCw, Search, PlusCircle, Edit3, Trash2,
  CheckCircle2, AlertTriangle, ChevronRight, X, Mail, Bell, Sparkles
} from 'lucide-react';

export const AdminDashboard = ({ onTrackOrder }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [areas, setAreas] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [agents, setAgents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: '',
    zoneId: '',
    agentId: '',
    search: ''
  });

  const [assignModalOrder, setAssignModalOrder] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [overrideModalOrder, setOverrideModalOrder] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('DELIVERED');
  const [overrideRemarks, setOverrideRemarks] = useState('');

  const [rateCardModal, setRateCardModal] = useState(null);

  const [zoneModal, setZoneModal] = useState(null);
  const [areaModal, setAreaModal] = useState(null);

  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, zonesData, areasData, rateCardsData, agentsData, notifsData] = await Promise.all([
        api.getAdminStats(),
        api.getAllOrders(filters),
        api.getZones(),
        api.getAreas(),
        api.getRateCards(),
        api.getAgents(),
        api.getNotifications()
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setZones(zonesData);
      setAreas(areasData);
      setRateCards(rateCardsData);
      setAgents(agentsData);
      setNotifications(notifsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    try {
      const filtered = await api.getAllOrders(newFilters);
      setOrders(filtered);
    } catch (err) {
      console.error('Filtering orders failed:', err);
    }
  };

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!assignModalOrder) return;
    try {
      await api.assignAgent(assignModalOrder.id, {
        agentId: selectedAgentId ? parseInt(selectedAgentId) : null,
        autoAssign: !selectedAgentId,
        remarks: assignRemarks || 'Admin assigned delivery agent'
      });
      setAssignModalOrder(null);
      setSelectedAgentId('');
      setAssignRemarks('');
      loadAllAdminData();
    } catch (err) {
      alert('Assignment failed: ' + err.message);
    }
  };

  const handleTriggerAutoAssign = async (orderId) => {
    try {
      await api.assignAgent(orderId, { autoAssign: true });
      loadAllAdminData();
      alert('Intelligent Auto-Assignment algorithm executed successfully!');
    } catch (err) {
      alert('Auto-assign failed: ' + err.message);
    }
  };

  const handleOverrideStatus = async (e) => {
    e.preventDefault();
    if (!overrideModalOrder) return;
    try {
      await api.overrideOrderStatus(overrideModalOrder.id, {
        status: overrideStatus,
        remarks: overrideRemarks || `Admin overridden status to ${overrideStatus}`
      });
      setOverrideModalOrder(null);
      loadAllAdminData();
    } catch (err) {
      alert('Override failed: ' + err.message);
    }
  };

  const handleSaveRateCard = async (e) => {
    e.preventDefault();
    if (!rateCardModal) return;
    try {
      if (rateCardModal.id) {
        await api.updateRateCard(rateCardModal.id, rateCardModal);
      } else {
        await api.createRateCard(rateCardModal);
      }
      setRateCardModal(null);
      loadAllAdminData();
    } catch (err) {
      alert('Save Rate Card failed: ' + err.message);
    }
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    if (!zoneModal) return;
    try {
      if (zoneModal.id) {
        await api.updateZone(zoneModal.id, zoneModal);
      } else {
        await api.createZone(zoneModal);
      }
      setZoneModal(null);
      loadAllAdminData();
    } catch (err) {
      alert('Save Zone failed: ' + err.message);
    }
  };

  const handleSaveArea = async (e) => {
    e.preventDefault();
    if (!areaModal) return;
    try {
      await api.createArea(areaModal);
      setAreaModal(null);
      loadAllAdminData();
    } catch (err) {
      alert('Save Area failed: ' + err.message);
    }
  };

  const handleDeleteArea = async (id) => {
    if (!window.confirm('Are you sure you want to remove this pincode mapping?')) return;
    try {
      await api.deleteArea(id);
      loadAllAdminData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px 40px' }}>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={26} color="#6366f1" /> Logistics Operations Command Center
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Master dashboard for SLA monitoring, pricing rules, zone topology, and order override controls.
            </p>
          </div>

          <button onClick={loadAllAdminData} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh Live Data
          </button>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #6366f1' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Shipments</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>{stats.totalOrders}</div>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '4px' }}>Active in-progress: {stats.activeOrders}</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Delivered Revenue</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399' }}>₹{stats.totalDeliveredRevenue || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#6ee7b7', marginTop: '4px' }}>{stats.deliveredOrders} delivered orders</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #06b6d4' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Fleet Agents</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#22d3ee' }}>{stats.availableAgents} / {stats.totalAgents}</div>
              <div style={{ fontSize: '0.72rem', color: '#67e8f9', marginTop: '4px' }}>Online & available for dispatch</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Failed Deliveries</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f87171' }}>{stats.failedOrders}</div>
              <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '4px' }}>Rescheduled: {stats.rescheduledOrders}</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Configured Zones</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24' }}>{stats.totalZones}</div>
              <div style={{ fontSize: '0.72rem', color: '#fde68a', marginTop: '4px' }}>Metro Hubs & Corridors</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'orders' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'orders' ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={16} /> Orders Master ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('rate_cards')}
          style={{
            background: activeTab === 'rate_cards' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'rate_cards' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'rate_cards' ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <DollarSign size={16} /> Rate Cards Matrix ({rateCards.length})
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          style={{
            background: activeTab === 'zones' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'zones' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'zones' ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={16} /> Zones & Pincodes ({zones.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            background: activeTab === 'notifications' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'notifications' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'notifications' ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Bell size={16} /> Notification Audit Log ({notifications.length})
        </button>
      </div>

      {activeTab === 'orders' && (
        <div>

          <div
            className="glass-card"
            style={{
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              alignItems: 'center'
            }}
          >

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search TRK ID, customer, address..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <div>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="CREATED">CREATED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="FAILED">FAILED</option>
                <option value="RESCHEDULED">RESCHEDULED</option>
              </select>
            </div>

            <div>
              <select
                className="form-select"
                value={filters.zoneId}
                onChange={(e) => handleFilterChange({ ...filters, zoneId: e.target.value })}
              >
                <option value="">All Zones</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="form-select"
                value={filters.agentId}
                onChange={(e) => handleFilterChange({ ...filters, agentId: e.target.value })}
              >
                <option value="">All Agents</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.zoneName || 'Agent'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto', padding: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 16px' }}>Tracking Number</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Route & Zones</th>
                  <th style={{ padding: '14px 16px' }}>Weight & Type</th>
                  <th style={{ padding: '14px 16px' }}>Charges</th>
                  <th style={{ padding: '14px 16px' }}>Assigned Agent</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease'
                    }}
                  >

                    <td style={{ padding: '14px 16px' }}>
                      <div
                        className="font-mono"
                        style={{ fontWeight: '800', color: '#38bdf8', cursor: 'pointer' }}
                        onClick={() => onTrackOrder && onTrackOrder(o.trackingNumber)}
                      >
                        {o.trackingNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {o.customerName || 'Customer'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={o.status} />
                      {o.failureReason && (
                        <div style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '4px', maxWidth: '140px' }}>
                          ⚠️ {o.failureReason}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#fff', fontWeight: '500' }}>
                        {o.pickupArea || o.pickupPincode} → {o.dropArea || o.dropPincode}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {o.pickupZoneCode} → {o.dropZoneCode} ({o.rateZoneType})
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{o.chargeableWeightKg} kg</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {o.orderType} • {o.paymentType}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ color: '#34d399', fontWeight: '800', fontSize: '0.95rem' }}>₹{o.totalAmount}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Base: ₹{o.baseRate} + Extra: ₹{o.extraWeightCharge}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {o.assignedAgent ? (
                        <div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{o.assignedAgent.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{o.assignedAgent.phone}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>

                        <button
                          onClick={() => handleTriggerAutoAssign(o.id)}
                          title="Trigger Intelligent Auto-Assignment"
                          style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          <Sparkles size={12} /> Auto
                        </button>

                        <button
                          onClick={() => setAssignModalOrder(o)}
                          title="Manually Assign Agent"
                          style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#67e8f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          <Users size={12} /> Assign
                        </button>

                        <button
                          onClick={() => setOverrideModalOrder(o)}
                          title="Override Status"
                          style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          <Settings size={12} /> Override
                        </button>

                        <button
                          onClick={() => setSelectedTimelineOrder(selectedTimelineOrder?.id === o.id ? null : o)}
                          title="View Tracking History"
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Log
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedTimelineOrder && (
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
              <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
                <button
                  onClick={() => setSelectedTimelineOrder(null)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                  Immutable Audit Log: {selectedTimelineOrder.trackingNumber}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Every lifecycle event logged with actor identity, timestamp, and GPS coordinates.
                </p>
                <Timeline history={selectedTimelineOrder.trackingHistory} currentStatus={selectedTimelineOrder.status} />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rate_cards' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Dynamic Rate Cards Matrix</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Zero hardcoding: configure B2B & B2C Intra-Zone and Inter-Zone base rates, extra kg fees, and COD surcharges.
              </p>
            </div>
            <button
              onClick={() => setRateCardModal({
                orderType: 'B2C',
                isIntraZone: true,
                baseWeightKg: 0.5,
                baseRate: 40.0,
                extraRatePerKg: 20.0,
                codSurchargeFixed: 25.0,
                codSurchargePercent: 1.5,
                minCharge: 40.0,
                description: 'Custom Rate Card',
                active: true
              })}
              className="btn-primary"
            >
              <PlusCircle size={16} /> Add New Rate Card
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {rateCards.map((rc) => (
              <div
                key={rc.id}
                className="glass-card"
                style={{
                  padding: '22px',
                  borderTop: `4px solid ${rc.orderType === 'B2B' ? '#06b6d4' : '#6366f1'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: rc.orderType === 'B2B' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: rc.orderType === 'B2B' ? '#67e8f9' : '#a5b4fc', marginRight: '6px' }}>
                      {rc.orderType}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: rc.isIntraZone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: rc.isIntraZone ? '#34d399' : '#fbbf24' }}>
                      {rc.isIntraZone ? 'Intra-Zone (Local)' : 'Inter-Zone (Cross-Hub)'}
                    </span>
                  </div>

                  <button
                    onClick={() => setRateCardModal(rc)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '14px' }}>
                  {rc.description || 'Configured Rate Card'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Base Threshold:</span>
                    <div style={{ fontWeight: '700', color: '#fff' }}>{rc.baseWeightKg} kg</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Base Charge:</span>
                    <div style={{ fontWeight: '700', color: '#34d399' }}>₹{rc.baseRate}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Extra Weight:</span>
                    <div style={{ fontWeight: '700', color: '#38bdf8' }}>₹{rc.extraRatePerKg} / kg</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>COD Surcharge:</span>
                    <div style={{ fontWeight: '700', color: '#fbbf24' }}>₹{rc.codSurchargeFixed} + {rc.codSurchargePercent}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>

          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>Logistics Hub Zones ({zones.length})</h3>
              <button
                onClick={() => setZoneModal({ code: '', name: '', description: '', centerLatitude: 12.9716, centerLongitude: 77.5946, active: true })}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <PlusCircle size={14} /> Add Zone
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {zones.map((z) => (
                <div key={z.id} className="glass-card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8' }}>{z.code}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#fff' }}>- {z.name}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{z.description}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                      {z.areaCount} Pincode areas mapped • {z.agentCount} active agents
                    </div>
                  </div>
                  <button onClick={() => setZoneModal(z)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    <Edit3 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>Pincode to Zone Mappings ({areas.length})</h3>
              <button
                onClick={() => setAreaModal({ pincode: '', areaName: '', city: 'Bengaluru', state: 'Karnataka', zoneId: zones[0]?.id || 1 })}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <PlusCircle size={14} /> Map Pincode
              </button>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {areas.map((a) => (
                <div key={a.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: '800', color: '#34d399', fontSize: '0.85rem' }}>{a.pincode}</span>
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>{a.areaName}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zone: {a.zoneName || 'Assigned'}</div>
                  </div>
                  <button onClick={() => handleDeleteArea(a.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Multi-Channel Customer Notifications Log</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Immutable audit feed of SMS and Email notifications dispatched to customers on order status changes.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n) => (
              <div key={n.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: n.channel === 'EMAIL' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: n.channel === 'EMAIL' ? '#a5b4fc' : '#34d399' }}>
                      {n.channel}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8' }}>{n.trackingNumber}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Event: {n.eventType}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.sentAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>{n.subject}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                  {n.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assignModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setAssignModalOrder(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Assign Delivery Agent</h3>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '16px' }}>{assignModalOrder.trackingNumber}</p>

            <form onSubmit={handleManualAssign}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Select Agent (Leave blank for Intelligent Auto-Assignment)
                </label>
                <select className="form-select" value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
                  <option value="">⚡ Trigger Auto-Assignment Algorithm</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.zoneName || 'Hub'}) - {a.activeOrdersCount || 0} active orders</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Admin Remarks / Dispatch Notes</label>
                <input type="text" className="form-input" placeholder="e.g. Priority dispatch assigned by admin" value={assignRemarks} onChange={(e) => setAssignRemarks(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setAssignModalOrder(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {overrideModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setOverrideModalOrder(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Admin Status Override</h3>
            <p className="font-mono" style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '16px' }}>{overrideModalOrder.trackingNumber}</p>

            <form onSubmit={handleOverrideStatus}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>New Target Status *</label>
                <select className="form-select" value={overrideStatus} onChange={(e) => setOverrideStatus(e.target.value)}>
                  <option value="CREATED">CREATED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Override Justification Notes *</label>
                <textarea className="form-input" rows="3" placeholder="e.g. Customer confirmed delivery via customer support phone verification" value={overrideRemarks} onChange={(e) => setOverrideRemarks(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setOverrideModalOrder(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-danger" style={{ flex: 2 }}>Apply Override</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rateCardModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setRateCardModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
              {rateCardModal.id ? 'Edit Rate Card' : 'Create New Rate Card'}
            </h3>

            <form onSubmit={handleSaveRateCard}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Order Type</label>
                  <select className="form-select" value={rateCardModal.orderType} onChange={(e) => setRateCardModal({ ...rateCardModal, orderType: e.target.value })}>
                    <option value="B2C">B2C</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Route Type</label>
                  <select className="form-select" value={rateCardModal.isIntraZone ? 'true' : 'false'} onChange={(e) => setRateCardModal({ ...rateCardModal, isIntraZone: e.target.value === 'true' })}>
                    <option value="true">Intra-Zone (Local)</option>
                    <option value="false">Inter-Zone (Cross-Hub)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Base Weight Threshold (kg)</label>
                  <input type="number" step="0.1" className="form-input" value={rateCardModal.baseWeightKg} onChange={(e) => setRateCardModal({ ...rateCardModal, baseWeightKg: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Base Fare Rate (₹)</label>
                  <input type="number" step="1" className="form-input" value={rateCardModal.baseRate} onChange={(e) => setRateCardModal({ ...rateCardModal, baseRate: parseFloat(e.target.value) })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Extra Rate Per Kg (₹)</label>
                  <input type="number" step="1" className="form-input" value={rateCardModal.extraRatePerKg} onChange={(e) => setRateCardModal({ ...rateCardModal, extraRatePerKg: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Min Charge Floor (₹)</label>
                  <input type="number" step="1" className="form-input" value={rateCardModal.minCharge} onChange={(e) => setRateCardModal({ ...rateCardModal, minCharge: parseFloat(e.target.value) })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>COD Fixed Surcharge (₹)</label>
                  <input type="number" step="1" className="form-input" value={rateCardModal.codSurchargeFixed} onChange={(e) => setRateCardModal({ ...rateCardModal, codSurchargeFixed: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>COD Percentage Fee (%)</label>
                  <input type="number" step="0.1" className="form-input" value={rateCardModal.codSurchargePercent} onChange={(e) => setRateCardModal({ ...rateCardModal, codSurchargePercent: parseFloat(e.target.value) })} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setRateCardModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Rate Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoneModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setZoneModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>{zoneModal.id ? 'Edit Zone' : 'Add New Zone'}</h3>

            <form onSubmit={handleSaveZone}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zone Code (e.g. NORTH_ZONE) *</label>
                <input type="text" className="form-input" value={zoneModal.code} onChange={(e) => setZoneModal({ ...zoneModal, code: e.target.value.toUpperCase() })} required disabled={!!zoneModal.id} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zone Display Name *</label>
                <input type="text" className="form-input" value={zoneModal.name} onChange={(e) => setZoneModal({ ...zoneModal, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Description & Coverage</label>
                <input type="text" className="form-input" value={zoneModal.description} onChange={(e) => setZoneModal({ ...zoneModal, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setZoneModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Zone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {areaModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '28px', position: 'relative' }}>
            <button onClick={() => setAreaModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Map New Pincode</h3>

            <form onSubmit={handleSaveArea}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>6-Digit Pincode *</label>
                <input type="text" className="form-input" placeholder="e.g. 560095" value={areaModal.pincode} onChange={(e) => setAreaModal({ ...areaModal, pincode: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Area Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Ejipura / Sony Signal" value={areaModal.areaName} onChange={(e) => setAreaModal({ ...areaModal, areaName: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assign to Zone *</label>
                <select className="form-select" value={areaModal.zoneId} onChange={(e) => setAreaModal({ ...areaModal, zoneId: parseInt(e.target.value) })}>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setAreaModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Map Pincode</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
