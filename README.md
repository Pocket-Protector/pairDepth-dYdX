# dYdX Liquidity Analysis

A Next.js + TypeScript web app for analyzing liquidity depth across dYdX perpetual markets using median-based sampling.

## Features

- **Median-based sampling**: Aggregates 12 orderbook snapshots per market (configurable) using median statistics for robust depth estimates
- **Multiple depth bands**: 0.08%, 0.10%, 0.12%, 0.15%, 0.20%, 0.25%, 0.30%, 0.50%, 0.75%, 1.00%, 5.00%, and Full depth
- **Grouping**: Markets organized by volume rank (BTC/ETH, top 10, top 30, others)
- **Virtualized table**: Efficient rendering with react-window for large datasets
- **Sorting & expansion**: Click headers to sort; click rows to expand bid/ask breakdowns
- **Format toggle**: Switch between full numbers and compact (K/M/B) notation
- **Concurrency control**: Configurable parallel API requests (default: 8)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## Configuration

All sampling and depth parameters are centralized in `lib/config.ts`:

```typescript
export const SAMPLING = {
  samples: 12,          // snapshots per market
  intervalMs: 400,      // delay between snapshots (ms)
  retrySamples: 16,     // samples for zero-depth retries
  concurrency: 1        // parallel API requests
};

export const DEPTH_BANDS = [
  { key: '0.08', pct: 0.08 },
  { key: '0.10', pct: 0.10 },
  // ... add/remove bands as needed
  { key: 'full', pct: null }  // full orderbook depth
];
```

Adjust these values to tune performance and accuracy.

## Architecture

- **`app/`**: Next.js App Router pages and layout
- **`components/`**: React components (Controls, SummaryBar, DepthTable)
- **`lib/`**: Core logic
  - `config.ts`: Configuration constants
  - `types.ts`: TypeScript types
  - `api.ts`: dYdX API fetch helpers
  - `depth.ts`: Depth calculation and formatting
  - `sampling.ts`: Median-based sampling logic
  - `pool.ts`: Concurrency pool for API calls
  - `grouping.ts`: Market grouping rules

```bash
npm run build
npm run start
```

## Data Source

This app uses the [dYdX v4 Indexer API](https://indexer.dydx.trade/v4):
- `/perpetualMarkets`: Market metadata
- `/orderbooks/perpetualMarket/{market}`: Real-time orderbook snapshots


