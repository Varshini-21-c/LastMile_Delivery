import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PublicTracking } from './pages/PublicTracking';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('public_tracking');
  const [trackedId, setTrackedId] = useState('TRK-2026-');
  const [rescheduleTargetOrder, setRescheduleTargetOrder] = useState(null);

  const handleTrackOrder = (trackingNumber) => {
    setTrackedId(trackingNumber);
    setActiveTab('public_tracking');
  };

  const handleOpenRescheduleFromPublic = (order) => {
    setActiveTab('customer');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === 'public_tracking' && (
          <PublicTracking
            defaultTrackingNumber={trackedId}
            onOpenReschedule={handleOpenRescheduleFromPublic}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerDashboard
            onTrackOrder={handleTrackOrder}
          />
        )}

        {activeTab === 'agent' && (
          <AgentDashboard />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onTrackOrder={handleTrackOrder}
          />
        )}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '24px 16px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          marginTop: 'auto'
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>SwiftMile Logistics Platform</strong> • Spring Boot 3 + React Architecture
          </div>
          <div>
            Automated Rate Engine (Volumetric <code>L×B×H÷5000</code> + Dynamic Rate Cards) & Intelligent Agent Heuristics
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
