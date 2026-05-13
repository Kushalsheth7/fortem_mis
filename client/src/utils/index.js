import * as XLSX from "xlsx";
import { SKU_KW, CITY_NORM, CITY_REGIONS } from "../constants";

export const fmt = n => {
  if (n == null || isNaN(n)) return "-";
  const a = Math.abs(n);
  if (a >= 1e7) return (n < 0 ? "-" : "") + "\u20B9" + (a / 1e7).toFixed(2) + "Cr";
  if (a >= 1e5) return (n < 0 ? "-" : "") + "\u20B9" + (a / 1e5).toFixed(2) + "L";
  if (a >= 1e3) return (n < 0 ? "-" : "") + "\u20B9" + (a / 1e3).toFixed(1) + "K";
  return (n < 0 ? "-\u20B9" : "\u20B9") + a.toFixed(0);
};

export const fN = n => n == null || isNaN(n) ? "0" : Math.round(n).toLocaleString("en-IN");
export const pc = n => n == null || isNaN(n) ? "-" : (n >= 0 ? "+" : "") + ((n) * 100).toFixed(1) + "%";
export const pcA = n => n == null ? "-" : (n * 100).toFixed(1) + "%";

export const safeNum = v => {
  if (v == null) return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  const s = String(v).replace(/[\u20B9$€,\s]/g, "").replace(/INR|USD|Rs\.?/gi, "").trim();
  if (!s) return 0;
  const m = s.match(/^\((.+)\)$/);
  const n = parseFloat(m ? "-" + m[1] : s);
  return isNaN(n) ? 0 : n;
};

export const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
export const getCalMonth = mi => { const m = mi + 4; return m > 12 ? m - 12 : m; };
export const getCalYear = (mi, fy) => {
  const cm = getCalMonth(mi);
  const s = parseInt(fy.split("_")[1].split("-")[0]);
  return cm >= 4 ? s : s + 1;
};
export const gMD = (mi, fy, dy = 15) => getCalYear(mi, fy) + "-" + String(getCalMonth(mi)).padStart(2, "0") + "-" + String(dy).padStart(2, "0");
export const getWeekNum = d => { const day = new Date(d).getDate(); return day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4; };

export const detSKU = t => {
  if (!t) return "Others";
  const s = String(t).toLowerCase().replace(/[^a-z0-9\s\-]/g, "").trim();
  if (!s) return "Others";
  let best = null, bs = 0;
  for (const [sku, kws] of Object.entries(SKU_KW)) {
    for (const kw of kws) {
      if (s.includes(kw)) {
        const sc = 0.85 + kw.length / s.length * 0.15;
        if (sc > bs) { bs = sc; best = sku; }
      }
      const ws = s.split(/\s+/);
      for (const w of ws) {
        if (w.length >= 3 && kw.includes(w) && 0.4 > bs) { bs = 0.4; best = sku; }
      }
    }
  }
  return bs >= 0.3 ? best : "Others";
};

export const pDate = v => {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v.toISOString().split("T")[0];
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    return d ? d.y + "-" + String(d.m).padStart(2, "0") + "-" + String(d.d).padStart(2, "0") : null;
  }
  const s = String(v).trim();
  let m;
  if ((m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/))) return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0");
  if ((m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/))) {
    const a = +m[1], b = +m[2];
    if (a > 12) return m[3] + "-" + String(b).padStart(2, "0") + "-" + String(a).padStart(2, "0");
    return m[3] + "-" + String(b).padStart(2, "0") + "-" + String(a).padStart(2, "0");
  }
  const d = new Date(s);
  return !isNaN(d) ? d.toISOString().split("T")[0] : null;
};

export const normCity = raw => {
  if (!raw) return { city: "Unknown", region: "Unknown" };
  const k = String(raw).trim().toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const city = CITY_NORM[k] || raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const region = CITY_REGIONS[city] || "Other";
  return { city, region };
};

export const autoMap = h => {
  const m = {};
  const l = h.map(x => String(x || "").toLowerCase());
  const f = p => l.findIndex(x => p.some(q => x.includes(q)));
  let i;
  if ((i = f(["date", "order date", "invoice date"])) >= 0) m.date = h[i];
  if ((i = f(["sku", "product", "item", "description"])) >= 0) m.sku = h[i];
  if ((i = f(["qty", "quantity", "units"])) >= 0) m.quantity = h[i];
  if ((i = f(["rate", "unit price", "price", "selling price", "mrp"])) >= 0) m.unit_price = h[i];
  if ((i = f(["customer name", "customer", "buyer", "client", "sold to"])) >= 0) m.customer_name = h[i];
  if ((i = f(["city", "location", "ship city", "billing city", "delivery city"])) >= 0) m.city = h[i];
  if ((i = f(["gst", "tax amount", "total tax"])) >= 0) m.gst = h[i];
  if ((i = f(["cgst"])) >= 0) m.cgst = h[i];
  if ((i = f(["sgst"])) >= 0) m.sgst = h[i];
  if ((i = f(["igst"])) >= 0) m.igst = h[i];
  if ((i = f(["order id", "order no", "invoice no", "invoice number"])) >= 0) m.order_id = h[i];
  return m;
};
