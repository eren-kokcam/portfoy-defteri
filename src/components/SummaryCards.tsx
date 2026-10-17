import type { Holding } from "../interfaces/Holding";
import { calcPortfolio, formatPct, formatTL } from "../utils/format";

export default function SummaryCards({ holdings }: { holdings: Holding[] }) {
  const t = calcPortfolio(holdings);
  const up = t.profit >= 0;

  const cards = [
    { label: "Toplam maliyet", value: formatTL(t.cost), sub: `${holdings.length} pozisyon` },
    { label: "Güncel değer", value: formatTL(t.value), sub: "elle girilen fiyatlarla" },
    {
      label: "Kâr / Zarar",
      value: formatTL(t.profit),
      sub: formatPct(t.profitPct),
      tone: up ? "text-emerald-600" : "text-rose-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${c.tone ?? "text-slate-900"}`}>{c.value}</p>
          <p className={`mt-0.5 text-sm tabular-nums ${c.tone ?? "text-slate-500"}`}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
