import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

import { 
  FY_OPTIONS, FY_LABELS, MONTHS, CHANNELS, CH_IDS, CH_MAP, 
  SKUS, OPEX_KEYS, OPEX_LABELS, SFIELDS, K, TH, CITY_REGIONS 
} from "./constants";

import {
  fmt, fN, pc, safeNum, pDate, normCity, detSKU, autoMap, getCalMonth, getCalYear, gMD 
} from "./utils";

import { 
  Toast, Metric, DataTable, SectionCard, TabBtn, 
  MonthPill, Collapsible, NumInput, PLRow 
} from "./components/UI";

export default function MISPortal() {
  const [fy, sFy] = useState("FY_2025-26");
  const [mi, sMi] = useState(9);
  const [dt, sDt] = useState(emptyMonth());
  const [ad, sAd] = useState({});
  const [vw, sVw] = useState("dashboard");
  const [ld, sLd] = useState(true);
  const [sv, sSv] = useState(false);
  const [inv, sInv] = useState([]);
  const [toast, sToast] = useState(null);
  const [tType, sTT] = useState("success");
  const [uChan, sUChan] = useState(null);
  const [uStep, sUStep] = useState("select");
  const [rH, sRH] = useState([]);
  const [rD, sRD] = useState([]);
  const [cMap, sCMap] = useState({});
  const [sMaps, setSMaps] = useState({});
  const [pRows, sPRows] = useState([]);
  const [skuOv, sSkuOv] = useState({});
  const [fName, sFName] = useState("");
  const fRef = useRef(null);
  const [showDP, sShowDP] = useState(false);

  const sk = K.mis + ":" + fy;
  const slk = K.sales + ":" + fy;
  const show = (m, t) => { sTT(t || "success"); sToast(m); };

  function emptyMonth() {
    return {
      ...Object.fromEntries(CH_IDS.map(c => [c, 0])),
      units_sold: 0, cost_per_unit: 22, opening_stock: 0, closing_stock: 0, purchases: 0,
      packaging: 0, marketplace_fees: 0, courier: 0, marketing: 0,
      ...Object.fromEntries(OPEX_KEYS.map(k => [k, 0]))
    };
  }

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(sk);
        if (r?.value) {
          const p = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
          sAd(p);
          if (p[mi]) sDt(p[mi]);
        }
      } catch (e) { }
      try {
        const r = await window.storage.get(slk);
        if (r?.value) {
          const p = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
          sInv(p);
        }
      } catch (e) { }
      try {
        const r = await window.storage.get(K.maps);
        if (r?.value) {
          const p = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
          setSMaps(p);
        }
      } catch (e) { }
      sLd(false);
    })();
  }, [fy]);

  useEffect(() => {
    if (ad[mi]) sDt({ ...emptyMonth(), ...ad[mi] });
    else sDt(emptyMonth());
  }, [mi, ad]);

  useEffect(() => {
    if (!inv.length) return;
    let changed = false;
    const repaired = inv.map(i => {
      const cs = (i.items || []).reduce((s, it) => s + safeNum(it.qty) * safeNum(it.price), 0);
      const cu = (i.items || []).reduce((s, it) => s + safeNum(it.qty), 0);
      if (Math.abs((i.subtotal || 0) - cs) > 0.01 || Math.abs((i.units || 0) - cu) > 0) {
        changed = true;
        return { ...i, subtotal: Math.round(cs * 100) / 100, units: cu };
      }
      return i;
    });
    if (changed) { sInv(repaired); saveInv(repaired); }
  }, [inv]);

  const upd = (k, v) => sDt(p => ({ ...p, [k]: v }));
  const saveDt = async () => {
    sSv(true);
    const u = { ...ad, [mi]: dt };
    sAd(u);
    try { await window.storage.set(sk, JSON.stringify(u)); } catch (e) { }
    sSv(false);
    show("Saved " + MONTHS[mi]);
  };
  const saveInv = async i => { try { await window.storage.set(slk, JSON.stringify(i)); } catch (e) { } };
  const saveMaps = async m => { setSMaps(m); try { await window.storage.set(K.maps, JSON.stringify(m)); } catch (e) { } };

  const handleFile = e => {
    const f = e.target.files?.[0]; if (!f) return; sFName(f.name);
    const r = new FileReader();
    r.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
        if (!json.length) { show("Empty file", "error"); return; }
        const h = Object.keys(json[0]); sRH(h); sRD(json);
        const saved = sMaps[uChan?.id];
        const auto = autoMap(h);
        sCMap(saved ? { ...auto, ...Object.fromEntries(Object.entries(saved).filter(([k, v]) => h.includes(v))) } : auto);
        sUStep("map");
      } catch (err) { show("Parse error", "error"); }
    };
    r.readAsArrayBuffer(f);
  };

  const applyMap = () => {
    if (!cMap.date || !cMap.sku || !cMap.quantity) { show("Map Date, SKU, Qty", "error"); return; }
    saveMaps({ ...sMaps, [uChan.id]: cMap });
    const rows = rD.map((row, i) => {
      const d = pDate(row[cMap.date]);
      const sr = String(row[cMap.sku] || "");
      const sk2 = detSKU(sr);
      const q = safeNum(row[cMap.quantity]);
      const p = cMap.unit_price ? safeNum(row[cMap.unit_price]) : 0;
      const g = (cMap.gst ? safeNum(row[cMap.gst]) : 0) + (cMap.cgst ? safeNum(row[cMap.cgst]) : 0) + (cMap.sgst ? safeNum(row[cMap.sgst]) : 0) + (cMap.igst ? safeNum(row[cMap.igst]) : 0);
      const cn = cMap.customer_name ? String(row[cMap.customer_name] || "").trim() : "";
      const rawCity = cMap.city ? String(row[cMap.city] || "").trim() : "";
      const { city: normC, region: regC } = normCity(rawCity);
      const unitPrice = Math.round(Math.abs(p) * 100) / 100;
      const lineTotal = Math.round(Math.max(0, Math.round(q)) * unitPrice * 100) / 100;
      return { idx: i, date: d, skuRaw: sr, sku: sk2, qty: Math.max(0, Math.round(q)), unitPrice, gst: Math.round(Math.abs(g) * 100) / 100, total: lineTotal, custName: cn, city: normC, region: regC };
    }).filter(r => r.qty > 0);
    sPRows(rows); sSkuOv({}); sUStep("preview");
  };

  const genInv = () => {
    const valid = pRows.filter(r => (skuOv[r.idx] || r.sku) && r.date);
    if (!valid.length) { show("No valid rows", "error"); return; }
    const byD = {}; valid.forEach(r => { if (!byD[r.date]) byD[r.date] = []; byD[r.date].push(r); });
    let ni = [...inv], mx = inv.length ? Math.max(...inv.map(i => parseInt(i.id.replace("INV-", "")) || 1000), 1000) : 1000, ct = 0, tr = 0, tu = 0;
    Object.entries(byD).forEach(([date, rows]) => {
      mx++;
      const items = rows.map(r => ({ sku: skuOv[r.idx] || r.sku, qty: r.qty, price: r.unitPrice, custName: r.custName || "", city: r.city || "Unknown", region: r.region || "Unknown" }));
      const sub = rows.reduce((s, r) => s + r.total, 0);
      const units = rows.reduce((s, r) => s + r.qty, 0);
      ni.push({ id: "INV-" + String(mx).padStart(6, "0"), date, channel: uChan.id, items, subtotal: Math.round(sub * 100) / 100, units, gst: Math.round(rows.reduce((s, r) => s + r.gst, 0) * 100) / 100, status: "raised", createdAt: Date.now(), source: uChan.id });
      ct++; tr += sub; tu += units;
    });
    sInv(ni); saveInv(ni);
    sUStep("done"); show(ct + " invoices generated");
  };

  const resetUp = () => { sUStep("select"); sUChan(null); sRH([]); sRD([]); sPRows([]); sCMap({}); sFName(""); if (fRef.current) fRef.current.value = ""; };
  const delInv = id => { const u = inv.filter(i => i.id !== id); sInv(u); saveInv(u); show("Deleted " + id); };

  const getMonthInv = idx => {
    const c = getCalMonth(idx); const y = getCalYear(idx, fy);
    return inv.filter(iv => { const d = new Date(iv.date); return d.getMonth() + 1 === c && d.getFullYear() === y; });
  };

  const getMonthStats = idx => {
    const mi2 = getMonthInv(idx);
    let rev = 0, units = 0;
    mi2.forEach(i => { (i.items || []).forEach(it => { const q = safeNum(it.qty); const p = safeNum(it.price); rev += q * p; units += q; }); });
    rev = Math.round(rev * 100) / 100;
    const orders = mi2.length;
    const byCh = {}; CH_IDS.forEach(c => {
      let v = 0; mi2.filter(i => i.channel === c).forEach(i => { (i.items || []).forEach(it => { v += safeNum(it.qty) * safeNum(it.price); }); });
      byCh[c] = Math.round(v * 100) / 100;
    });
    const bySKU = {}; mi2.forEach(i => { (i.items || []).forEach(it => { if (!bySKU[it.sku]) bySKU[it.sku] = { qty: 0, rev: 0 }; bySKU[it.sku].qty += safeNum(it.qty); bySKU[it.sku].rev += Math.round(safeNum(it.qty) * safeNum(it.price) * 100) / 100; }); });
    const byCust = {}; mi2.forEach(i => { (i.items || []).forEach(it => { const n = it.custName || CH_MAP[i.channel]?.name || "Other"; if (!byCust[n]) byCust[n] = { rev: 0, units: 0 }; byCust[n].rev += Math.round(safeNum(it.qty) * safeNum(it.price) * 100) / 100; byCust[n].units += safeNum(it.qty); }); });
    const byCity = {}; mi2.forEach(i => { (i.items || []).forEach(it => { const c = it.city || "Unknown"; if (!byCity[c]) byCity[c] = { city: c, region: it.region || CITY_REGIONS[c] || "Other", rev: 0, units: 0, orders: 0 }; byCity[c].rev += Math.round(safeNum(it.qty) * safeNum(it.price) * 100) / 100; byCity[c].units += safeNum(it.qty); byCity[c].orders += 1; }); });
    const byRegion = {}; Object.values(byCity).forEach(c => { const r = c.region; if (!byRegion[r]) byRegion[r] = { region: r, rev: 0, units: 0 }; byRegion[r].rev += c.rev; byRegion[r].units += c.units; });
    return { rev, units, orders, byCh, bySKU, byCust, byCity, byRegion };
  };

  const curStats = useMemo(() => getMonthStats(mi), [mi, inv, fy]);
  const totalRev = curStats.rev;
  const totalUnits = curStats.units;
  const totalOrders = curStats.orders;

  const chData = useMemo(() => CH_IDS.map(c => ({ id: c, ...CH_MAP[c], rev: curStats.byCh[c] || 0 })).filter(c => c.rev > 0).sort((a, b) => b.rev - a.rev), [curStats]);
  const topCusts = useMemo(() => Object.entries(curStats.byCust).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.rev - a.rev), [curStats]);
  const skuData = useMemo(() => Object.entries(curStats.bySKU).map(([sku, d]) => ({ sku, ...d })).sort((a, b) => b.rev - a.rev), [curStats]);
  const cityData = useMemo(() => Object.values(curStats.byCity || {}).sort((a, b) => b.rev - a.rev), [curStats]);

  const tS = totalRev || CH_IDS.reduce((s, k) => s + (dt[k] || 0), 0);
  const unitsForCogs = totalUnits || dt.units_sold || 0;
  const cogs = unitsForCogs * (dt.cost_per_unit || 22);
  const gp = tS - cogs;
  const vc = (dt.packaging || 0) + (dt.marketplace_fees || 0) + (dt.courier || 0);
  const cm1 = gp - vc;
  const cm2 = cm1 - (dt.marketing || 0);
  const tOp = OPEX_KEYS.reduce((s, k) => s + (dt[k] || 0), 0);
  const ebitda = cm2 - tOp;

  if (ld) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: TH.muted }}>Loading...</div>;

  const tabs = [{ id: "dashboard", l: "Dashboard" }, { id: "upload", l: "Upload data" }, { id: "sales", l: "Sales ops" }, { id: "input", l: "MIS input" }, { id: "pl", l: "P&L" }];

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',system-ui,sans-serif", maxWidth: "1000px", margin: "0 auto", color: TH.navy, padding: "20px" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}"}</style>
      
      {toast && <Toast msg={toast} type={tType} onClose={() => sToast(null)} />}
      
      {/* Header */}
      <div style={{ background: TH.navy, padding: "14px 22px", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Plant Essentials</div>
          <div style={{ color: "#64748B", fontSize: 11, marginTop: 1 }}>Investor MIS — Executive Dashboard</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select value={fy} onChange={e => sFy(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #334155", background: "#1E293B", color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>
            {FY_OPTIONS.map(f => <option key={f} value={f}>{FY_LABELS[f]}</option>)}
          </select>
          <button onClick={() => sShowDP(!showDP)} style={{ padding: "6px 14px", border: "1px solid #334155", borderRadius: 6, background: "transparent", color: "#94A3B8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {showDP ? "✕" : "Options"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: "#E2E8F0", borderBottom: "2px solid " + TH.navy, overflowX: "auto" }}>
        {tabs.map(t => <TabBtn key={t.id} active={vw === t.id} onClick={() => sVw(t.id)}>{t.l}</TabBtn>)}
      </div>

      {/* Main Content Area */}
      <div style={{ background: TH.bg, padding: "16px 22px", minHeight: 420 }}>
        
        {/* Period Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: TH.muted, marginRight: 6 }}>Period:</span>
          {MONTHS.map((m, i) => {
            const has = inv.some(iv => {
              const d = new Date(iv.date);
              return d.getMonth() + 1 === getCalMonth(i) && d.getFullYear() === getCalYear(i, fy);
            });
            return <MonthPill key={m} label={m} active={i === mi} hasData={has} onClick={() => sMi(i)} />;
          })}
        </div>

        {/* View Switching */}
        {vw === "dashboard" && (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <Metric label="Revenue" value={fmt(totalRev)} sub="Invoiced" />
              <Metric label="Units sold" value={fN(totalUnits)} sub={totalOrders + " orders"} />
              <Metric label="Top SKU" value={skuData[0]?.sku || "N/A"} sub={skuData[0] ? fmt(skuData[0].rev) : ""} />
              <Metric label="Top City" value={cityData[0]?.city || "N/A"} sub={cityData[0] ? fmt(cityData[0].rev) : ""} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <SectionCard title="Revenue by channel">
                {chData.length > 0 ? (
                  <div>
                    {chData.map(c => {
                      const pct = totalRev ? c.rev / totalRev : 0;
                      return (
                        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 14, width: 22 }}>{c.icon}</span>
                          <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                          <div style={{ width: 120, height: 7, background: TH.bg, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: (pct * 100) + "%", height: "100%", background: c.color, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", width: 80, textAlign: "right" }}>{fmt(c.rev)}</span>
                          <span style={{ fontSize: 11, color: TH.muted, width: 40, textAlign: "right" }}>{Math.round(pct * 100)}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ padding: 20, textAlign: "center", color: TH.muted }}>No data for {MONTHS[mi]}</div>}
              </SectionCard>
              <SectionCard title="Top customers" noPad>
                {topCusts.length > 0 ? (
                  <DataTable compact headers={["Customer", "Units", "Revenue", "%"]} rows={topCusts.slice(0, 10).map(c => [c.name, fN(c.units), fmt(c.rev), totalRev ? Math.round(c.rev / totalRev * 100) + "%" : "0%"])} />
                ) : <div style={{ padding: 24, textAlign: "center", color: TH.muted, fontSize: 12 }}>No customer data</div>}
              </SectionCard>
            </div>
          </div>
        )}

        {vw === "upload" && (
          <div>
            {uStep === "select" && (
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Upload channel sales data</div>
                <div style={{ fontSize: 12, color: TH.muted, marginBottom: 16 }}>Select channel, upload Excel, map columns, generate invoices.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {CHANNELS.map(ch => (
                    <div key={ch.id} onClick={() => sUChan(ch)} style={{ borderRadius: 10, padding: 16, cursor: "pointer", border: "2px solid " + (uChan?.id === ch.id ? ch.color : "transparent"), background: ch.bg, textAlign: "center" }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{ch.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: ch.color }}>{ch.name}</div>
                      <div style={{ fontSize: 10, color: TH.muted, marginTop: 3 }}>{ch.desc}</div>
                    </div>
                  ))}
                </div>
                {uChan && (
                  <div style={{ background: TH.card, borderRadius: 10, padding: 20, border: "1px solid " + TH.border }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 22 }}>{uChan.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Upload {uChan.name} report</div>
                        <div style={{ fontSize: 11, color: TH.muted }}>.xlsx, .xls, .csv</div>
                      </div>
                    </div>
                    <div style={{ border: "2px dashed " + TH.border, borderRadius: 10, padding: 28, textAlign: "center", background: TH.bg, cursor: "pointer" }} onClick={() => fRef.current?.click()}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TH.navy }}>Click to browse</div>
                    </div>
                    <input ref={fRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: "none" }} />
                  </div>
                )}
              </div>
            )}
            
            {uStep === "map" && (
              <SectionCard title={"Map columns — " + uChan?.name + " (" + fName + ")"}>
                <div style={{ fontSize: 11, color: TH.muted, marginBottom: 14 }}>{rD.length} rows. <span style={{ color: TH.red }}>*</span> = required.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {SFIELDS.map(f => (
                    <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: TH.muted }}>{f.label}{f.req && <span style={{ color: TH.red }}> *</span>}</label>
                      <select value={cMap[f.key] || ""} onChange={e => sCMap(p => ({ ...p, [f.key]: e.target.value || undefined }))} style={{ padding: "8px 10px", border: "1px solid " + (cMap[f.key] ? TH.green : TH.border), borderRadius: 6, fontSize: 12, background: cMap[f.key] ? "#F0FDF4" : "#fff" }}>
                        <option value="">— Not mapped —</option>
                        {rH.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button onClick={resetUp} style={{ padding: "10px 24px", border: "1px solid " + TH.border, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, color: TH.navy }}>Cancel</button>
                  <button onClick={applyMap} style={{ padding: "10px 24px", background: TH.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Preview →</button>
                </div>
              </SectionCard>
            )}

            {uStep === "preview" && (
              <div style={{ background: TH.card, borderRadius: 10, border: "1px solid " + TH.border, overflow: "hidden" }}>
                <div style={{ background: TH.navy, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Review — {uChan?.name}</div>
                    <div style={{ color: "#64748B", fontSize: 11 }}>{pRows.length} items</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => sUStep("map")} style={{ padding: "6px 14px", border: "1px solid #334155", borderRadius: 6, background: "transparent", color: "#94A3B8", fontSize: 12, cursor: "pointer" }}>← Re-map</button>
                    <button onClick={resetUp} style={{ padding: "6px 14px", border: "1px solid #334155", borderRadius: 6, background: "transparent", color: "#94A3B8", fontSize: 12, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ overflowX: "auto", maxHeight: 280, border: "1px solid " + TH.border, borderRadius: 8, marginBottom: 14 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr>
                          {["Date", "Product", "Qty", "Rate", "Total"].map((h, i) => (
                            <th key={i} style={{ padding: "6px 10px", textAlign: i >= 2 ? "right" : "left", fontWeight: 600, color: TH.muted, fontSize: 10, borderBottom: "2px solid " + TH.border, background: TH.bg, position: "sticky", top: 0 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pRows.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: "5px 10px", borderBottom: "1px solid " + TH.border }}>{r.date}</td>
                            <td style={{ padding: "5px 10px", borderBottom: "1px solid " + TH.border }}>{r.sku}</td>
                            <td style={{ padding: "5px 10px", borderBottom: "1px solid " + TH.border, textAlign: "right" }}>{r.qty}</td>
                            <td style={{ padding: "5px 10px", borderBottom: "1px solid " + TH.border, textAlign: "right" }}>{fmt(r.unitPrice)}</td>
                            <td style={{ padding: "5px 10px", borderBottom: "1px solid " + TH.border, textAlign: "right", fontWeight: 600 }}>{fmt(r.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={genInv} style={{ padding: "12px 28px", background: TH.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Generate invoices</button>
                  </div>
                </div>
              </div>
            )}

            {uStep === "done" && (
              <div style={{ textAlign: "center", padding: 40, background: TH.card, borderRadius: 10, border: "1px solid " + TH.border }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Invoices generated</div>
                <div style={{ fontSize: 13, color: TH.green, fontWeight: 600, marginBottom: 18 }}>Auto detected: {MONTHS[mi]} {FY_LABELS[fy]}</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button onClick={resetUp} style={{ padding: "10px 24px", border: "1px solid " + TH.border, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, color: TH.navy }}>Upload more</button>
                  <button onClick={() => sVw("dashboard")} style={{ padding: "10px 24px", background: TH.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Dashboard</button>
                </div>
              </div>
            )}
          </div>
        )}

        {vw === "sales" && (
          <div>
            <SectionCard title={MONTHS[mi] + " — invoice ledger"} noPad>
              {!getMonthInv(mi).length ? (
                <div style={{ padding: 30, textAlign: "center", color: TH.muted }}>No invoices for {MONTHS[mi]}</div>
              ) : (
                <DataTable headers={["Invoice", "Date", "Channel", "Amount", ""]} rows={getMonthInv(mi).map(iv => [iv.id, iv.date, CH_MAP[iv.channel]?.name || iv.channel, fmt(iv.subtotal), <button key={iv.id} onClick={() => delInv(iv.id)} style={{ color: TH.red, border: "none", background: "transparent", cursor: "pointer" }}>✕</button>])} />
              )}
            </SectionCard>
          </div>
        )}

        {vw === "input" && (
          <div>
            <Collapsible title="Revenue by channel" icon={"📊"}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {CH_IDS.map(k => <NumInput key={k} label={CH_MAP[k].name} value={dt[k]} onChange={v => upd(k, v)} />)}
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: TH.bg, borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(tS)}</span>
              </div>
            </Collapsible>
            <Collapsible title="Units & Inventory" icon={"📦"}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <NumInput label="Units sold" value={dt.units_sold} onChange={v => upd("units_sold", v)} prefix="#" />
                <NumInput label="Cost/unit" value={dt.cost_per_unit} onChange={v => upd("cost_per_unit", v)} />
              </div>
            </Collapsible>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
              <button onClick={saveDt} style={{ padding: "10px 24px", border: "2px solid " + TH.navy, borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", color: TH.navy }}>{sv ? "Saving..." : "Save " + MONTHS[mi]}</button>
            </div>
          </div>
        )}

        {vw === "pl" && (
          <div style={{ background: TH.card, borderRadius: 10, border: "1px solid " + TH.border, overflow: "hidden" }}>
            <div style={{ background: TH.navy, padding: "12px 18px" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>P&L — {MONTHS[mi]} {FY_LABELS[fy]}</span>
            </div>
            <div style={{ display: "flex", padding: "8px 16px", background: TH.bg, borderBottom: "1px solid " + TH.border, fontSize: 11, fontWeight: 600, color: TH.muted }}>
              <span style={{ flex: 1 }}>Particulars</span>
              <span style={{ width: 110, textAlign: "right" }}>Amount</span>
              <span style={{ width: 65, textAlign: "right" }}>% Rev</span>
            </div>
            <PLRow label="REVENUE" value={tS} rev={tS} bold bg="#EFF6FF" />
            <PLRow label="COGS" value={-cogs} rev={tS} bold bg="#FEF2F2" />
            <PLRow label="GROSS PROFIT" value={gp} rev={tS} bold bg="#F0FDF4" />
            <PLRow label="EBITDA" value={ebitda} rev={tS} bold bg={ebitda >= 0 ? "#F0FDF4" : "#FEF2F2"} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: TH.navy, padding: "10px 22px", borderRadius: "0 0 12px 12px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#475569", fontSize: 11 }}>Plant Essentials Pvt Ltd</span>
        <span style={{ color: "#475569", fontSize: 11 }}>{inv.length} invoices | {FY_LABELS[fy]}</span>
      </div>
    </div>
  );
}
