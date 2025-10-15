"use client";
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { SAMPLING } from '../lib/config';
import { getMarkets } from '../lib/api';
import { assignGroups } from '../lib/grouping';
import { promisePool } from '../lib/pool';
import { sampleTicker } from '../lib/sampling';
import type { FormatMode, MarketEntry, SortState } from '../lib/types';
import Controls from '../components/Controls';
import SummaryBar from '../components/SummaryBar';
import DepthTable from '../components/DepthTable/DepthTable';
import { setCachedEntries } from '../lib/dataCache';

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body { 
    margin: 0; 
    padding: 0; 
    height: 100%; 
    overflow: hidden;
    background: #0f1115; 
    color: #d7dce2; 
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  }
  
  /* Tooltip handled via portal component */
`;

const Main = styled.main`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 8px 0 16px;
`;

const ErrorBanner = styled.div`
  color: #ff6b6b;
  margin: 12px 0;
  padding: 12px;
  background: #2a1515;
  border: 1px solid #4a2020;
  border-radius: 8px;
`;

const Muted = styled.div`
  color: #8b949e;
  font-size: 12px;
  margin-bottom: 8px;
`;

const GitHubLink = styled.a`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #a6aeb9;
  text-decoration: none;
  opacity: 0.85;
  padding: 6px 10px;
  border: 1px solid #2a2f3b;
  border-radius: 8px;
  background: #0f1115;
  &:hover {
    opacity: 1;
    background: #151921;
  }
  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

export default function Page() {
  const [formatMode, setFormatMode] = React.useState<FormatMode>('compact');
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [entries, setEntries] = React.useState<MarketEntry[]>([]);
  const [sortState, setSortState] = React.useState<SortState>({ column: 'volume24h', direction: 'desc' });
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    setProgress(0);
    setError(null);
    const newEntries: MarketEntry[] = [];
    setEntries([]);

    try {
      const marketsJson = await getMarkets();
      const marketIds = marketsJson && marketsJson.markets ? Object.keys(marketsJson.markets) : [];
      const marketsMap = marketsJson.markets || {};
      const activeIds = marketIds.filter(t => {
        const m = marketsMap[t] || {};
        const status = (m.status || '').toUpperCase();
        const vol = Number(m.volume24H || 0);
        return status !== 'FINAL_SETTLEMENT' && vol >= 1000;
      });

      const sorted = activeIds
        .map(t => ({ ticker: t, volume: Number((marketsMap[t] || {}).volume24H || 0) }))
        .sort((a, b) => b.volume - a.volume)
        .map(o => o.ticker);

      const groupMap = assignGroups(sorted);
      const total = sorted.length;
      let completed = 0;

      await promisePool(sorted, SAMPLING.concurrency, async (pair) => {
        try {
          const s = await sampleTicker(String(pair), SAMPLING.samples, SAMPLING.intervalMs);
          const m = marketsMap[String(pair)] || {};
          const oiUsd = Number(m.openInterest || 0) * Number(m.oraclePrice || 0);
          const volume24h = Number(m.volume24H || 0);
          const entry: MarketEntry = {
            pair: String(pair),
            mid: s.mid,
            totals: s.totals,
            volume24h,
            oiUsd,
            bandTotals: s.bandTotals,
            group: groupMap.get(String(pair)) || 'Group 4'
          };
          newEntries.push(entry);
          try { console.log('[main] appended', entry.pair, 'now', newEntries.length); } catch {}
          setEntries([...newEntries]);
          setCachedEntries([...newEntries]);
          completed++;
          setProgress(Math.round((completed / total) * 100));
          return entry;
        } catch (e: any) {
          const entry: MarketEntry = {
            pair: String(pair),
            mid: NaN,
            totals: {},
            volume24h: 0,
            oiUsd: 0,
            bandTotals: {},
            group: groupMap.get(String(pair)) || 'Group 4',
            error: 'Orderbook error'
          };
          newEntries.push(entry);
          try { console.log('[main] appended (error)', entry.pair, 'now', newEntries.length); } catch {}
          setEntries([...newEntries]);
          setCachedEntries([...newEntries]);
          completed++;
          setProgress(Math.round((completed / total) * 100));
          return entry;
        }
      });

      setProgress(100);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const valOf = (it: MarketEntry) => {
    switch (sortState.column) {
      case 'ticker': return it.pair;
      case 'volume24h': return Number(it.volume24h || 0);
      case 'oiUsd': return Number(it.oiUsd || 0);
      case 'mid': return Number(it.mid || 0);
      default:
        if (String(sortState.column || '').startsWith('depth-')) {
          const key = String(sortState.column).slice(6);
          return Number((it.totals || {})[key] || 0);
        }
        return 0;
    }
  };

  const sortedEntries = React.useMemo(() => {
    const order = ['Group 1', 'Group 2', 'Group 3', 'Group 4'];
    const out: MarketEntry[] = [];
    for (const g of order) {
      const items = entries.filter(x => x.group === g);
      if (!items.length) continue;
      const sorted = sortState.column
        ? [...items].sort((a, b) => {
            const av = valOf(a) as any;
            const bv = valOf(b) as any;
            if (sortState.column === 'ticker') {
              return sortState.direction === 'asc'
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
            }
            return sortState.direction === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
          })
        : items;
      out.push(...sorted);
    }
    return out;
  }, [entries, sortState]);

  const toggleExpand = (pair: string) => {
    setExpanded(prev => ({ ...prev, [pair]: !prev[pair] }));
  };

  const onSort = (column: string) => {
    setSortState(prev =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    );
  };

  return (
    <>
      <GlobalStyle />
      <GitHubLink href="https://github.com/Pocket-Protector/pairDepth-dYdX" target="_blank" rel="noopener noreferrer" title="Open GitHub repository">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8Z"></path>
        </svg>
        <span>GitHub</span>
      </GitHubLink>
      <Main>
        <Title>dYdX Liquidity Analysis</Title>
        <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'space-between' }}>
          <Controls
          loading={loading}
          progress={progress}
          formatMode={formatMode}
          onRefresh={load}
          onFormatChange={setFormatMode}
          />
          <a href="/simulate" target="_blank" rel="noopener noreferrer" style={{ background:'#1e222b', color:'#e6edf3', border:'1px solid #2a2f3b', padding:'8px 12px', borderRadius:8, textDecoration:'none' }}>Simulate Slippage</a>
        </div>
        <SummaryBar totalMarkets={entries.length} />
        <Muted>
          Filters: excluding inactive (FINAL_SETTLEMENT) and low-volume markets (24h volume &lt; $1,000).
        </Muted>
        <Muted>
          Depth smoothing: median of {SAMPLING.samples} snapshots per market, {SAMPLING.intervalMs}ms apart (retries use {SAMPLING.retrySamples}).
        </Muted>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <DepthTable
          entries={sortedEntries}
          formatMode={formatMode}
          sortState={sortState}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onSort={onSort}
        />
      </Main>
    </>
  );
}
