/** Portföydeki tek bir hisse pozisyonu */
export interface Holding {
  id: string;
  symbol: string;        // Örn: THYAO
  name: string;          // Örn: Türk Hava Yolları
  sector: Sector;
  quantity: number;      // Adet
  avgCost: number;       // Ortalama alış maliyeti (₺ / adet)
  currentPrice: number;  // Güncel fiyat (₺ / adet) — elle girilir
  buyDate: string;       // YYYY-MM-DD
  note: string;
  createdAt: number;
  updatedAt: number;
}

/** Form tarafında kullanılan, henüz kaydedilmemiş alanlar */
export type HoldingInput = Omit<Holding, "id" | "createdAt" | "updatedAt">;

export const SECTORS = [
  "Bankacılık",
  "Holding",
  "Havacılık",
  "Enerji",
  "Sanayi",
  "Perakende",
  "Teknoloji",
  "Telekom",
  "Diğer",
] as const;

export type Sector = (typeof SECTORS)[number];

export type SortKey = "symbol" | "value" | "profitPct";
