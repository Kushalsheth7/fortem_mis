import React from 'react';

export function Toast({ msg, type, onClose }) {
  const isErr = type === 'error';
  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: isErr ? 'var(--rose-500)' : 'var(--navy-900)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{isErr ? '⚠️' : '✅'}</span>
      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}>✕</button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function Skeleton({ height = '20px', width = '100%', radius = '4px' }) {
  return (
    <div style={{
      height,
      width,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite linear'
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
