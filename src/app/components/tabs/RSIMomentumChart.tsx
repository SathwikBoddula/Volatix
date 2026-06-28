'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
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
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  ticker?: string;
}) => {
  if (!active || !payload?.length) return null;
  const rsiEntry = payload.find((p) => p.dataKey === 'rsi');
  const rsiVal = rsiEntry?.value ?? 0;
  const state = rsiVal > 70 ? 'OVERBOUGHT' : rsiVal < 30 ? 'OVERSOLD' : 'NEUTRAL';
  const stateColor =
    rsiVal > 70 ? 'var(--danger)' : rsiVal < 30 ? 'var(--success)' : 'var(--muted-foreground)';
  return (
    <div className="glass-card rounded-lg p-3 border border-border shadow-2xl min-w-[180px]">
      <p className="text-xs font-mono-data text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tt-rsi-${p.dataKey}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground">{p.name}</span>
          </div>
          <span className="text-xs font-mono-data font-semibold text-foreground">
            {p.dataKey === 'rsi' ? p.value.toFixed(1) : formatPrice(p.value, ticker || '')}
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-border">
        <span className="text-xs font-mono-data font-bold" style={{ color: stateColor }}>
          {state}
        </span>
      </div>
    </div>
  );
};

export default function RSIMomentumChart({ data, ticker }: Props) {
  const chartData = data.history.slice(-180).reverse();
  const overboughtCount = chartData.filter((d) => d.rsi > 70).length;
  const oversoldCount = chartData.filter((d) => d.rsi < 30).length;
  const neutralCount = chartData.length - overboughtCount - oversoldCount;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} RSI Momentum</h2>
          <p className="text-sm text-muted-foreground">
            14-period Relative Strength Index · overbought/oversold zones
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full bg-danger" />
            <span className="text-muted-foreground">Overbought &gt;70</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full bg-success" />
            <span className="text-muted-foreground">Oversold &lt;30</span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="glass-card rounded-xl p-4 border border-border mb-4">
        <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
          Price Context
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradRSI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="date" hide />
            <YAxis
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatPrice(v, ticker)}
              width={60}
            />
            <Area
              type="monotone"
              dataKey="close"
              name="Close"
              fill="url(#priceGradRSI)"
              stroke="var(--primary)"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      <div className="glass-card rounded-xl p-4 border border-border">
        <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
          RSI (14)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="rsiOBGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rsiOSGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
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
              domain={[0, 100]}
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 30, 50, 70, 100]}
              width={40}
            />
            <Tooltip content={<CustomTooltip ticker={ticker} />} />
            <ReferenceArea y1={70} y2={100} fill="var(--danger)" fillOpacity={0.06} />
            <ReferenceArea y1={0} y2={30} fill="var(--success)" fillOpacity={0.06} />
            <ReferenceLine
              y={70}
              stroke="var(--danger)"
              strokeDasharray="4 2"
              strokeWidth={1}
              label={{
                value: 'OB 70',
                position: 'insideTopRight',
                fill: 'var(--danger)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <ReferenceLine
              y={30}
              stroke="var(--success)"
              strokeDasharray="4 2"
              strokeWidth={1}
              label={{
                value: 'OS 30',
                position: 'insideBottomRight',
                fill: 'var(--success)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <ReferenceLine y={50} stroke="var(--border)" strokeDasharray="2 4" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="rsi"
              name="RSI(14)"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Distribution */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          {
            label: 'Overbought Sessions',
            count: overboughtCount,
            pct: ((overboughtCount / chartData.length) * 100).toFixed(1),
            colorClass: 'text-negative',
            bgClass: 'bg-danger/10 border-danger/20',
          },
          {
            label: 'Neutral Sessions',
            count: neutralCount,
            pct: ((neutralCount / chartData.length) * 100).toFixed(1),
            colorClass: 'text-muted-foreground',
            bgClass: 'bg-muted/50 border-border',
          },
          {
            label: 'Oversold Sessions',
            count: oversoldCount,
            pct: ((oversoldCount / chartData.length) * 100).toFixed(1),
            colorClass: 'text-positive',
            bgClass: 'bg-success/10 border-success/20',
          },
        ].map((item) => (
          <div key={`rsidist-${item.label}`} className={`rounded-xl p-4 border ${item.bgClass}`}>
            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
            <div className={`font-mono-data text-2xl font-bold ${item.colorClass}`}>
              {item.count}
            </div>
            <div className="text-xs font-mono-data text-muted-foreground">
              {item.pct}% of window
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
