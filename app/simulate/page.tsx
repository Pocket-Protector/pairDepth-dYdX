"use client";
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { SLIPPAGE_SIZES_USD } from '../../lib/config';
import { computeSlippageFromBands } from '../../lib/sampling';
import { getCachedEntries, subscribeOnCache } from '../../lib/dataCache';
import type { FormatMode, SortState } from '../../lib/types';
import SummaryBar from '../../components/SummaryBar';
import Controls from '../../components/Controls';
import Tooltip from '../../components/Tooltip';

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
`;

const Main = styled.main`
  width: 100vw; height: 100vh; overflow: hidden; padding: 20px; display: flex; flex-direction: column;
`;
const Title = styled.h1` font-size: 22px; font-weight: 700; margin: 8px 0 16px;`;
const Muted = styled.div` color: #8b949e; font-size: 12px; margin-bottom: 8px;`;
const ErrorBanner = styled.div` color: #ff6b6b; margin: 12px 0; padding: 12px; background: #2a1515; border: 1px solid #4a2020; border-radius: 8px;`;

const Table = styled.div` flex: 1; display: flex; flex-direction: column; overflow: hidden;`;
const Header = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(3, minmax(100px, 1fr)) repeat(4, minmax(120px, 1fr));
  position: sticky; top: 0; background: #0f1115; border-bottom: 1px solid #272b35; z-index: 10;
`;
const HCell = styled.div` padding: 12px 14px; font-weight: 600; color: #a6aeb9; font-size: 14px; `;
const Row = styled.div`
  display: grid; grid-template-columns: 200px repeat(3, minmax(100px, 1fr)) repeat(4, minmax(120px, 1fr));
  border-bottom: 1px solid #1a1e27; font-size: 14px; background: #10131a;
`;
const Cell = styled.div` padding: 12px 14px; &.right{ text-align:right; font-variant-numeric: tabular-nums; }`;
const Sub = styled.div` display: grid; grid-template-columns: 200px repeat(3, minmax(100px, 1fr)) repeat(4, minmax(120px, 1fr)); background: #0c0f14; border-bottom: 1px solid #1a1e27;`;
const Label = styled.div` padding: 8px 14px; color:#8b949e; font-size:12px; text-transform:uppercase; letter-spacing:.02em;`;
const VCell = styled.div<{ type: 'buy'|'sell' }>` padding:8px 14px; text-align:right; font-variant-numeric: tabular-nums; font-weight:600; color: ${p => p.type==='buy' ? '#7ee787' : '#ff9b9b'};`;

export default function Page() {
  const [formatMode, setFormatMode] = React.useState<FormatMode>('compact');
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [sortState, setSortState] = React.useState<SortState>({ column: 'volume24h', direction: 'desc' });
  const [entries, setEntries] = React.useState<any[]>([]);
  const [customUsd, setCustomUsd] = React.useState<number | null>(null);

  const sizes = React.useMemo(() => {
    const s = [...SLIPPAGE_SIZES_USD];
    if (customUsd && Number(customUsd) > 0) s.push(Number(customUsd));
    return s;
  }, [customUsd]);

  const load = React.useCallback(async () => {
    setLoading(true); setProgress(0); setError(null); setEntries([]);
    try {
      const cache = getCachedEntries();
      try { console.log('[simulate] initial cache size', cache.length); } catch {}
      if (!cache.length) {
        // No error; wait for subscription to push rows
        setProgress(0); setLoading(false); return;
      }
      // Build slippage rows entirely from cache (no new API calls)
      const acc:any[] = [];
      for (const it of cache) {
        const availableBands = Object.keys(it.bandTotals||{}).map(k => Number(k)).filter(n => Number.isFinite(n));
        const data = computeSlippageFromBands(Number(it.mid), it.bandTotals as any, sizes, availableBands);
        acc.push({ pair: it.pair, volume24h: it.volume24h, oiUsd: it.oiUsd, group: it.group, data });
      }
      setEntries(acc);
      setProgress(100);
    } catch(e:any){ setError(String(e?.message || e)); }
    finally{ setLoading(false); }
  }, [sizes]);

  React.useEffect(()=>{ load(); }, [load]);
  React.useEffect(()=>{
    // Live updates from main page cache
    const unsub = subscribeOnCache((entries) => {
      try { console.log('[simulate] cache update size', entries.length); } catch {}
      try {
        const acc:any[] = [];
        for (const it of entries) {
          const availableBands = Object.keys(it.bandTotals||{}).map(k => Number(k)).filter(n => Number.isFinite(n));
          const data = computeSlippageFromBands(Number(it.mid), it.bandTotals as any, sizes, availableBands);
          acc.push({ pair: it.pair, volume24h: it.volume24h, oiUsd: it.oiUsd, group: it.group, data });
        }
        setEntries(acc);
        setError(null);
        setProgress(entries.length ? 100 : 0);
      } catch {}
    });
    return unsub;
  }, [sizes]);

  // Also attempt to hydrate from sessionStorage after a short delay (in case main tab writes shortly after)
  React.useEffect(()=>{
    const t = setTimeout(()=>{
      const cache = getCachedEntries();
      try { console.log('[simulate] delayed hydrate size', cache.length); } catch {}
      if (cache.length) {
        const acc:any[] = [];
        for (const it of cache) {
          const availableBands = Object.keys(it.bandTotals||{}).map(k => Number(k)).filter(n => Number.isFinite(n));
          const data = computeSlippageFromBands(Number(it.mid), it.bandTotals as any, sizes, availableBands);
          acc.push({ pair: it.pair, volume24h: it.volume24h, oiUsd: it.oiUsd, group: it.group, data });
        }
        setEntries(acc);
        setError(null);
        setProgress(100);
      }
    }, 500);
    return ()=> clearTimeout(t);
  }, [sizes]);

  const columns = React.useMemo(()=>[
    { key:'ticker', label: 'Ticker' },
    { key:'volume24h', label:'24h Volume' },
    { key:'oiUsd', label:'Open Interest (USD)' },
    ...sizes.map(s => ({ key: `usd-${s}`, label: `$${s.toLocaleString()}` }))
  ],[sizes]);

  const valOf = (it:any) => {
    switch (sortState.column){
      case 'ticker': return it.pair;
      case 'volume24h': return Number(it.volume24h||0);
      case 'oiUsd': return Number(it.oiUsd||0);
      default: return 0;
    }
  };

  const groups = React.useMemo(()=>{
    const order = ['Group 1','Group 2','Group 3','Group 4'];
    const out:any[] = [];
    for (const g of order){
      const items = entries.filter(x=>x.group===g);
      if (!items.length) continue;
      const sorted = sortState.column? [...items].sort((a,b)=>{
        const av = valOf(a), bv = valOf(b);
        if (sortState.column==='ticker'){ return sortState.direction==='asc'? String(av).localeCompare(String(bv)): String(bv).localeCompare(String(av)); }
        return sortState.direction==='asc'? Number(av)-Number(bv): Number(bv)-Number(av);
      }) : items;
      out.push({ group:g, items:sorted });
    }
    return out;
  }, [entries, sortState]);

  const [tip, setTip] = React.useState<{ content: string|null; rect: DOMRect|null }>({ content:null, rect:null });

  return (
    <Main>
      <GlobalStyle />
      <Title>Slippage Simulation</Title>
      <Controls loading={loading} progress={progress} formatMode={formatMode} onRefresh={load} onFormatChange={setFormatMode} />
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
        <label>Custom USD: <input type="number" min={1} placeholder="e.g. 250000" onChange={e=>setCustomUsd(Number(e.target.value)||null)} style={{ background:'#0f1115', color:'#e6edf3', border:'1px solid #2a2f3b', padding:'6px 8px', borderRadius:8 }} /></label>
      </div>
      <SummaryBar totalMarkets={entries.length} />
      <Muted>Slippage computed from median VWAP over samples per size. Fees excluded.</Muted>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <Table>
        <Header>
          {columns.map(c=> <HCell key={c.key}>{c.label}</HCell>)}
        </Header>
        <div style={{ overflowY:'auto' }}>
          {groups.map(group => (
            <React.Fragment key={group.group}>
              <div style={{ padding:'12px 14px', background:'#0b0e13', borderBottom:'1px solid #222836', color:'#a6aeb9', fontWeight:600, fontSize:13 }}>{group.group} <span style={{ color:'#8b949e', fontWeight:400, fontSize:12, marginLeft:8 }}>{group.group==='Group 1'?'BTC-USD and ETH-USD': group.group==='Group 2'?'Volume rank 3–10': group.group==='Group 3'?'Volume rank 11–30':'Volume rank 31+'}</span></div>
              {group.items.map((it:any)=>{
                const onCellEnter = (e:React.MouseEvent, size:number, side:'buy'|'sell') => {
                  const d = (it.data||{})[size]; if (!d) return;
                  const meta = side==='buy'? d.buy: d.sell;
                  const content = `VWAP: $${(meta.vwapPrice||0).toLocaleString()}\nWorst: $${(meta.worstPrice||0).toLocaleString()}\nLevels: ${meta.levelsCrossed}\nFilled: $${(meta.filledUsd||0).toLocaleString()}`;
                  setTip({ content, rect: (e.currentTarget as HTMLElement).getBoundingClientRect() });
                };
                const onLeave = ()=> setTip({ content:null, rect:null });
                const cellFor = (size:number) => {
                  const d = (it.data||{})[size];
                  if (!d) return <Cell className='right'>-</Cell>;
                  const b = d.buy?.slippagePct; const s = d.sell?.slippagePct;
                  const bStr = Number.isFinite(b)? `${(b*100).toFixed(2)}%`: 'N/A';
                  const sStr = Number.isFinite(s)? `${(s*100).toFixed(2)}%`: 'N/A';
                  return (
                    <Cell className='right'>
                      <span style={{ color:'#7ee787' }} onMouseEnter={e=>onCellEnter(e, size, 'buy')} onMouseLeave={onLeave}>{bStr}</span>
                      <span style={{ color:'#4a5160', margin:'0 6px' }}>|</span>
                      <span style={{ color:'#ff9b9b' }} onMouseEnter={e=>onCellEnter(e, size, 'sell')} onMouseLeave={onLeave}>{sStr}</span>
                    </Cell>
                  );
                };
                return (
                  <React.Fragment key={it.pair}>
                    <Row>
                      <Cell><strong>{it.pair}</strong></Cell>
                      <Cell className='right'>{it.volume24h.toLocaleString('en-US',{ style:'currency', currency:'USD', maximumFractionDigits:2 })}</Cell>
                      <Cell className='right'>{it.oiUsd.toLocaleString('en-US',{ style:'currency', currency:'USD', maximumFractionDigits:2 })}</Cell>
                      {sizes.map(s=> <React.Fragment key={s}>{cellFor(s)}</React.Fragment>)}
                    </Row>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Table>
      <Tooltip content={tip.content} anchorRect={tip.rect} />
    </Main>
  );
}


