import React from 'react';
import { Box, Scale, ArrowRight, Zap, Info } from 'lucide-react';

export const WeightCalculator = ({ lengthCm = 0, breadthCm = 0, heightCm = 0, actualWeightKg = 0, quote = null }) => {
  const l = parseFloat(lengthCm) || 0;
  const b = parseFloat(breadthCm) || 0;
  const h = parseFloat(heightCm) || 0;
  const actual = parseFloat(actualWeightKg) || 0;

  const volumetric = l > 0 && b > 0 && h > 0 ? parseFloat(((l * b * h) / 5000).toFixed(2)) : 0;
  const chargeable = Math.max(actual, volumetric);
  const isVolumetricHigher = volumetric > actual;

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px', borderRadius: '8px' }}>
            <Box size={18} color="#818cf8" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Volumetric & Weight Engine
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Industry Standard Formula: <code style={{ color: '#38bdf8' }}>(L × B × H) ÷ 5000</code>
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: isVolumetricHigher ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isVolumetricHigher ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: isVolumetricHigher ? '#fbbf24' : '#34d399',
            fontWeight: '600'
          }}
        >
          {isVolumetricHigher ? '⚡ Billed on Volumetric' : '⚖️ Billed on Actual Weight'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>

        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '12px',
            borderRadius: '10px',
            border: !isVolumetricHigher ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Actual Scale Weight</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: !isVolumetricHigher ? '#34d399' : 'var(--text-primary)' }}>
            {actual.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>kg</span>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '12px',
            borderRadius: '10px',
            border: isVolumetricHigher ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Volumetric (L×B×H/5000)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: isVolumetricHigher ? '#fbbf24' : 'var(--text-primary)' }}>
            {volumetric.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>kg</span>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.15))',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(99, 102, 241, 0.5)'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginBottom: '4px' }}>Chargeable Weight</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            {chargeable.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>kg</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <Info size={14} color="#818cf8" style={{ flexShrink: 0 }} />
        <span>
          {isVolumetricHigher
            ? `Package density is low (${l}×${b}×${h} cm = ${volumetric} kg). Courier bills on volumetric displacement.`
            : `Actual scale weight (${actual} kg) exceeds volumetric displacement (${volumetric} kg).`}
        </span>
      </div>
    </div>
  );
};
