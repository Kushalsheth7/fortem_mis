import React, { useEffect, useState } from "react";
import { TH } from "../constants";
import { fmt, fN, pcA } from "../utils";

export function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4e3);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? TH.red : TH.green, color: "#fff", padding: "10px 24px",
      borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    }}>
      {msg}
    </div>
  );
}

export function Metric({ label, value, sub, trend, small }) {
  const tC = trend === "up" ? TH.green : trend === "down" ? TH.red : TH.muted;
  return (
    <div style={{
      background: TH.card, borderRadius: 10, padding: small ? "12px 14px" : "18px 20px",
      border: "1px solid " + TH.border, flex: 1, minWidth: small ? 110 : 150
    }}>
      <div style={{ fontSize: 11, color: TH.muted, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: small ? 4 : 6 }}>{label}</div>
      <div style={{ fontSize: small ? 18 : 26, fontWeight: 700, color: TH.navy, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: tC, fontWeight: 600, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function DataTable({ headers, rows, compact }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: compact ? 11 : 12 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: compact ? "6px 8px" : "8px 12px", textAlign: i > 0 ? "right" : "left",
              fontWeight: 600, color: TH.muted, fontSize: 10, textTransform: "uppercase",
              letterSpacing: "0.05em", borderBottom: "2px solid " + TH.border, background: TH.bg
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: compact ? "5px 8px" : "7px 12px", textAlign: ci > 0 ? "right" : "left",
                borderBottom: "1px solid " + TH.border, fontFamily: ci > 0 ? "'JetBrains Mono',monospace" : "inherit",
                fontWeight: ci === row.length - 1 ? 600 : 400,
                color: typeof cell === "string" && cell.startsWith("-") ? TH.red : TH.navy,
                fontSize: compact ? 11 : 12
              }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ChipBadge({ text, color }) {
  return <span style={{ fontSize: 10, fontWeight: 600, color: color, background: color + "14", padding: "2px 8px", borderRadius: 4 }}>{text}</span>;
}

export function SectionCard({ title, children, noPad }) {
  return (
    <div style={{ background: TH.card, borderRadius: 10, border: "1px solid " + TH.border, overflow: "hidden", marginBottom: 16 }}>
      {title && (
        <div style={{ padding: "12px 18px", borderBottom: "1px solid " + TH.border }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TH.navy }}>{title}</div>
        </div>
      )}
      <div style={{ padding: noPad ? 0 : "16px 18px" }}>{children}</div>
    </div>
  );
}

export function TabBtn({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
      borderRadius: "8px 8px 0 0", background: active ? TH.navy : "#E2E8F0",
      color: active ? "#fff" : TH.muted, whiteSpace: "nowrap"
    }}>
      {children}
    </button>
  );
}

export function MonthPill({ label, active, hasData, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 44, padding: "4px 0", border: "1px solid " + (active ? TH.navy : hasData ? TH.green : TH.border),
      borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, textAlign: "center",
      background: active ? TH.navy : hasData ? "#F0FDF4" : "#fff", color: active ? "#fff" : TH.navy
    }}>
      {label}
      {hasData && !active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: TH.green, margin: "2px auto 0" }} />}
    </button>
  );
}

export function Collapsible({ title, icon, children, open: defOpen }) {
  const [open, setOpen] = useState(defOpen !== false);
  return (
    <div style={{ marginBottom: 14, border: "1px solid " + TH.border, borderRadius: 10, overflow: "hidden", background: TH.card }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px",
        cursor: "pointer", background: open ? TH.bg : "#fff", borderBottom: open ? "1px solid " + TH.border : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: TH.navy }}>{title}</span>
        </div>
        <span style={{ fontSize: 11, color: TH.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </div>
      {open && <div style={{ padding: "14px 18px" }}>{children}</div>}
    </div>
  );
}

export function NumInput({ label, value, onChange, prefix, highlight }) {
  const pf = prefix === undefined ? "\u20B9" : prefix;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
      <label style={{ fontSize: 11, color: TH.muted, fontWeight: 500 }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", border: (highlight ? "2px" : "1px") + " solid " + (highlight ? TH.blue : TH.border),
        borderRadius: 6, overflow: "hidden", background: highlight ? "#EFF6FF" : "#fff"
      }}>
        {pf && <span style={{ padding: "6px 8px", fontSize: 12, color: TH.muted, background: TH.bg, borderRight: "1px solid " + TH.border }}>{pf}</span>}
        <input type="number" value={value || ""} onChange={e => onChange(parseFloat(e.target.value) || 0)} placeholder="0"
          style={{ border: "none", outline: "none", padding: "8px 10px", fontSize: 13, width: "100%", background: "transparent", fontFamily: "'JetBrains Mono',monospace" }} />
      </div>
    </div>
  );
}

export function PLRow({ label, value, rev, bold, bg, indent }) {
  const v = value || 0;
  const ind = indent || 0;
  
  return (
    <div style={{
      display: "flex", alignItems: "center", padding: "6px 16px", paddingLeft: 16 + ind * 18,
      background: bg || "transparent", borderBottom: "1px solid " + TH.border
    }}>
      <span style={{ flex: 1, fontSize: 13, fontWeight: bold ? 700 : 400, color: TH.navy }}>{label}</span>
      <span style={{ width: 110, textAlign: "right", fontSize: 13, fontWeight: bold ? 700 : 400, color: v < 0 ? TH.red : TH.navy, fontFamily: "'JetBrains Mono',monospace" }}>
        {v < 0 ? "(" + fmt(-v) + ")" : fmt(v)}
      </span>
      <span style={{ width: 65, textAlign: "right", fontSize: 11, color: TH.muted, fontFamily: "'JetBrains Mono',monospace" }}>
        {rev ? pcA(Math.abs(v) / rev) : ""}
      </span>
    </div>
  );
}
