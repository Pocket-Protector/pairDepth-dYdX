"use client";
import React from 'react';
import styled from 'styled-components';
import { DEPTH_BANDS } from '../../lib/config';
import { formatUsd } from '../../lib/depth';
import type { MarketEntry, FormatMode } from '../../lib/types';

const Row = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(3, 1fr) repeat(12, 1fr);
  background: #0c0f14;
  border-bottom: 1px solid #1a1e27;
`;

const Cell = styled.div`
  padding: 8px 14px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
`;

const LabelCell = styled(Cell)`
  text-align: left;
  color: #8b949e;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding-left: 40px;
`;

const ValueCell = styled(Cell)<{ type: 'ask' | 'bid' }>`
  font-weight: 600;
  color: ${p => p.type === 'ask' ? '#7ee787' : '#ff9b9b'};
`;

type Props = {
  entry: MarketEntry;
  formatMode: FormatMode;
  style?: React.CSSProperties;
};

export default function RowSub({ entry, formatMode, style }: Props) {
  return (
    <>
      <Row style={style}>
        <LabelCell>Asks</LabelCell>
        <Cell />
        <Cell />
        <Cell />
        {DEPTH_BANDS.map(spec => (
          <ValueCell key={spec.key} type="ask">
            {formatUsd((entry.bandTotals[spec.key] || {}).ask || 0, formatMode)}
          </ValueCell>
        ))}
      </Row>
      <Row style={style}>
        <LabelCell>Bids</LabelCell>
        <Cell />
        <Cell />
        <Cell />
        {DEPTH_BANDS.map(spec => (
          <ValueCell key={spec.key} type="bid">
            {formatUsd((entry.bandTotals[spec.key] || {}).bid || 0, formatMode)}
          </ValueCell>
        ))}
      </Row>
    </>
  );
}

