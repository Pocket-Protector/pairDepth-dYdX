"use client";
import React from 'react';
import styled from 'styled-components';

const Row = styled.div`
  background: #0b0e13;
  border-bottom: 1px solid #222836;
  color: #a6aeb9;
  font-weight: 600;
  font-size: 13px;
  padding: 16px 14px 12px;
`;

const Subtitle = styled.span`
  color: #8b949e;
  font-weight: 400;
  font-size: 12px;
  margin-left: 8px;
`;

type Props = {
  title: string;
  subtitle: string;
  style?: React.CSSProperties;
};

export default function GroupHeader({ title, subtitle, style }: Props) {
  return (
    <Row style={style}>
      {title} <Subtitle>{subtitle}</Subtitle>
    </Row>
  );
}

