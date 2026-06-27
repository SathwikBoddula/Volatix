'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import type { TickerData } from '../../data/mockData';

interface Props { data: TickerData; ticker: string; }

const CustomTooltip = ({ active, payload, label, ticker }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; ticker?: string }) => {
  if (!active || !payload?.length) return null;
  const actual = payload.find(p => p.name === 'Actual')?.value;
  const predicted = payload.find(p => p.name === 'Predicted')?.value;
  const diff = actual && predicted ? Math.abs(actual - predicted) : 0;
  const diffPct = actual ? (diff / actual * 100).toFixed(2) : '0.00';
  return (
    <div className="glass-card rounded-lg p-3 border border-border shadow-2xl min-w-[200px]">
      <p className="text-xs font-mono-data text-muted-foreground mb-2">{label}</p>
      {payload.map(p => (
        <div key={`tt-bt-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground">{p.name}</span>
          </div>
          <span className="text-xs font-mono-data font-semibold text-foreground">{formatPrice(p.value, ticker || '')}</span>
        </div>
      ))}
      {actual && predicted && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Error</span>
            <span className="font-mono-data text-warning-amber">{formatPrice(diff, ticker || '')} ({diffPct}%)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function BacktestChart({ data, ticker }: Props) {
  const { backtestRMSE } = data.summary;
  const chartData = data.backtest;

  const errors = chartData.map(d => Math.abs(d.actual - d.predicted) / d.actual * 100);
  const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
  const maxError = Math.max(...errors);
  const r2 = Math.max(0, 1 - backtestRMSE * 8);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} LSTM Model Backtest</h2>
          <p className="text-sm text-muted-foreground">Actual vs. predicted on 30% holdout validation set · {chartData.length} sessions</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono-data font-semibold ${
          backtestRMSE < 0.02
            ? 'bg-success/10 border-success/20 text-positive' :'bg-primary/10 border-primary/20 text-primary'
        }`}>
          RMSE: {backtestRMSE.toFixed(4)} · R²: {r2.toFixed(4)}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-border">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <filter id="glowEffect">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => formatPrice(v, ticker)}
              width={70}
            />
            <Tooltip content={<CustomTooltip ticker={ticker} />} />
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="var(--foreground)"
              strokeWidth={2}
              dot={false}
              opacity={0.8}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="0"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Backtest Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {[
          { label: 'RMSE', value: backtestRMSE.toFixed(4), sub: 'Root Mean Squared Error', good: backtestRMSE < 0.02 },
          { label: 'R² Score', value: r2.toFixed(4), sub: 'Coefficient of determination', good: r2 > 0.85 },
          { label: 'Mean % Error', value: `${meanError.toFixed(2)}%`, sub: 'Average prediction deviation', good: meanError < 2 },
          { label: 'Max % Error', value: `${maxError.toFixed(2)}%`, sub: 'Worst single-day deviation', good: maxError < 5 },
        ].map(item => (
          <div key={`btmetric-${item.label}`} className={`rounded-xl p-4 border ${item.good ? 'glass-card-success border-success/20' : 'glass-card-warning border-warning/20'}`}>
            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
            <div className={`font-mono-data text-2xl font-bold ${item.good ? 'text-positive' : 'text-warning-amber'}`}>{item.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}