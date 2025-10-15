"use client";
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin: 8px 0 4px;
`;

const Item = styled.div`
  background: #10131a;
  border: 1px solid #2a2f3b;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
`;

type Props = {
  totalMarkets: number;
};

export default function SummaryBar({ totalMarkets }: Props) {
  return (
    <Wrapper>
      <Item>Total markets: {totalMarkets}</Item>
    </Wrapper>
  );
}

