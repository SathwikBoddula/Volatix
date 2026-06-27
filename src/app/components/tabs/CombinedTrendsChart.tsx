'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { TickerData } from '../../data/mockData';

interface Props { data: TickerData; ticker: string; }

const CustomTooltip = ({ active, payload, label, ticker }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; ticker?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 border border-border shadow-2xl min-w-[200px]">
      <p className="text-xs font-mono-data text-muted-foreground mb-2">{label}</p>
      {payload.map(p => (
        <div key={`tt-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground">{p.name}</span>
          </div>
          <span className="text-xs font-mono-data font-semibold text-foreground">{formatPrice(p.value, ticker || '')}</span>
        </div>
      ))}
    </div>
  );
};

export default function CombinedTrendsChart({ data, ticker }: Props) {
  const chartData = data.history.slice(-200).reverse();

  // Find crossover points
  const crossovers = chartData.reduce<Array<{ date: string; type: 'golden' | 'death' }>>((acc, row, i) => {
    if (i === 0) return acc;
    const prev = chartData[i - 1];
    if (prev.ma100 < prev.ma200 && row.ma100 >= row.ma200) {
      acc.push({ date: row.date, type: 'golden' });
    } else if (prev.ma100 > prev.ma200 && row.ma100 <= row.ma200) {
      acc.push({ date: row.date, type: 'death' });
    }
    return acc;
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} Combined MA Trends</h2>
          <p className="text-sm text-muted-foreground">MA 100 vs MA 200 crossover analysis · 200-day window</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Golden Cross (Bullish)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-muted-foreground">Death Cross (Bearish)</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-border">
        <ResponsiveContainer width="100%" height={440}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
              </linearGradient>
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
            <Area type="monotone" dataKey="close" name="Close Price" fill="url(#closeGrad)" stroke="var(--foreground)" strokeWidth={1} opacity={0.7} dot={false} />
            <Line type="monotone" dataKey="ma100" name="MA 100" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="ma200" name="MA 200" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Crossover Events */}
      {crossovers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Recent Crossover Events</h3>
          <div className="flex flex-wrap gap-2">
            {crossovers.slice(-6).map(c => (
              <div key={`cross-${c.date}-${c.type}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono-data ${
                c.type === 'golden' ?'bg-success/10 border-success/20 text-positive' :'bg-danger/10 border-danger/20 text-negative'
              }`}>
                <span>{c.type === 'golden' ? '↑ Golden Cross' : '↓ Death Cross'}</span>
                <span className="text-muted-foreground">{c.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MA Spread */}
      <div className="mt-4 glass-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">MA 100 / MA 200 Spread Analysis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Current Spread', value: formatPrice(data.summary.ma100 - data.summary.ma200, ticker), positive: data.summary.ma100 > data.summary.ma200 },
            { label: 'Spread %', value: `${(((data.summary.ma100 - data.summary.ma200) / data.summary.ma200) * 100).toFixed(2)}%`, positive: data.summary.ma100 > data.summary.ma200 },
           { label: 'MA 100', value: formatPrice(data.summary.ma100, ticker), positive: true },
           { label: 'MA 200', value: formatPrice(data.summary.ma200, ticker), positive: true },
          ].map(item => (
            <div key={`spread-${item.label}`}>
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className={`font-mono-data text-sm font-semibold ${item.label.includes('Spread') ? (item.positive ? 'text-positive' : 'text-negative') : 'text-foreground'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}