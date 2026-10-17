import type { Holding } from "../interfaces/Holding";

const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 2, signDisplay: "exceptZero" });
const num = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

export const formatTL = (v: number) => tl.format(v);
export const formatPct = (v: number) => pct.format(v);
export const formatNum = (v: number) => num.format(v);
export const formatDate = (iso: string) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** Bir pozisyonun maliyet, değer ve kâr/zarar bilgileri */
export function calcHolding(h: Holding) {
  const cost = h.quantity * h.avgCost;
  const value = h.quantity * h.currentPrice;
  const profit = value - cost;
  const profitPct = cost > 0 ? profit / cost : 0;
  return { cost, value, profit, profitPct };
}

/** Tüm portföyün toplamları */
export function calcPortfolio(holdings: Holding[]) {
  const totals = holdings.reduce(
    (acc, h) => {
      const c = calcHolding(h);
      acc.cost += c.cost;
      acc.value += c.value;
      return acc;
    },
    { cost: 0, value: 0 },
  );
  const profit = totals.value - totals.cost;
  return { ...totals, profit, profitPct: totals.cost > 0 ? profit / totals.cost : 0 };
}
