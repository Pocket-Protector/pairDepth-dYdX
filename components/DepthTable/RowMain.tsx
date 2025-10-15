"use client";
import React from 'react';
import styled from 'styled-components';
import { DEPTH_BANDS } from '../../lib/config';
import { formatUsd, formatUsdMid, makeDepthTooltip } from '../../lib/depth';
import Tooltip from '../Tooltip';
import type { MarketEntry, FormatMode } from '../../lib/types';

const Row = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(3, minmax(100px, 1fr)) repeat(12, minmax(80px, 1fr));
  background: #10131a;
  cursor: pointer;
  font-size: 15px;
  border-bottom: 1px solid #1a1e27;
  overflow: hidden;
  &:hover { background: #131824; }
`;

const Cell = styled.div`
  padding: 12px 14px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.right { text-align: right; font-variant-numeric: tabular-nums; }
`;

const PairCell = styled(Cell)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Caret = styled.span<{ expanded: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-right: 2px solid #778090;
  border-bottom: 2px solid #778090;
  transform: ${p => p.expanded ? 'rotate(45deg)' : 'rotate(-45deg)'};
  transition: transform 0.15s ease;
  margin-right: 8px;
`;

type Props = {
  entry: MarketEntry;
  formatMode: FormatMode;
  expanded: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
};

export default function RowMain({ entry, formatMode, expanded, onClick, style }: Props) {
  const truncateTicker = (ticker: string) => {
    return ticker.length > 15 ? ticker.slice(0, 15) : ticker;
  };

  const [tip, setTip] = React.useState<{ content: string | null; rect: DOMRect | null }>({ content: null, rect: null });
  const hideTip = () => setTip({ content: null, rect: null });

  if (entry.error) {
    return (
      <Row style={style} onClick={onClick}>
        <PairCell><Caret expanded={expanded} /><strong title={entry.pair}>{truncateTicker(entry.pair)}</strong></PairCell>
        <Cell style={{ gridColumn: 'span 15', color: '#8b949e' }}>{entry.error}</Cell>
      </Row>
    );
  }

  return (
    <Row style={style} onClick={onClick}>
      <PairCell><Caret expanded={expanded} /><strong title={entry.pair}>{truncateTicker(entry.pair)}</strong></PairCell>
      <Cell className="right">{formatUsd(entry.volume24h, formatMode)}</Cell>
      <Cell className="right">{formatUsd(entry.oiUsd, formatMode)}</Cell>
      <Cell className="right">{formatUsdMid(entry.mid)}</Cell>
      {DEPTH_BANDS.map(spec => (
        <Cell 
          key={spec.key} 
          className="right"
          onMouseEnter={(e) => {
            if (spec.pct === null) return;
            const content = makeDepthTooltip(entry.pair, entry.mid, spec.pct, entry.bandTotals, spec.key);
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setTip({ content, rect });
          }}
          onMouseLeave={hideTip}
        >
          {formatUsd(entry.totals[spec.key] || 0, formatMode)}
        </Cell>
      ))}
      <Tooltip content={tip.content} anchorRect={tip.rect} />
    </Row>
  );
}

