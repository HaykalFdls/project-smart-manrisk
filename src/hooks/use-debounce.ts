import { useEffect, useState } from "react";

/**
 * useDebounce
 * Mengembalikan nilai yang di-update setelah delay tertentu.
 *
 * @param value - state/value yang ingin di-debounce
 * @param delay - waktu delay dalam ms (default 800ms)
 */
export function useDebounce<T>(value: T, delay = 800): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
