'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import type { TickerData } from '../../data/mockData';

interface Props { data: TickerData; ticker: string; }

export default function ForecastGrid({ data, ticker }: Props) {
  const { forecast } = data;
  const { currentPrice } = data.summary;

  const maxGain = Math.max(...forecast.map(f => ((f.predicted - currentPrice) / currentPrice) * 100));
  const finalDay = forecast[forecast.length - 1];
  const totalReturn = ((finalDay.predicted - currentPrice) / currentPrice) * 100;
  const isPositiveOutlook = totalReturn > 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} 7-Day LSTM Forecast</h2>
          <p className="text-sm text-muted-foreground">Predicted closing prices for next 7 business days · 100-day lookback window</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono-data font-semibold ${
          isPositiveOutlook
            ? 'bg-success/10 border-success/20 text-positive' :'bg-danger/10 border-danger/20 text-negative'
        }`}>
          {isPositiveOutlook ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          7-Day Outlook: {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </div>
      </div>

      {/* Summary Banner */}
      <div className={`rounded-xl p-4 mb-5 border flex items-center justify-between ${
        isPositiveOutlook ? 'glass-card-success border-success/20' : 'glass-card-danger border-danger/20'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPositiveOutlook ? 'bg-success/20' : 'bg-danger/20'}`}>
            {isPositiveOutlook ? <TrendingUp size={18} className="text-positive" /> : <TrendingDown size={18} className="text-negative" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              AI Trajectory: {isPositiveOutlook ? 'Bullish' : 'Bearish'} over 7-day horizon
            </p>
            <p className="text-xs text-muted-foreground">
              From {formatPrice(currentPrice, ticker)} → {formatPrice(finalDay.predicted, ticker)} · Peak at {formatPrice(currentPrice * (1 + maxGain / 100), ticker)}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="font-mono-data text-lg font-bold text-foreground">{finalDay.confidence.toFixed(1)}%</div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="glass-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Day</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Predicted Close</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Δ from Today</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Δ from Prev</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Range (Low–High)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Confidence</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Signal</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((row, idx) => {
              const deltaFromToday = ((row.predicted - currentPrice) / currentPrice) * 100;
              const prevPrice = idx === 0 ? currentPrice : forecast[idx - 1].predicted;
              const deltaFromPrev = ((row.predicted - prevPrice) / prevPrice) * 100;
              const isUp = deltaFromToday >= 0;
              const isPrevUp = deltaFromPrev >= 0;
              const signal = row.confidence > 75
                ? (isUp ? 'Strong Buy' : 'Strong Sell')
                : (isUp ? 'Buy' : 'Sell');
              const signalColor = signal.includes('Buy') ? 'text-positive bg-success/10 border-success/20' : 'text-negative bg-danger/10 border-danger/20';

              return (
                <tr key={`forecast-row-${row.date}`} className="border-b border-border/50 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-mono-data font-bold text-primary">
                        {idx + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono-data text-xs text-foreground">
                      <Calendar size={12} className="text-muted-foreground" />
                      {row.date}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-sm font-bold text-foreground">{formatPrice(row.predicted, ticker)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-data text-xs font-semibold ${isUp ? 'text-positive' : 'text-negative'}`}>
                      {isUp ? '+' : ''}{deltaFromToday.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-data text-xs ${isPrevUp ? 'text-positive' : 'text-negative'}`}>
                      {isPrevUp ? '+' : ''}{deltaFromPrev.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-xs text-muted-foreground">
                      {formatPrice(row.low, ticker)} – {formatPrice(row.high, ticker)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.confidence > 75 ? 'bg-success' : row.confidence > 60 ? 'bg-primary' : 'bg-warning'}`}
                          style={{ width: `${row.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono-data text-xs text-foreground">{row.confidence.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border font-mono-data ${signalColor}`}>
                      {signal}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-lg border border-warning/20 bg-warning/5">
        <AlertTriangle size={14} className="text-warning-amber flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          LSTM predictions are generated from historical price patterns and are not financial advice. Model accuracy degrades beyond 3–5 days. Always validate against fundamental analysis before executing trades.
        </p>
      </div>
    </div>
  );
}