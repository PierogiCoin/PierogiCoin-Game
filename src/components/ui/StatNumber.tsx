// src/components/ui/StatNumber.tsx
'use client';
import React from 'react';
import CountUp from 'react-countup';

export default function StatNumber({ value, prefix='', suffix='', duration=1.2, decimals=0, separator=',' }:{
  value: number; prefix?: string; suffix?: string; duration?: number; decimals?: number; separator?: string;
}) {
  return <CountUp end={value || 0} duration={duration} decimals={decimals} prefix={prefix} suffix={suffix} separator={separator} />;
}
