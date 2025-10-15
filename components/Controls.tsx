"use client";
import React from 'react';
import styled from 'styled-components';
import type { FormatMode } from '../lib/types';

const Wrapper = styled.div`
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const LeftControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  background: #1e222b;
  color: #e6edf3;
  border: 1px solid #2a2f3b;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: #252a36; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Select = styled.select`
  background: #0f1115;
  color: #e6edf3;
  border: 1px solid #2a2f3b;
  padding: 8px 10px;
  border-radius: 8px;
`;

const ProgressWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
`;

const Progress = styled.div`
  width: 200px;
  height: 8px;
  background: #1a1f2a;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #273040;
`;

const ProgressInner = styled.span<{ width: number }>`
  display: block;
  height: 100%;
  width: ${p => p.width}%;
  background: linear-gradient(90deg, #2a7cff, #7d9cff);
  transition: width 0.2s ease;
`;

const ProgressText = styled.div`
  color: #8b949e;
  font-size: 12px;
`;

type Props = {
  loading: boolean;
  progress: number;
  formatMode: FormatMode;
  onRefresh: () => void;
  onFormatChange: (mode: FormatMode) => void;
};

export default function Controls({ loading, progress, formatMode, onRefresh, onFormatChange }: Props) {
  return (
    <Wrapper>
      <LeftControls>
        <Button onClick={onRefresh} disabled={loading}>Refresh</Button>
        <label>
          Number format:{' '}
          <Select value={formatMode} onChange={e => onFormatChange(e.target.value as FormatMode)}>
            <option value="full">Full</option>
            <option value="compact">K / M / B</option>
          </Select>
        </label>
      </LeftControls>
      <ProgressWrap>
        <Progress>
          <ProgressInner width={progress} />
        </Progress>
        <ProgressText>{loading ? `Loading ${progress}%...` : 'Idle'}</ProgressText>
      </ProgressWrap>
    </Wrapper>
  );
}

