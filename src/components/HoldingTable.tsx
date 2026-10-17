import type { Holding } from "../interfaces/Holding";
import { calcHolding, formatDate, formatNum, formatPct, formatTL } from "../utils/format";

interface HoldingTableProps {
  holdings: Holding[];
  totalValue: number;
  onEdit: (h: Holding) => void;
  onDelete: (h: Holding) => void;
}

export default function HoldingTable({ holdings, totalValue, onEdit, onDelete }: HoldingTableProps) {
  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {holdings.map((h) => {
        const c = calcHolding(h);
        const up = c.profit >= 0;
        const weight = totalValue > 0 ? c.value / totalValue : 0;
        return (
          <li key={h.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 p-4 sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-teal-50 px-2 py-0.5 font-mono text-sm font-bold text-teal-800">{h.symbol}</span>
                <span className="truncate text-sm text-slate-600">{h.name}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {h.sector} · {formatDate(h.buyDate)}
                {h.note && <> · <span className="italic">{h.note}</span></>}
              </p>
              <div className="mt-2 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-stone-100" title={`Portföy ağırlığı ${formatPct(weight)}`}>
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.max(weight * 100, 2)}%` }} />
              </div>
            </div>

            <div className="hidden text-sm sm:block">
              <p className="text-xs text-slate-400">Adet × Maliyet</p>
              <p className="tabular-nums">{formatNum(h.quantity)} × {formatTL(h.avgCost)}</p>
            </div>

            <div className="hidden text-sm sm:block">
              <p className="text-xs text-slate-400">Güncel fiyat</p>
              <p className="tabular-nums">{formatTL(h.currentPrice)}</p>
            </div>

            <div className="col-start-1 row-start-2 text-sm sm:col-start-auto sm:row-start-auto">
              <p className="text-xs text-slate-400">Değer / K-Z</p>
              <p className="font-semibold tabular-nums">{formatTL(c.value)}</p>
              <p className={`tabular-nums text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
                {up ? "▲" : "▼"} {formatTL(c.profit)} ({formatPct(c.profitPct)})
              </p>
            </div>

            <div className="row-span-2 flex flex-col gap-1.5 sm:row-span-1 sm:flex-row">
              <button onClick={() => onEdit(h)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-stone-50">
                Düzenle
              </button>
              <button onClick={() => onDelete(h)}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">
                Sil
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
