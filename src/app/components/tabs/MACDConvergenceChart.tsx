'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
  ticker?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 border border-border shadow-2xl min-w-[200px]">
      <p className="text-xs font-mono-data text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => {
        const isPrice = p.dataKey === 'close';
        const color = isPrice
          ? 'var(--foreground)'
          : p.dataKey === 'macdLine'
            ? 'var(--primary)'
            : p.dataKey === 'macdSignal'
              ? 'var(--accent)'
              : p.value >= 0
                ? 'var(--success)'
                : 'var(--danger)';
        return (
          <div
            key={`tt-macd-${p.dataKey}`}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-muted-foreground">{p.name}</span>
            </div>
            <span className="text-xs font-mono-data font-semibold text-foreground">
              {isPrice ? formatPrice(p.value, ticker || '') : p.value.toFixed(4)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function MACDConvergenceChart({ data, ticker }: Props) {
  const chartData = data.history.slice(-160).reverse();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} MACD Trend Convergence</h2>
          <p className="text-sm text-muted-foreground">
            12/26 EMA crossover · Signal line · Histogram divergence
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">MACD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-accent rounded" />
            <span className="text-muted-foreground">Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-success" />
            <div className="w-3 h-3 rounded-sm bg-danger" />
            <span className="text-muted-foreground">Histogram</span>
          </div>
        </div>
      </div>

      {/* Pane 1: Price */}
      <div className="glass-card rounded-xl p-4 border border-border mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Asset Price
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="macdPriceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
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
              width={65}
            />
            <Tooltip content={<CustomTooltip ticker={ticker} />} />
            <Area
              type="monotone"
              dataKey="close"
              name="Close"
              fill="url(#macdPriceGrad)"
              stroke="var(--primary)"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Pane 2: MACD + Histogram */}
      <div className="glass-card rounded-xl p-4 border border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          MACD Oscillator
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
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
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toFixed(2)}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="macdHistogram" name="Histogram" maxBarSize={4}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`hist-cell-${entry.date}-${index}`}
                  fill={entry.macdHistogram >= 0 ? 'var(--success)' : 'var(--danger)'}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="macdLine"
              name="MACD"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="macdSignal"
              name="Signal"
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {[
          {
            label: 'MACD Line',
            value: data.summary.macd.value.toFixed(4),
            colorClass: 'text-primary',
          },
          {
            label: 'Signal Line',
            value: data.summary.macd.signal.toFixed(4),
            colorClass: 'text-accent',
          },
          {
            label: 'Histogram',
            value:
              (data.summary.macd.histogram >= 0 ? '+' : '') +
              data.summary.macd.histogram.toFixed(4),
            colorClass: data.summary.macd.histogram >= 0 ? 'text-positive' : 'text-negative',
          },
          {
            label: 'Trend State',
            value: data.summary.macd.histogram >= 0 ? 'BULLISH' : 'BEARISH',
            colorClass: data.summary.macd.histogram >= 0 ? 'text-positive' : 'text-negative',
          },
        ].map((item) => (
          <div
            key={`macdstat-${item.label}`}
            className="glass-card rounded-xl p-4 border border-border"
          >
            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
            <div className={`font-mono-data text-lg font-bold ${item.colorClass}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
