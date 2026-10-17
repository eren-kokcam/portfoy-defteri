interface EmptyStateProps {
  onAdd: () => void;
  onLoadSample: () => void;
}

export default function EmptyState({ onAdd, onLoadSample }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-2xl text-teal-700">📈</div>
      <h3 className="text-lg font-semibold text-slate-900">Portföyün henüz boş</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        İlk hisseni ekleyerek maliyetini, güncel değerini ve kâr/zararını takip etmeye başla.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={onAdd} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          + Hisse ekle
        </button>
        <button onClick={onLoadSample} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50">
          Örnek veri yükle
        </button>
      </div>
    </div>
  );
}
