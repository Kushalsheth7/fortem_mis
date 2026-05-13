import React, { useState, useRef } from 'react';
import * as XLSX from "xlsx";
import { MISProvider, useMIS } from './context/MISContext';
import { FY_OPTIONS, FY_LABELS, MONTHS } from './constants';
import { Toast, Skeleton } from './components/Feedback';
import { pDate, detSKU, safeNum, autoMap } from './utils';

// Sub-views
import DashboardView from './views/DashboardView';
import PLView from './views/PLView';
import UploadView from './views/UploadView';
import SalesLedgerView from './views/SalesLedgerView';

import './styles/Theme.css';

function PortalCore() {
  const [vw, sVw] = useState("dashboard");
  const { 
    fy, sFy, mi, sMi, loading, stats, currentMonthInvoices, 
    monthStatus, toast, showToast, saveInvoices, inv 
  } = useMIS();

  // Upload Logic (Refined with Auto-Mapping)
  const [uStep, sUStep] = useState("select");
  const [uChan, sUChan] = useState(null);
  const [rH, sRH] = useState([]);
  const [rD, sRD] = useState([]);
  const [cMap, sCMap] = useState({});
  const [fName, sFName] = useState("");
  const fRef = useRef(null);

  const handleFile = e => {
    const f = e.target.files?.[0]; if (!f) return; sFName(f.name);
    const r = new FileReader();
    r.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
        if (!json.length) return;
        
        const headers = Object.keys(json[0]);
        sRH(headers);
        sRD(json);
        
        // --- Trigger Auto-Mapping ---
        const initialMap = autoMap(headers);
        sCMap(initialMap);
        
        sUStep("map");
      } catch (err) { showToast("Error parsing file", "error"); }
    };
    r.readAsArrayBuffer(f);
  };

  const applyMap = async () => {
    if (!cMap.date || !cMap.sku || !cMap.quantity) {
      showToast("Please map required fields (Date, SKU, Quantity)", "error");
      return;
    }
    
    const ni = [...inv];
    let mx = inv.length ? Math.max(...inv.map(i => parseInt(i.id.replace("INV-", "")) || 1000), 1000) : 1000;
    const byD = {};
    
    rD.forEach(row => {
      const d = pDate(row[cMap.date]); if (!d) return;
      if (!byD[d]) byD[d] = []; byD[d].push(row);
    });
    
    Object.entries(byD).forEach(([date, rows]) => {
      mx++;
      const items = rows.map(r => ({
        sku: detSKU(r[cMap.sku]),
        qty: safeNum(r[cMap.quantity]),
        price: cMap.unit_price ? safeNum(r[cMap.unit_price]) : 0,
      })).filter(it => it.qty > 0);
      
      if (items.length === 0) return;
      
      ni.push({
        id: "INV-" + String(mx).padStart(6, "0"),
        date, channel: uChan.id, items,
        subtotal: Math.round(items.reduce((s, it) => s + it.qty * it.price, 0) * 100) / 100,
      });
    });
    
    await saveInvoices(ni);
    showToast(`Successfully processed ${Object.keys(byD).length} days of data`);
    sUStep("done");
  };

  return (
    <div className="portal-container">
      {toast && <Toast msg={toast.message} type={toast.type} onClose={() => {}} />}

      <header className="glass-header" style={{ padding: '0.75rem 1.5rem', zIndex: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>ULTRACEUTICALS <span style={{ fontWeight: 300, opacity: 0.6 }}>MIS</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={fy} onChange={e => sFy(e.target.value)} className="btn-primary" style={{ background: 'var(--navy-800)', padding: '4px 12px', fontSize: '0.7rem' }}>
            {FY_OPTIONS.map(f => <option key={f} value={f}>{FY_LABELS[f]}</option>)}
          </select>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar" style={{ width: '240px' }}>
          <nav style={{ flex: 1 }}>
            {[
              { id: "dashboard", label: "Overview", icon: "📊" },
              { id: "pl", label: "P&L Analysis", icon: "📈" },
              { id: "sales", label: "Transactions", icon: "🧾" },
              { id: "upload", label: "Data Import", icon: "📤" }
            ].map(t => (
              <div key={t.id} onClick={() => sVw(t.id)} className={`nav-tab ${vw === t.id ? 'active' : ''}`} style={{ marginBottom: '2px', padding: '0.75rem 1rem' }}>
                <span style={{ marginRight: '10px' }}>{t.icon}</span> {t.label}
              </div>
            ))}
          </nav>

          <div className="card" style={{ padding: '0.75rem' }}>
            <div className="stat-label" style={{ marginBottom: '0.75rem', fontSize: '0.6rem' }}>PERIOD SELECTION</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {MONTHS.map((m, i) => (
                <button
                  key={m} onClick={() => sMi(i)}
                  style={{
                    padding: '6px 0', borderRadius: '4px', border: '1px solid',
                    borderColor: mi === i ? 'var(--indigo-600)' : 'var(--slate-200)',
                    background: mi === i ? 'var(--indigo-600)' : 'white',
                    color: mi === i ? 'white' : 'var(--navy-900)',
                    fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', position: 'relative'
                  }}
                >
                  {m}
                  {monthStatus[i] && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', width: '4px', height: '4px', background: mi === i ? 'white' : 'var(--emerald-500)', borderRadius: '50%' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="content-viewport" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem' }}><Skeleton height="40px" width="40%" /><br/><Skeleton height="300px" /></div>
          ) : (
            <>
              {vw === "dashboard" && <DashboardView />}
              {vw === "pl" && <PLView monthName={MONTHS[mi]} />}
              {vw === "sales" && <SalesLedgerView />}
              {vw === "upload" && (
                <UploadView 
                  uStep={uStep} uChan={uChan} sUChan={sUChan} fRef={fRef} 
                  handleFile={handleFile} fName={fName} rD={rD} rH={rH} 
                  cMap={cMap} sCMap={sCMap} applyMap={applyMap} resetUp={() => sUStep("select")}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MISPortal() {
  return <MISProvider><PortalCore /></MISProvider>;
}
