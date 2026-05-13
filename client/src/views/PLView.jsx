import React from 'react';
import { useMIS } from '../context/MISContext';
import { fmt } from '../utils';

export default function PLView({ monthName }) {
  const { plData, showToast } = useMIS();
  const { revenue, cogs, gp, vc, cm1, marketing, cm2, ebitda } = plData;

  const Row = ({ label, value, bold, isNegative, isMain }) => (
    <tr style={{ background: isMain ? 'var(--slate-50)' : 'transparent', borderBottom: '1px solid var(--slate-100)' }}>
      <td style={{ padding: '0.8rem 1.25rem', fontWeight: bold || isMain ? 700 : 400, fontSize: '0.95rem' }}>{label}</td>
      <td style={{ padding: '0.8rem 1.25rem', textAlign: 'right', fontWeight: bold || isMain ? 700 : 500, fontSize: '1rem', color: isNegative ? 'var(--rose-500)' : 'inherit' }}>
        {isNegative && value > 0 ? '-' : ''}{fmt(value)}
      </td>
      <td style={{ padding: '0.8rem 1.25rem', textAlign: 'right', color: 'var(--slate-400)', fontWeight: 600, fontSize: '0.85rem' }}>
        {revenue > 0 ? Math.round((value / revenue) * 100) : 0}%
      </td>
    </tr>
  );

  const exportReport = () => {
    const rows = [
      ["Particulars", "Amount", "Ratio"],
      ["Total Operating Revenue", revenue, "100%"],
      ["COGS", -cogs, Math.round(cogs/revenue*100) + "%"],
      ["Logistics", -vc, Math.round(vc/revenue*100) + "%"],
      ["CM1", cm1, Math.round(cm1/revenue*100) + "%"],
      ["Marketing", -marketing, Math.round(marketing/revenue*100) + "%"],
      ["CM2", cm2, Math.round(cm2/revenue*100) + "%"],
      ["EBITDA", ebitda, Math.round(ebitda/revenue*100) + "%"]
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pnl_report_${monthName}.csv`; a.click();
    showToast("P&L Report Exported");
  };

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', flex: 1 }}>
      {/* Executive Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', flexShrink: 0 }}>
        {[
          { label: 'REVENUE', val: revenue, col: 'var(--indigo-600)' },
          { label: 'GROSS PROFIT', val: gp, col: 'var(--emerald-600)' },
          { label: 'CM2 PROFIT', val: cm2, col: 'var(--indigo-600)' },
          { label: 'EBITDA', val: ebitda, col: ebitda >= 0 ? 'var(--emerald-600)' : 'var(--rose-500)' }
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '0.75rem' }}>
            <div className="stat-label" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.col }}>{fmt(s.val)}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>FINANCIAL BREAKDOWN</span>
            <button onClick={exportReport} className="btn-primary" style={{ background: 'var(--emerald-600)', padding: '4px 10px', fontSize: '0.65rem' }}>📥 EXPORT REPORT</button>
          </div>
          <span className="badge">{monthName}</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1.25rem' }}>Particulars</th>
                <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>% Ratio</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Total Operating Revenue" value={revenue} isMain />
              <Row label="Cost of Goods Sold (COGS)" value={cogs} isNegative />
              <Row label="Logistics & Packaging" value={vc} isNegative />
              <Row label="Contribution Margin (CM1)" value={cm1} bold />
              <Row label="Marketing Spends" value={marketing} isNegative />
              <Row label="Contribution Margin (CM2)" value={cm2} bold />
              <tr style={{ background: ebitda >= 0 ? '#f0fdf4' : '#fff1f2' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 900, fontSize: '1rem', borderTop: '2px solid var(--navy-900)' }}>EBITDA (Final)</td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 900, fontSize: '1.2rem', borderTop: '2px solid var(--navy-900)' }}>{fmt(ebitda)}</td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 900, borderTop: '2px solid var(--navy-900)' }}>{revenue > 0 ? Math.round((ebitda / revenue) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
