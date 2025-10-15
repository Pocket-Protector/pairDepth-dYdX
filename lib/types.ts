export type DepthBandSpec = { key: string; pct: number | null };

export type BandTotals = Record<string, { bid: number; ask: number }>;
export type BandTotalsTotals = Record<string, number>;

export type MarketEntry = {
  pair: string;
  mid: number;
  totals: BandTotalsTotals;
  volume24h: number;
  oiUsd: number;
  bandTotals: BandTotals;
  group: string;
  error?: string;
};

export type SortState = { column: string | null; direction: 'asc' | 'desc' };
export type FormatMode = 'full' | 'compact';

