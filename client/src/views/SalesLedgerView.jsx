import React, { useEffect, useState, useMemo } from 'react';
import { useMIS } from '../context/MISContext';
import { fmt } from '../utils';
import { CH_MAP } from '../constants';

export default function SalesLedgerView() {
  const { currentMonthInvoices, saveInvoices, inv, showToast, mi, fy } = useMIS();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return currentMonthInvoices.filter(i => 
      i.id.toLowerCase().includes(q) || 
      i.channel.toLowerCase().includes(q) ||
      i.items.some(it => it.sku.toLowerCase().includes(q))
    );
  }, [currentMonthInvoices, search]);

  useEffect(() => {
    setPage(1);
  }, [mi, fy, search]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    const updated = inv.filter(i => i.id !== id);
    await saveInvoices(updated);
    showToast(`Transaction ${id} deleted`);
  };

  const exportCSV = () => {
    const headers = ["Invoice ID", "Date", "Channel", "Amount", "SKUs"];
    const rows = filteredItems.map(i => [
      i.id, i.date, i.channel, i.subtotal, i.items.map(it => it.sku).join("|")
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions_${mi}_${fy}.csv`; a.click();
    showToast("Exporting CSV...");
  };

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>TRANSACTIONAL LEDGER</span>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" placeholder="Search ID, SKU..." 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px', paddingLeft: '32px', borderRadius: '8px', border: '1px solid var(--slate-200)', fontSize: '0.8rem', width: '240px' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={exportCSV} className="btn-primary" style={{ background: 'var(--emerald-600)', fontSize: '0.7rem', padding: '6px 12px' }}>📥 EXPORT</button>
            <span className="badge" style={{ background: 'var(--navy-900)', color: 'white' }}>{filteredItems.length} RECORDS</span>
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>Invoice ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Channel</th>
                <th style={{ padding: '0.75rem 1rem' }}>Items / SKUs</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Ops</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '6rem', color: 'var(--slate-400)' }}>No transactions found.</td></tr>
              ) : (
                paginatedItems.map(iv => (
                  <tr key={iv.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '1rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.9rem', color: 'var(--indigo-600)' }}>{iv.id}</td>
                    <td style={{ padding: '1rem', fontWeight: 500, fontSize: '0.9rem' }}>{iv.date}</td>
                    <td style={{ padding: '1rem' }}><span className="badge" style={{ fontSize: '0.7rem' }}>{CH_MAP[iv.channel]?.name || iv.channel}</span></td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {iv.items.map((it, idx) => (
                          <span key={idx} style={{ fontSize: '0.7rem', background: 'var(--slate-50)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--slate-200)', fontWeight: 600 }}>
                            {it.sku} ({it.qty})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>{fmt(iv.subtotal)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(iv.id)} style={{ border: 'none', background: 'none', color: 'var(--rose-500)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ 
          padding: '1rem', borderTop: '1px solid var(--slate-200)', display: 'flex', 
          justifyContent: 'center', gap: '12px', background: 'var(--slate-50)', flexShrink: 0
        }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, alignSelf: 'center' }}>{page} of {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem', opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1 }}>Next</button>
        </div>
      </div>
    </div>
  );
}
