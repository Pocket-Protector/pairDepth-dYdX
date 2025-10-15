import { BASE_URL, MARKETS_PATH, ORDERBOOK_PATH_TMPL } from './config';

function joinUrl(base: string, path: string) {
  return (base.endsWith('/') ? base.slice(0, -1) : base) + (path.startsWith('/') ? path : '/' + path);
}

export async function fetchJson(url: string) {
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

export async function getMarkets() {
  const url = joinUrl(BASE_URL, MARKETS_PATH);
  return await fetchJson(url);
}

export async function getOrderbook(pair: string) {
  const url = joinUrl(BASE_URL, ORDERBOOK_PATH_TMPL.replace('{market}', encodeURIComponent(pair)));
  return await fetchJson(url);
}

