import { useMemo, useState } from "react";
import type { Holding, HoldingInput, SortKey } from "../interfaces/Holding";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { calcHolding, calcPortfolio } from "../utils/format";
import SummaryCards from "../components/SummaryCards";
import HoldingTable from "../components/HoldingTable";
import HoldingForm from "../components/HoldingForm";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

type Dialog = { mode: "add" } | { mode: "edit"; holding: Holding } | { mode: "delete"; holding: Holding } | null;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());

// Örnek veriler eğitim amaçlıdır; fiyatlar gerçek piyasa fiyatı değildir.
const SAMPLE: HoldingInput[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları", sector: "Havacılık", quantity: 40, avgCost: 285.5, currentPrice: 302.25, buyDate: "2026-03-12", note: "Örnek veri" },
  { symbol: "ASELS", name: "Aselsan", sector: "Teknoloji", quantity: 60, avgCost: 118.2, currentPrice: 131.4, buyDate: "2026-05-04", note: "Örnek veri" },
  { symbol: "BIMAS", name: "BİM Mağazalar", sector: "Perakende", quantity: 15, avgCost: 545.0, currentPrice: 521.75, buyDate: "2026-06-20", note: "Örnek veri" },
  { symbol: "AKBNK", name: "Akbank", sector: "Bankacılık", quantity: 120, avgCost: 61.3, currentPrice: 58.9, buyDate: "2026-08-02", note: "Örnek veri" },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useLocalStorage<Holding[]>("portfoy-defteri:holdings", []);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  // ---------- CRUD ----------
  // EKLE
  function addHolding(data: HoldingInput) {
    const now = Date.now();
    setHoldings((list) => [...list, { ...data, id: newId(), createdAt: now, updatedAt: now }]);
    setDialog(null);
    notify(`${data.symbol} portföye eklendi`);
  }

  // GÜNCELLE
  function updateHolding(id: string, data: HoldingInput) {
    setHoldings((list) => list.map((h) => (h.id === id ? { ...h, ...data, updatedAt: Date.now() } : h)));
    setDialog(null);
    notify(`${data.symbol} güncellendi`);
  }

  // SİL
  function deleteHolding(id: string) {
    const removed = holdings.find((h) => h.id === id);
    setHoldings((list) => list.filter((h) => h.id !== id));
    setDialog(null);
    if (removed) notify(`${removed.symbol} silindi`);
  }

  function loadSample() {
    const now = Date.now();
    setHoldings(SAMPLE.map((s, i) => ({ ...s, id: newId(), createdAt: now + i, updatedAt: now + i })));
    notify("Örnek portföy yüklendi");
  }

  // LİSTELE (arama + sıralama)
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = q
      ? holdings.filter((h) =>
          [h.symbol, h.name, h.sector].some((f) => f.toLocaleLowerCase("tr-TR").includes(q)))
      : holdings;
    return [...filtered].sort((a, b) => {
      if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol, "tr");
      const ca = calcHolding(a), cb = calcHolding(b);
      return sortKey === "value" ? cb.value - ca.value : cb.profitPct - ca.profitPct;
    });
  }, [holdings, query, sortKey]);

  const totalValue = calcPortfolio(holdings).value;
  const symbolsExcept = (id?: string) => holdings.filter((h) => h.id !== id).map((h) => h.symbol);

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16l5-5 4 4 7-7" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Portföy Defteri</h1>
              <p className="text-xs text-slate-500">Hisselerini ekle, takip et, güncelle</p>
            </div>
          </div>
          <button onClick={() => setDialog({ mode: "add" })}
            className="shrink-0 whitespace-nowrap rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
            + Hisse ekle
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <SummaryCards holdings={holdings} />

        {holdings.length === 0 ? (
          <EmptyState onAdd={() => setDialog({ mode: "add" })} onLoadSample={loadSample} />
        ) : (
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kod, şirket veya sektör ara…"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 sm:max-w-xs" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Sırala:</span>
                {([["value", "Değer"], ["profitPct", "Getiri %"], ["symbol", "Kod"]] as [SortKey, string][]).map(([k, l]) => (
                  <button key={k} onClick={() => setSortKey(k)}
                    className={`rounded-full px-3 py-1 ${sortKey === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-stone-300 hover:bg-stone-50"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {visible.length > 0 ? (
              <HoldingTable holdings={visible} totalValue={totalValue}
                onEdit={(h) => setDialog({ mode: "edit", holding: h })}
                onDelete={(h) => setDialog({ mode: "delete", holding: h })} />
            ) : (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500">“{query}” ile eşleşen hisse yok.</p>
            )}
          </section>
        )}

        <p className="pt-4 text-center text-xs text-slate-400">
          Veriler yalnızca bu tarayıcıda (LocalStorage) saklanır. Fiyatlar elle girilir; yatırım tavsiyesi değildir.
        </p>
      </main>

      <Modal title="Yeni hisse ekle" open={dialog?.mode === "add"} onClose={() => setDialog(null)}>
        <HoldingForm submitLabel="Ekle" existingSymbols={symbolsExcept()} onSubmit={addHolding} onCancel={() => setDialog(null)} />
      </Modal>

      {dialog?.mode === "edit" && (
        <Modal title={`${dialog.holding.symbol} düzenle`} open onClose={() => setDialog(null)}>
          <HoldingForm
            key={dialog.holding.id}
            initial={dialog.holding}
            submitLabel="Kaydet"
            existingSymbols={symbolsExcept(dialog.holding.id)}
            onSubmit={(data) => updateHolding(dialog.holding.id, data)}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.mode === "delete" && (
        <Modal title="Hisseyi sil" open onClose={() => setDialog(null)}>
          <p className="text-sm text-slate-600">
            <b className="text-slate-900">{dialog.holding.symbol}</b> ({dialog.holding.name}) portföyden kalıcı olarak silinecek. Emin misin?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDialog(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-100">Vazgeç</button>
            <button onClick={() => deleteHolding(dialog.holding.id)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Sil</button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
