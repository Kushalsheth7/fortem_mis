import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const K = { 
  sales: "oatey-sales", 
  mis: "oatey-mis", 
  maps: "oatey-maps" 
};

const MISContext = createContext();

export function MISProvider({ children }) {
  const [fy, sFy] = useState("FY_2025-26");
  const [mi, sMi] = useState(new Date().getMonth());
  const [inv, sInv] = useState([]);
  const [ad, sAd] = useState({});
  const [maps, sMaps] = useState({});
  const [loading, sLoading] = useState(true);
  const [toast, sToast] = useState(null);

  const showToast = (message, type = "success") => {
    sToast({ message, type });
    setTimeout(() => sToast(null), 3000);
  };

  const parseSafe = (val) => {
    if (!val) return null;
    let curr = val;
    while (typeof curr === 'string') {
      try { curr = JSON.parse(curr); } catch (e) { break; }
    }
    return curr;
  };

  const load = async () => {
    sLoading(true);
    try {
      const [sR, mR, mpR] = await Promise.all([
        window.storage.get(K.sales + ":" + fy),
        window.storage.get(K.mis + ":" + fy),
        window.storage.get(K.maps)
      ]);
      sInv(parseSafe(sR?.value) || []);
      sAd(parseSafe(mR?.value) || {});
      sMaps(parseSafe(mpR?.value) || {});
    } catch (e) { showToast("Failed to load data", "error"); }
    sLoading(false);
  };

  useEffect(() => { load(); }, [fy]);

  const saveInvoices = async (ni) => {
    await window.storage.set(K.sales + ":" + fy, JSON.stringify(ni));
    sInv(ni);
  };

  const saveMIS = async (na) => {
    await window.storage.set(K.mis + ":" + fy, JSON.stringify(na));
    sAd(na);
  };

  // Advanced Stats Engine (Calculating Channel Mix & SKU Analytics)
  const stats = useMemo(() => {
    const res = { totalRevenue: 0, totalUnits: 0, orderCount: 0, skuBreakdown: [], channelMix: {} };
    const curr = inv.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === (mi === 9 ? 0 : mi === 10 ? 1 : mi === 11 ? 2 : mi + 3) % 12; // Basic FY month mapping
    });

    // We use a more reliable month check based on the actual ledger data
    const activeInvoices = inv.filter(i => {
      const d = new Date(i.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      // Simple FY mapping: Apr(3) is month 0 of FY
      const fyMonth = (m >= 3) ? (m - 3) : (m + 9);
      return fyMonth === mi;
    });

    activeInvoices.forEach(i => {
      res.totalRevenue += i.subtotal || 0;
      res.orderCount++;
      
      // Channel Mix Calculation
      const ch = i.channel || 'other';
      res.channelMix[ch] = (res.channelMix[ch] || 0) + i.subtotal;

      (i.items || []).forEach(it => {
        res.totalUnits += it.qty || 0;
        let s = res.skuBreakdown.find(x => x.sku === it.sku);
        if (!s) { s = { sku: it.sku, qty: 0, rev: 0 }; res.skuBreakdown.push(s); }
        s.qty += it.qty || 0;
        s.rev += (it.qty * it.price) || 0;
      });
    });

    res.skuBreakdown.sort((a, b) => b.rev - a.rev);
    return res;
  }, [inv, mi]);

  const plData = useMemo(() => {
    const d = ad[mi] || {};
    const rev = stats.totalRevenue || 0;
    const cogs = d.units_sold ? d.units_sold * (d.cost_per_unit || 0) : rev * 0.3;
    const vc = (d.packaging || 0) + (d.marketplace_fees || 0) + (d.courier || 0);
    const cm1 = rev - cogs - vc;
    const marketing = d.marketing || 0;
    const cm2 = cm1 - marketing;
    const fc = (d.employment || 0) + (d.rent || 0) + (d.office || 0);
    return { revenue: rev, cogs, gp: rev - cogs, vc, cm1, marketing, cm2, ebitda: cm2 - fc };
  }, [ad, mi, stats]);

  const monthStatus = useMemo(() => {
    const status = new Array(12).fill(false);
    inv.forEach(i => {
      const d = new Date(i.date);
      const m = d.getMonth();
      const fyMonth = (m >= 3) ? (m - 3) : (m + 9);
      if (fyMonth >= 0 && fyMonth < 12) status[fyMonth] = true;
    });
    return status;
  }, [inv]);

  return (
    <MISContext.Provider value={{
      fy, sFy, mi, sMi, inv, ad, maps, loading, stats, plData,
      monthStatus, toast, showToast, saveInvoices, saveMIS,
      currentMonthInvoices: inv.filter(i => {
        const d = new Date(i.date);
        const m = d.getMonth();
        const fyMonth = (m >= 3) ? (m - 3) : (m + 9);
        return fyMonth === mi;
      })
    }}>
      {children}
    </MISContext.Provider>
  );
}

export const useMIS = () => useContext(MISContext);
