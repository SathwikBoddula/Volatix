'use client';
import { toast } from 'sonner';
import React, { useState, useCallback } from 'react';
import Topbar from './Topbar';
import HeroKPIGrid from './HeroKPIGrid';
import TabNavigation from './TabNavigation';
import TabContent from './TabContent';
import DashboardSkeleton from './DashboardSkeleton';
import { generateMockData, type TickerData } from '../data/mockData';

export type TabId =
  | 'overview'
  | 'moving-averages'
  | 'combined-trends'
  | 'rsi-momentum'
  | 'macd-convergence'
  | 'backtest'
  | 'forecast-grid'
  | 'ai-trajectory';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [tickerData, setTickerData] = useState<TickerData | null>(generateMockData('NVDA'));
  const [isLoading, setIsLoading] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('NVDA');

  // Backend integration point: replace this with actual API call to Twelve Data / yfinance
  const handleTickerSearch = useCallback((ticker: string) => {
    setIsLoading(true);
    setCurrentTicker(ticker);

    // Simulate LSTM model training + data ingestion latency
    setTimeout(() => {
      const result = generateMockData(ticker);
      if (!result) {
        setCurrentTicker('');
        setTickerData(null);
        setIsLoading(false);
        toast.error(`"${ticker}" not found. Try AAPL, NVDA, RELIANCE.NS etc.`);
        return;
      }
      setTickerData(result);
      setIsLoading(false);
    }, 2800);
  }, []);

  return (
    <div className="min-h-screen bg-background bg-grid-subtle">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-40" />

      <Topbar
        currentTicker={currentTicker}
        onTickerSearch={handleTickerSearch}
        isLoading={isLoading}
        tradingDays={tickerData?.history?.length}
      />

      <main className="relative z-10 px-4 lg:px-8 xl:px-10 2xl:px-16 pb-16 pt-6 max-w-screen-2xl mx-auto">
        {isLoading ? (
          <DashboardSkeleton />
        ) : tickerData ? (
          <>
            <HeroKPIGrid data={tickerData} ticker={currentTicker} />
            <div className="mt-8">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <TabContent activeTab={activeTab} data={tickerData} ticker={currentTicker} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
