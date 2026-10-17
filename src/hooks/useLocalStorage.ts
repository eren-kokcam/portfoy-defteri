import { useEffect, useState } from "react";

/**
 * useState gibi çalışır, ancak değeri tarayıcının LocalStorage'ında saklar.
 * Sayfa yenilense bile veriler kaybolmaz.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Gizli sekme veya dolu depolama: uygulama yine de bellekte çalışmaya devam eder
    }
  }, [key, value]);

  return [value, setValue] as const;
}
