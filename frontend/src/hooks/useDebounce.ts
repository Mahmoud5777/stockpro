"use client";

import { useEffect, useState } from "react";

/**
 * Retourne une version "debouncée" de la valeur passée en paramètre.
 * Utile pour limiter les appels API lors de la saisie utilisateur (recherche, filtres...).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
