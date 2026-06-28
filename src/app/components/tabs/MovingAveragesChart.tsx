'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TickerData } from '../../data/mockData';

interface Props {
  data: TickerData;
  ticker: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  ticker,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  ticker?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 border border-border shadow-2xl min-w-[180px]">
      <p className="text-xs font-mono-data text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tt-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground">{p.name}</span>
          </div>
          <span className="text-xs font-mono-data font-semibold text-foreground">
            {formatPrice(p.value, ticker || '')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MovingAveragesChart({ data, ticker }: Props) {
  const [visibleMA, setVisibleMA] = useState({
    ma100: true,
    ma200: true,
    ma250: true,
    close: true,
  });
  const chartData = data.history.slice(-250).reverse();

  const toggleMA = (key: keyof typeof visibleMA) => {
    setVisibleMA((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const maConfigs = [
    { key: 'close' as const, label: 'Close Price', color: 'var(--foreground)', dotted: false },
    { key: 'ma100' as const, label: 'MA 100', color: 'var(--primary)', dotted: false },
    { key: 'ma200' as const, label: 'MA 200', color: 'var(--accent)', dotted: false },
    { key: 'ma250' as const, label: 'MA 250', color: 'var(--warning)', dotted: true },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} Moving Averages</h2>
          <p className="text-sm text-muted-foreground">
            100-day, 200-day, and 250-day rolling averages
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {maConfigs.map((cfg) => (
            <button
              key={`toggle-${cfg.key}`}
              onClick={() => toggleMA(cfg.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                visibleMA[cfg.key]
                  ? 'border-border/50 text-foreground bg-muted/50'
                  : 'border-border/30 text-muted-foreground bg-transparent opacity-50'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-border">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="maGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatPrice(v, ticker)}
              width={70}
            />
            <Tooltip content={<CustomTooltip ticker={ticker} />} />
            {visibleMA.close && (
              <Line
                type="monotone"
                dataKey="close"
                name="Close Price"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                dot={false}
                opacity={0.6}
              />
            )}
            {visibleMA.ma100 && (
              <Line
                type="monotone"
                dataKey="ma100"
                name="MA 100"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleMA.ma200 && (
              <Line
                type="monotone"
                dataKey="ma200"
                name="MA 200"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
            )}
            {visibleMA.ma250 && (
              <Line
                type="monotone"
                dataKey="ma250"
                name="MA 250"
                stroke="var(--warning)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Individual MA Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {[
          {
            label: 'MA 100',
            value: data.summary.ma100,
            period: '100-day',
            color: 'var(--primary)',
            borderClass: 'border-primary/20',
          },
          {
            label: 'MA 200',
            value: data.summary.ma200,
            period: '200-day',
            color: 'var(--accent)',
            borderClass: 'border-accent/20',
          },
          {
            label: 'MA 250',
            value: data.summary.ma250,
            period: '250-day',
            color: 'var(--warning)',
            borderClass: 'border-warning/20',
          },
        ].map((item) => {
          const dev = ((data.summary.currentPrice - item.value) / item.value) * 100;
          return (
            <div
              key={`macard-${item.label}`}
              className={`glass-card rounded-xl p-4 border ${item.borderClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {item.label}
                </span>
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              </div>
              <div className="font-mono-data text-2xl font-bold text-foreground">
                {formatPrice(item.value, ticker)}
              </div>
              <div
                className={`text-xs font-mono-data mt-1 ${dev >= 0 ? 'text-positive' : 'text-negative'}`}
              >
                Price is {dev >= 0 ? '+' : ''}
                {dev.toFixed(2)}% {dev >= 0 ? 'above' : 'below'} {item.period} avg
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
