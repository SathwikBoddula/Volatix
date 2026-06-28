'use client';
import { formatPrice } from '@/utils/formatCurrency';

import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Target, Minus, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { TickerData } from '../data/mockData';

interface HeroKPIGridProps {
  data: TickerData;
  ticker: string;
}

export default function HeroKPIGrid({ data, ticker }: HeroKPIGridProps) {
  const { currentPrice, prevClose, rsi, macd, ma200, backtestRMSE, dailyHigh, dailyLow, volume } = data.summary;
  const priceChange = currentPrice - prevClose;
  const priceChangePct = (priceChange / prevClose) * 100;
  const isPositive = priceChange >= 0;
  const ma200Dev = ((currentPrice - ma200) / ma200) * 100;
  const rsiState = rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral';
  const macdState = macd.histogram > 0 ? 'bullish' : 'bearish';
  const TICKER_INFO: Record<string, string> = {
    NVDA: 'NVIDIA Corporation · NASDAQ',
    AAPL: 'Apple Inc. · NASDAQ',
    TSLA: 'Tesla, Inc. · NASDAQ',
    MSFT: 'Microsoft Corporation · NASDAQ',
    AMZN: 'Amazon.com, Inc. · NASDAQ',
    META: 'Meta Platforms, Inc. · NASDAQ',
    GOOGL: 'Alphabet Inc. · NASDAQ',
    SPY: 'SPDR S&P 500 ETF · NYSE',
    QQQ: 'Invesco QQQ Trust · NASDAQ',
    AMD: 'Advanced Micro Devices · NASDAQ',
    'RELIANCE.NS': 'Reliance Industries · NSE',
    RELIANCE: 'Reliance Industries · NSE',
    'TCS.NS': 'Tata Consultancy Services · NSE',
    TCS: 'Tata Consultancy Services · NSE',
    'INFY.NS': 'Infosys Ltd. · NSE',
    INFY: 'Infosys Ltd. · NSE',
    'HDFCBANK.NS': 'HDFC Bank Ltd. · NSE',
    HDFCBANK: 'HDFC Bank Ltd. · NSE',
    'TATAMOTORS.NS': 'Tata Motors Ltd. · NSE',
    TATAMOTORS: 'Tata Motors Ltd. · NSE',
    'SBIN.NS': 'State Bank of India · NSE',
    SBIN: 'State Bank of India · NSE',
    'WIPRO.NS': 'Wipro Ltd. · NSE',
    WIPRO: 'Wipro Ltd. · NSE',
  };
  return (
    <div className="animate-fade-in-up">
      {/* Ticker Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{ticker}</h1>
            <span className={`inline-flex items-center gap-1 text-sm font-mono-data font-semibold px-2.5 py-1 rounded-md ${
              isPositive
                ? 'bg-success/10 text-positive border border-success/20' :'bg-danger/10 text-negative border border-danger/20'
            }`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {isPositive ? '+' : ''}{priceChangePct.toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{TICKER_INFO[ticker] ?? `${ticker} · NASDAQ`}</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-muted-foreground font-mono-data">Last updated</div>
          <div className="text-xs text-foreground font-mono-data">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · 16:00 EST</div>
        </div>
      </div>

      {/* KPI Bento Grid — 5 cards: hero spans 2 cols + 4 regular = 2+3 layout */}
      {/* Grid plan: grid-cols-4 → row1: hero(col-span-1 tall) + 4 cards in 2×2 */}
      {/* Actual: hero large left + 4 cards right in 2×2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">

        {/* Hero Card — Current Price (spans 2 rows on lg+) */}
        <div className={`lg:row-span-2 glass-card-cyan rounded-xl p-6 glow-cyan flex flex-col justify-between transition-all duration-300 hover:glow-cyan-strong`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Current Price</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp size={14} className="text-primary" />
              </div>
            </div>
            <div className="font-mono-data text-5xl font-bold text-foreground tracking-tight mb-1">
              {formatPrice(currentPrice, ticker)}
            </div>
            <div className={`flex items-center gap-1.5 font-mono-data text-base font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePct.toFixed(2)}%)
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-primary/10 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Day High</div>
              <div className="font-mono-data text-sm font-semibold text-foreground">{formatPrice(dailyHigh, ticker)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Day Low</div>
              <div className="font-mono-data text-sm font-semibold text-foreground">{formatPrice(dailyLow, ticker)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Prev Close</div>
              <div className="font-mono-data text-sm font-semibold text-foreground">{formatPrice(prevClose, ticker)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Volume</div>
              <div className="font-mono-data text-sm font-semibold text-foreground">{(volume / 1_000_000).toFixed(1)}M</div>
            </div>
          </div>
        </div>

        {/* RSI Card */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-300 ${
          rsiState === 'overbought' ?'glass-card-danger glow-danger hover:glow-danger'
            : rsiState === 'oversold' ?'glass-card-success glow-success' :'glass-card'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">RSI (14)</span>
            <Activity size={14} className={
              rsiState === 'overbought' ? 'text-negative' :
              rsiState === 'oversold'? 'text-positive' : 'text-muted-foreground'
            } />
          </div>
          <div className="font-mono-data text-3xl font-bold text-foreground">{rsi.toFixed(1)}</div>
          <div className="mt-3">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              rsiState === 'overbought' ?'bg-danger/20 text-negative border border-danger/30'
                : rsiState === 'oversold' ?'bg-success/20 text-positive border border-success/30' :'bg-muted text-muted-foreground border border-border'
            }`}>
              {rsiState === 'overbought' && <AlertTriangle size={10} />}
              {rsiState === 'oversold' && <CheckCircle size={10} />}
              {rsiState === 'neutral' && <Minus size={10} />}
              {rsiState === 'overbought' ? 'OVERBOUGHT — SELL' :
               rsiState === 'oversold'? 'OVERSOLD — BUY' : 'NEUTRAL'}
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rsiState === 'overbought' ? 'bg-danger' :
                  rsiState === 'oversold' ? 'bg-success' : 'bg-primary'
                }`}
                style={{ width: `${rsi}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono-data">
              <span>0</span><span>30</span><span>70</span><span>100</span>
            </div>
          </div>
        </div>

        {/* MACD Card */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-300 ${
          macdState === 'bullish' ? 'glass-card-success' : 'glass-card-danger'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">MACD Signal</span>
            <BarChart2 size={14} className={macdState === 'bullish' ? 'text-positive' : 'text-negative'} />
          </div>
          <div className={`font-mono-data text-3xl font-bold ${macdState === 'bullish' ? 'text-positive' : 'text-negative'}`}>
            {macd.histogram > 0 ? '+' : ''}{macd.histogram.toFixed(3)}
          </div>
          <div className="mt-3">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              macdState === 'bullish' ?'bg-success/20 text-positive border border-success/30' :'bg-danger/20 text-negative border border-danger/30'
            }`}>
              {macdState === 'bullish' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {macdState === 'bullish' ? 'BULLISH CROSSOVER' : 'BEARISH CROSSOVER'}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">MACD: </span>
                <span className="font-mono-data text-foreground">{macd.value.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Signal: </span>
                <span className="font-mono-data text-foreground">{macd.signal.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MA200 Deviation Card */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-300 ${
          Math.abs(ma200Dev) > 15 ? 'glass-card-warning' : 'glass-card'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">MA200 Deviation</span>
            <Target size={14} className={Math.abs(ma200Dev) > 15 ? 'text-warning-amber' : 'text-muted-foreground'} />
          </div>
          <div className={`font-mono-data text-3xl font-bold ${
            ma200Dev > 0 ? 'text-positive' : 'text-negative'
          }`}>
            {ma200Dev > 0 ? '+' : ''}{ma200Dev.toFixed(1)}%
          </div>
          <div className="mt-3">
            <div className="text-xs text-muted-foreground">
              MA200: <span className="font-mono-data text-foreground">{formatPrice(ma200, ticker)}</span>
            </div>
            {Math.abs(ma200Dev) > 15 && (
              <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-warning-amber border border-warning/30 bg-warning/10 px-2 py-0.5 rounded-full">
                <AlertTriangle size={10} />
                Extended from mean
              </div>
            )}
          </div>
        </div>

        {/* Backtest RMSE Card */}
        <div className="glass-card rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Backtest RMSE</span>
            <CheckCircle size={14} className="text-primary" />
          </div>
          <div className="font-mono-data text-3xl font-bold text-foreground">{backtestRMSE.toFixed(3)}</div>
          <div className="mt-3">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              backtestRMSE < 0.02
                ? 'bg-success/20 text-positive border border-success/30'
                : backtestRMSE < 0.05
                  ? 'bg-primary/10 text-primary border border-primary/20' :'bg-warning/10 text-warning-amber border border-warning/30'
            }`}>
              {backtestRMSE < 0.02 ? 'HIGH CONFIDENCE' : backtestRMSE < 0.05 ? 'GOOD FIT' : 'MODERATE'}
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">
              Avg Error: <span className="font-mono-data text-foreground">±{(backtestRMSE * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}