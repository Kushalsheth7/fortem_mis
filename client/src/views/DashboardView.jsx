import React from 'react';
import { useMIS } from '../context/MISContext';
import { fmt, fN } from '../utils';

export default function DashboardView() {
  const { stats } = useMIS();
  const { totalRevenue, totalUnits, orderCount, skuBreakdown } = stats;

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', flex: 1 }}>
      {/* High-Impact KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', flexShrink: 0 }}>
        {[
          { label: 'Total Revenue', val: fmt(totalRevenue), col: 'var(--indigo-600)' },
          { label: 'Units Sold', val: fN(totalUnits), col: 'var(--navy-900)' },
          { label: 'Order Count', val: orderCount, col: 'var(--navy-900)' },
          { label: 'Avg Order Value', val: orderCount > 0 ? fmt(totalRevenue / orderCount) : '₹0', col: 'var(--navy-900)' }
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', borderLeft: '5px solid ' + s.col, background: 'white' }}>
            <div className="stat-label" style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--slate-400)' }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy-900)', letterSpacing: '-0.03em' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Expanded SKU Performance Center */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--slate-200)', background: 'var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>SKU CONTRIBUTION & PERFORMANCE ANALYSIS</span>
          <span className="badge" style={{ padding: '6px 12px', background: 'var(--indigo-600)', color: 'white' }}>TOP PERFORMERS</span>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>Product SKU</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 800 }}>Units Sold</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 800 }}>Revenue</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 800 }}>Revenue Weightage</th>
              </tr>
            </thead>
            <tbody>
              {skuBreakdown.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '8rem', color: 'var(--slate-400)', fontSize: '1.1rem' }}>No data available for selected period</td></tr>
              ) : (
                skuBreakdown.map((s, i) => (
                  <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid var(--slate-50)' }}>
                    <td style={{ padding: '1.15rem 1.5rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>{s.sku}</td>
                    <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right', fontSize: '1.05rem', fontWeight: 500 }}>{fN(s.qty)}</td>
                    <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right', fontWeight: 800, fontSize: '1.15rem', color: 'var(--indigo-600)' }}>{fmt(s.rev)}</td>
                    <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-700)', minWidth: '40px' }}>
                          {totalRevenue > 0 ? Math.round((s.rev / totalRevenue) * 100) : 0}%
                        </span>
                        <div style={{ width: '120px', height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: (totalRevenue > 0 ? (s.rev / totalRevenue) * 100 : 0) + '%', 
                              height: '100%', 
                              background: 'linear-gradient(90deg, var(--indigo-600), #818cf8)',
                              borderRadius: '4px'
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
