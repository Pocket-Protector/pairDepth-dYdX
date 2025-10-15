export const BASE_URL = 'https://indexer.dydx.trade/v4';
export const MARKETS_PATH = '/perpetualMarkets';
export const ORDERBOOK_PATH_TMPL = '/orderbooks/perpetualMarket/{market}';

export const DEPTH_BANDS = [
  { key: '0.08', pct: 0.08 },
  { key: '0.10', pct: 0.10 },
  { key: '0.12', pct: 0.12 },
  { key: '0.15', pct: 0.15 },
  { key: '0.20', pct: 0.20 },
  { key: '0.25', pct: 0.25 },
  { key: '0.30', pct: 0.30 },
  { key: '0.50', pct: 0.50 },
  { key: '0.75', pct: 0.75 },
  { key: '1.00', pct: 1.00 },
  { key: '5.00', pct: 5.00 },
  { key: 'full', pct: null }
];

export const SAMPLING = {
  samples: 12,
  intervalMs: 400,
  retrySamples: 16,
  concurrency: 1
};

// Default slippage sizes in USD
export const SLIPPAGE_SIZES_USD = [10000, 100000, 1000000];

