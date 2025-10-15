import type { MarketEntry } from './types';

let cachedEntries: MarketEntry[] = [];
const listeners: Array<(entries: MarketEntry[]) => void> = [];

export function setCachedEntries(entries: MarketEntry[]) {
  cachedEntries = entries;
  try {
    // Debug: surface cache size and first few tickers
    const sample = cachedEntries.slice(0, 3).map(e => e.pair);
    console.log('[cache] setCachedEntries size=', cachedEntries.length, 'sample=', sample);
  } catch {}
  // Persist to localStorage so other tabs can hydrate
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pairDepthCache', JSON.stringify(cachedEntries));
    }
  } catch {}
  for (const l of listeners) {
    try { l(cachedEntries); } catch {}
  }
}

export function getCachedEntries(): MarketEntry[] {
  // Try to hydrate from sessionStorage (same-origin tabs)
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('pairDepthCache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedEntries = parsed as MarketEntry[];
          try { console.log('[cache] hydrated from localStorage size=', cachedEntries.length); } catch {}
        }
      }
    }
  } catch {}
  return cachedEntries;
}

export function subscribeOnCache(listener: (entries: MarketEntry[]) => void): () => void {
  listeners.push(listener);
  // Immediately push current state
  try { listener(cachedEntries); } catch {}
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

// Cross-tab sync: listen for localStorage changes
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ev) => {
    try {
      if (ev.key === 'pairDepthCache' && ev.newValue) {
        const parsed = JSON.parse(ev.newValue);
        if (Array.isArray(parsed)) {
          cachedEntries = parsed as MarketEntry[];
          console.log('[cache] storage event size=', cachedEntries.length);
          for (const l of listeners) {
            try { l(cachedEntries); } catch {}
          }
        }
      }
    } catch {}
  });
}


