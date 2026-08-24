import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, UserCheck, Search, LogOut, Package, Sparkles } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, switchDemoRole } = useAuth();

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        margin: '12px 16px 24px',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-lg)'
      }}
    >

      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => setActiveTab('public_tracking')}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Truck size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SwiftMile
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Intelligent Last-Mile Logistics Tracker
          </p>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('public_tracking')}
          style={{
            background: activeTab === 'public_tracking' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'public_tracking' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Search size={15} />
          <span>Live Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('customer')}
          style={{
            background: activeTab === 'customer' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'customer' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Package size={15} />
          <span>Customer Portal</span>
        </button>

        <button
          onClick={() => setActiveTab('agent')}
          style={{
            background: activeTab === 'agent' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'agent' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <UserCheck size={15} />
          <span>Agent Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          style={{
            background: activeTab === 'admin' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'admin' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldCheck size={15} />
          <span>Admin Console</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#f59e0b" /> Demo Switch:
          </span>
          <button
            onClick={() => { switchDemoRole('ROLE_CUSTOMER'); setActiveTab('customer'); }}
            style={{
              background: user?.role === 'ROLE_CUSTOMER' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              color: user?.role === 'ROLE_CUSTOMER' ? '#a5b4fc' : 'var(--text-secondary)',
              border: user?.role === 'ROLE_CUSTOMER' ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Customer
          </button>
          <button
            onClick={() => { switchDemoRole('ROLE_AGENT'); setActiveTab('agent'); }}
            style={{
              background: user?.role === 'ROLE_AGENT' ? 'rgba(6, 182, 212, 0.3)' : 'transparent',
              color: user?.role === 'ROLE_AGENT' ? '#67e8f9' : 'var(--text-secondary)',
              border: user?.role === 'ROLE_AGENT' ? '1px solid rgba(6, 182, 212, 0.5)' : 'none',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Agent
          </button>
          <button
            onClick={() => { switchDemoRole('ROLE_ADMIN'); setActiveTab('admin'); }}
            style={{
              background: user?.role === 'ROLE_ADMIN' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
              color: user?.role === 'ROLE_ADMIN' ? '#6ee7b7' : 'var(--text-secondary)',
              border: user?.role === 'ROLE_ADMIN' ? '1px solid rgba(16, 185, 129, 0.5)' : 'none',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Admin
          </button>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                {user.role === 'ROLE_ADMIN' ? 'Admin' : user.role === 'ROLE_AGENT' ? `Agent (${user.zoneCode || 'Bangalore'})` : 'Customer'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
