import { DEPTH_BANDS } from './config';

export function computeMid(bids: any[], asks: any[]): number {
  if (!bids.length || !asks.length) return NaN;
  const bestBid = bids.reduce((m, r) => Math.max(m, Number(r.price)), -Infinity);
  const bestAsk = asks.reduce((m, r) => Math.min(m, Number(r.price)), Infinity);
  return (bestBid + bestAsk) / 2;
}

export function accumulateDepth(bids: any[], asks: any[], mid: number, pct: number) {
  const lower = mid * (1 - pct);
  const upper = mid * (1 + pct);
  let bidNotional = 0;
  let askNotional = 0;
  for (const b of bids) {
    const price = Number(b.price);
    const size = Number(b.size);
    if (Number.isFinite(price) && Number.isFinite(size) && price >= lower) bidNotional += price * size;
  }
  for (const a of asks) {
    const price = Number(a.price);
    const size = Number(a.size);
    if (Number.isFinite(price) && Number.isFinite(size) && price <= upper) askNotional += price * size;
  }
  return { bidNotional, askNotional, total: bidNotional + askNotional };
}

export function computeFullDepth(bids: any[], asks: any[]) {
  let bidNotional = 0;
  let askNotional = 0;
  for (const b of bids) {
    const price = Number(b.price);
    const size = Number(b.size);
    if (Number.isFinite(price) && Number.isFinite(size)) bidNotional += price * size;
  }
  for (const a of asks) {
    const price = Number(a.price);
    const size = Number(a.size);
    if (Number.isFinite(price) && Number.isFinite(size)) askNotional += price * size;
  }
  return { bidNotional, askNotional, total: bidNotional + askNotional };
}

export function formatUsd(n: number, mode: 'full' | 'compact') {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const num = Number(n);
  if (!Number.isFinite(num)) return '';
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: mode === 'compact' ? 2 : 2,
    notation: mode === 'compact' ? 'compact' : 'standard',
    compactDisplay: 'short'
  };
  return new Intl.NumberFormat(undefined, opts).format(num);
}

export function formatUsdMid(n: number) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const num = Number(n);
  if (!Number.isFinite(num)) return '';
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 6,
    notation: 'standard'
  };
  return new Intl.NumberFormat(undefined, opts).format(num);
}

export function makeDepthTooltip(pair: string, mid: number, pct: number, bandTotals: Record<string, { bid: number; ask: number }>, key: string) {
  if (!Number.isFinite(mid)) return '';
  const lower = mid * (1 - pct / 100);
  const upper = mid * (1 + pct / 100);
  const parts = [];
  parts.push(`${pair} ${pct}% price band`);
  parts.push(`Mid: ${formatUsdMid(mid)}`);
  parts.push(`Range: ${formatUsdMid(lower)} – ${formatUsdMid(upper)}`);
  if (bandTotals && bandTotals[key]) {
    const bid = Number(bandTotals[key].bid);
    const ask = Number(bandTotals[key].ask);
    if (Number.isFinite(bid) || Number.isFinite(ask)) {
      parts.push(`Notional within band → bids: ${formatUsd(bid || 0, 'full')}, asks: ${formatUsd(ask || 0, 'full')}`);
    }
  }
  return parts.join('\n');
}

