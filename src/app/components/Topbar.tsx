'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Activity, ChevronDown, Clock, TrendingUp, Loader2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface TopbarProps {
  currentTicker: string;
  onTickerSearch: (ticker: string) => void;
  isLoading: boolean;
}

const POPULAR_TICKERS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', change: '+3.42%', positive: true },
  { symbol: 'AAPL', name: 'Apple Inc.', change: '+0.87%', positive: true },
  { symbol: 'TSLA', name: 'Tesla, Inc.', change: '-1.23%', positive: false },
  { symbol: 'MSFT', name: 'Microsoft Corporation', change: '+1.56%', positive: true },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', change: '+2.11%', positive: true },
  { symbol: 'META', name: 'Meta Platforms, Inc.', change: '-0.44%', positive: false },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', change: '+0.93%', positive: true },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', change: '+0.62%', positive: true },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', change: '+1.18%', positive: true },
  { symbol: 'AMD', name: 'Advanced Micro Devices', change: '+4.77%', positive: true },
];

export default function Topbar({ currentTicker, onTickerSearch, isLoading }: TopbarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTickers = searchValue.length > 0
    ? POPULAR_TICKERS.filter(
        t =>
          t.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
          t.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : POPULAR_TICKERS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchValue.trim().toUpperCase();
    if (val) {
      onTickerSearch(val);
      setShowDropdown(false);
      setSearchValue('');
      inputRef.current?.blur();
    }
  };

  const handleSelectTicker = (symbol: string) => {
    onTickerSearch(symbol);
    setShowDropdown(false);
    setSearchValue('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border" style={{ background: 'rgba(10, 10, 12, 0.92)', backdropFilter: 'blur(20px)' }}>
      <div className="px-4 lg:px-8 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AppLogo size={32} />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-foreground">Volatix</span>
              <span className="text-xs font-mono-data px-1.5 py-0.5 rounded text-primary border border-primary/30 bg-primary/5 leading-none">PRO</span>
            </div>
          </div>

          {/* Ticker Search */}
          <div className="flex-1 max-w-xl relative" ref={dropdownRef}>
            <form onSubmit={handleSubmit}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                isFocused
                  ? 'border-primary/50 bg-card glow-cyan' :'border-border bg-muted/50 hover:border-border/80'
              }`}>
                {isLoading ? (
                  <Loader2 size={16} className="text-primary animate-spin flex-shrink-0" />
                ) : (
                  <Search size={16} className="text-muted-foreground flex-shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onFocus={() => { setIsFocused(true); setShowDropdown(true); }}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search ticker — NVDA, AAPL, TSLA..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none font-mono-data"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ×
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono-data">
                  ↵
                </kbd>
              </div>
            </form>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg border border-border overflow-hidden z-50 shadow-2xl">
                <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                    {searchValue ? 'Results' : 'Popular Tickers'}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredTickers.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No tickers found for &quot;{searchValue}&quot;
                    </div>
                  ) : (
                    filteredTickers.map(ticker => (
                      <button
                        key={`ticker-${ticker.symbol}`}
                        type="button"
                        onClick={() => handleSelectTicker(ticker.symbol)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <TrendingUp size={12} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground font-mono-data">{ticker.symbol}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">{ticker.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-mono-data font-semibold ${ticker.positive ? 'text-positive' : 'text-negative'}`}>
                          {ticker.change}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1.5 bg-muted/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
              <span className="font-mono-data">LIVE</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity size={12} />
              <span className="font-mono-data">NYSE</span>
              <ChevronDown size={10} />
            </div>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 hover:border-primary/50 transition-all duration-150 active:scale-95">
              <Zap size={14} />
              <span className="hidden sm:block">Analyze</span>
            </button>
          </div>
        </div>

        {/* Active Ticker Bar */}
        <div className="flex items-center gap-2 pb-2 -mt-1">
          <span className="text-xs text-muted-foreground">Active:</span>
          <span className="text-xs font-mono-data font-semibold text-primary">{currentTicker}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Data coverage: 1,247 trading days</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">LSTM model: trained on 70/30 split</span>
          {isLoading && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-warning-amber animate-pulse">Processing LSTM model...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}