import React from 'react';
import { CHANNELS } from '../constants';

export default function UploadView({ 
  uStep, uChan, sUChan, fRef, handleFile, fName, rD, rH, cMap, sCMap, applyMap, resetUp 
}) {
  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--slate-200)', background: 'var(--slate-50)' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>DATA IMPORT CENTER</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--slate-400)' }}>Select a channel and upload your marketplace sales report</p>
        </div>

        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          {uStep === "select" && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {CHANNELS.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => sUChan(c)}
                  className="card"
                  style={{ 
                    padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s',
                    borderColor: uChan?.id === c.id ? 'var(--indigo-600)' : 'var(--slate-200)',
                    background: uChan?.id === c.id ? '#f5f7ff' : 'white',
                    boxShadow: uChan?.id === c.id ? '0 0 0 1px var(--indigo-600)' : 'none',
                    display: 'flex', flexDirection: 'column', height: '100%'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                    {uChan?.id === c.id && <span style={{ color: 'var(--indigo-600)', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--slate-400)', marginTop: '4px', fontStyle: 'italic', lineHeight: '1.2' }}>
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uStep === "select" && uChan && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2.5rem', border: '2px dashed var(--slate-200)', borderRadius: '12px', background: '#fafafa' }}>
              <input type="file" ref={fRef} onChange={handleFile} accept=".xlsx,.xls,.csv" style={{ display: 'none' }} />
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ready to upload for {uChan.name}</h3>
              <p style={{ color: 'var(--slate-400)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Click the button below to select your sales file.</p>
              <button className="btn-primary" onClick={() => fRef.current.click()} style={{ padding: '12px 32px' }}>Choose File</button>
            </div>
          )}

          {uStep === "map" && (
            <div>
              <div className="badge" style={{ marginBottom: '1rem' }}>STEP 2: MAP COLUMNS</div>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>We detected <strong>{rD.length}</strong> rows in <strong>{fName}</strong>. Please confirm the column mapping.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {[
                  { k: 'date', l: 'Date Column', r: true },
                  { k: 'sku', l: 'Product / SKU Column', r: true },
                  { k: 'quantity', l: 'Quantity Column', r: true },
                  { k: 'unit_price', l: 'Unit Price Column', r: false },
                  { k: 'order_id', l: 'Invoice/Order ID', r: false }
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--navy-700)', marginBottom: '6px' }}>
                      {f.l} {f.r && <span style={{ color: 'var(--rose-500)' }}>*</span>}
                    </label>
                    <select 
                      value={cMap[f.k] || ""} 
                      onChange={e => sCMap({ ...cMap, [f.k]: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)', fontSize: '0.8rem' }}
                    >
                      <option value="">-- Select Column --</option>
                      {rH.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" onClick={applyMap} style={{ flex: 1, padding: '12px' }}>Process & Save Data</button>
                <button onClick={resetUp} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--slate-200)', background: 'white', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {uStep === "done" && (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2>Data Upload Successful</h2>
              <p style={{ color: 'var(--slate-400)', marginBottom: '2rem' }}>Your sales data has been processed and added to the ledger.</p>
              <button className="btn-primary" onClick={resetUp}>Upload Another File</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
