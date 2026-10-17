import { useState, type FormEvent } from "react";
import { SECTORS, type HoldingInput, type Sector } from "../interfaces/Holding";

interface HoldingFormProps {
  initial?: HoldingInput;
  submitLabel: string;
  existingSymbols: string[];
  onSubmit: (data: HoldingInput) => void;
  onCancel: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: HoldingInput = {
  symbol: "",
  name: "",
  sector: "Diğer",
  quantity: 0,
  avgCost: 0,
  currentPrice: 0,
  buyDate: today(),
  note: "",
};

type Errors = Partial<Record<keyof HoldingInput, string>>;

export default function HoldingForm({ initial, submitLabel, existingSymbols, onSubmit, onCancel }: HoldingFormProps) {
  const [form, setForm] = useState<HoldingInput>(initial ?? EMPTY);
  // Sayı alanlarını metin olarak tutuyoruz ki kullanıcı "12," gibi ara değerler yazabilsin
  const [numText, setNumText] = useState({
    quantity: initial ? String(initial.quantity) : "",
    avgCost: initial ? String(initial.avgCost) : "",
    currentPrice: initial ? String(initial.currentPrice) : "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof HoldingInput>(key: K, value: HoldingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const parseNum = (s: string) => Number(s.replace(",", "."));

  function validate(data: HoldingInput): Errors {
    const e: Errors = {};
    if (!/^[A-Z0-9.]{2,10}$/.test(data.symbol)) e.symbol = "2–10 karakter, harf/rakam (örn. THYAO)";
    else if (existingSymbols.includes(data.symbol)) e.symbol = "Bu hisse zaten portföyde, düzenlemeyi kullanın";
    if (!data.name.trim()) e.name = "Şirket adı gerekli";
    if (!(data.quantity > 0)) e.quantity = "0'dan büyük olmalı";
    if (!(data.avgCost > 0)) e.avgCost = "0'dan büyük olmalı";
    if (!(data.currentPrice > 0)) e.currentPrice = "0'dan büyük olmalı";
    if (data.buyDate > today()) e.buyDate = "Gelecek bir tarih olamaz";
    return e;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const data: HoldingInput = {
      ...form,
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim(),
      note: form.note.trim(),
      quantity: parseNum(numText.quantity),
      avgCost: parseNum(numText.avgCost),
      currentPrice: parseNum(numText.currentPrice),
    };
    const e = validate(data);
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit(data);
  }

  const input =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";
  const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";
  const err = (k: keyof HoldingInput) => errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-2 gap-4">
      <div>
        <label className={label} htmlFor="symbol">Hisse kodu</label>
        <input id="symbol" className={input + " uppercase"} value={form.symbol} placeholder="THYAO"
          onChange={(e) => set("symbol", e.target.value.toUpperCase())} />
        {err("symbol")}
      </div>
      <div>
        <label className={label} htmlFor="sector">Sektör</label>
        <select id="sector" className={input} value={form.sector}
          onChange={(e) => set("sector", e.target.value as Sector)}>
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className={label} htmlFor="name">Şirket adı</label>
        <input id="name" className={input} value={form.name} placeholder="Türk Hava Yolları"
          onChange={(e) => set("name", e.target.value)} />
        {err("name")}
      </div>
      <div>
        <label className={label} htmlFor="quantity">Adet</label>
        <input id="quantity" inputMode="decimal" className={input} value={numText.quantity} placeholder="100"
          onChange={(e) => setNumText((n) => ({ ...n, quantity: e.target.value }))} />
        {err("quantity")}
      </div>
      <div>
        <label className={label} htmlFor="buyDate">Alış tarihi</label>
        <input id="buyDate" type="date" className={input} value={form.buyDate} max={today()}
          onChange={(e) => set("buyDate", e.target.value)} />
        {err("buyDate")}
      </div>
      <div>
        <label className={label} htmlFor="avgCost">Ort. maliyet (₺)</label>
        <input id="avgCost" inputMode="decimal" className={input} value={numText.avgCost} placeholder="250,50"
          onChange={(e) => setNumText((n) => ({ ...n, avgCost: e.target.value }))} />
        {err("avgCost")}
      </div>
      <div>
        <label className={label} htmlFor="currentPrice">Güncel fiyat (₺)</label>
        <input id="currentPrice" inputMode="decimal" className={input} value={numText.currentPrice} placeholder="275,00"
          onChange={(e) => setNumText((n) => ({ ...n, currentPrice: e.target.value }))} />
        {err("currentPrice")}
      </div>
      <div className="col-span-2">
        <label className={label} htmlFor="note">Not (isteğe bağlı)</label>
        <textarea id="note" rows={2} className={input} value={form.note} placeholder="Neden aldım, hedef fiyatım…"
          onChange={(e) => set("note", e.target.value)} />
      </div>
      <div className="col-span-2 flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-100">
          Vazgeç
        </button>
        <button type="submit"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
