"use client";
import React from 'react';
import styled from 'styled-components';
import { VariableSizeList as List } from 'react-window';
import { DEPTH_BANDS } from '../../lib/config';
import { getGroupSubtitle } from '../../lib/grouping';
import type { MarketEntry, FormatMode, SortState } from '../../lib/types';
import GroupHeader from './GroupHeader';
import RowMain from './RowMain';
import RowSubAsks from './RowSubAsks';
import RowSubBids from './RowSubBids';

const Wrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(3, minmax(100px, 1fr)) repeat(12, minmax(80px, 1fr));
  position: sticky;
  top: 0;
  background: #0f1115;
  border-bottom: 1px solid #272b35;
  z-index: 10;
  overflow: hidden;
`;

const HeaderCell = styled.div`
  padding: 12px 14px;
  font-weight: 600;
  color: #a6aeb9;
  text-align: left;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  &:hover { background: #151921; }
  &.right { text-align: right; }
  &.sorted::after {
    content: ' ↑';
    opacity: 1;
  }
  &.sorted.desc::after {
    content: ' ↓';
  }
`;

type RowItem = 
  | { type: 'group'; group: string }
  | { type: 'main'; entry: MarketEntry }
  | { type: 'sub-asks'; entry: MarketEntry }
  | { type: 'sub-bids'; entry: MarketEntry };

type Props = {
  entries: MarketEntry[];
  formatMode: FormatMode;
  sortState: SortState;
  expanded: Record<string, boolean>;
  onToggleExpand: (pair: string) => void;
  onSort: (column: string) => void;
};

export default function DepthTable({ entries, formatMode, sortState, expanded, onToggleExpand, onSort }: Props) {
  const headerCells = [
    { key: 'ticker', label: 'Ticker', align: 'left' },
    { key: 'volume24h', label: '24h Volume', align: 'right' },
    { key: 'oiUsd', label: 'Open Interest (USD)', align: 'right' },
    { key: 'mid', label: 'Mid Price', align: 'right' },
    ...DEPTH_BANDS.map(spec => ({
      key: spec.pct === null ? 'depth-full' : `depth-${spec.key}`,
      label: spec.pct === null ? 'Full Depth' : `${spec.key}% Depth`,
      align: 'right'
    }))
  ];

  const rows: RowItem[] = React.useMemo(() => {
    const result: RowItem[] = [];
    const order = ['Group 1', 'Group 2', 'Group 3', 'Group 4'];
    for (const g of order) {
      const items = entries.filter(x => x.group === g);
      if (!items.length) continue;
      result.push({ type: 'group', group: g });
      for (const entry of items) {
        result.push({ type: 'main', entry });
        if (expanded[entry.pair]) {
          result.push({ type: 'sub-asks', entry });
          result.push({ type: 'sub-bids', entry });
        }
      }
    }
    return result;
  }, [entries, expanded]);

  const getItemSize = (index: number) => {
    const item = rows[index];
    if (item.type === 'group') return 50;
    if (item.type === 'main') return 48;
    if (item.type === 'sub-asks') return 40;
    if (item.type === 'sub-bids') return 40;
    return 48;
  };

  const listRef = React.useRef<List>(null);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [rows]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = rows[index];
    if (item.type === 'group') {
      return <GroupHeader title={item.group} subtitle={getGroupSubtitle(item.group)} style={style} />;
    }
    if (item.type === 'main') {
      return (
        <RowMain
          entry={item.entry}
          formatMode={formatMode}
          expanded={!!expanded[item.entry.pair]}
          onClick={() => onToggleExpand(item.entry.pair)}
          style={style}
        />
      );
    }
    if (item.type === 'sub-asks') {
      return <RowSubAsks entry={item.entry} formatMode={formatMode} style={style} />;
    }
    if (item.type === 'sub-bids') {
      return <RowSubBids entry={item.entry} formatMode={formatMode} style={style} />;
    }
    return null;
  };

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = React.useState(600);

  React.useEffect(() => {
    const updateHeight = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const headerHeight = 50; // Approximate header row height
        const availableHeight = rect.height - headerHeight;
        setListHeight(Math.max(400, availableHeight));
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const timer = setTimeout(updateHeight, 100); // Ensure layout is settled
    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <TableHeader>
        {headerCells.map(h => (
          <HeaderCell
            key={h.key}
            className={`${h.align === 'right' ? 'right' : ''} ${sortState.column === h.key ? `sorted ${sortState.direction}` : ''}`}
            onClick={() => onSort(h.key)}
          >
            {h.label}
          </HeaderCell>
        ))}
      </TableHeader>
      <List
        ref={listRef}
        height={listHeight}
        itemCount={rows.length}
        itemSize={getItemSize}
        itemKey={(index) => {
          const r = rows[index];
          if (r.type === 'group') return `group-${r.group}`;
          if (r.type === 'main') return `main-${r.entry.pair}`;
          if (r.type === 'sub-asks') return `asks-${r.entry.pair}`;
          if (r.type === 'sub-bids') return `bids-${r.entry.pair}`;
          return index;
        }}
        width="100%"
      >
        {Row}
      </List>
    </Wrapper>
  );
}

