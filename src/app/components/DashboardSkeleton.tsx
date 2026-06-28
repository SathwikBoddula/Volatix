import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="animate-fade-in-up">
      {/* Ticker Header Skeleton */}
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton-dark h-9 w-24 rounded-lg" />
        <div className="skeleton-dark h-7 w-16 rounded-md" />
      </div>
      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-8">
        <div className="lg:row-span-2 skeleton-dark rounded-xl h-64" />
        <div className="skeleton-dark rounded-xl h-32" />
        <div className="skeleton-dark rounded-xl h-32" />
        <div className="skeleton-dark rounded-xl h-32" />
        <div className="skeleton-dark rounded-xl h-32" />
      </div>
      {/* Tab Bar Skeleton */}
      <div className="flex gap-2 border-b border-border pb-3 mb-6 overflow-hidden">
        {Array.from({ length: 8 })?.map((_, i) => (
          <div
            key={`tab-skel-${i + 1}`}
            className="skeleton-dark h-9 rounded-md"
            style={{ width: `${80 + i * 8}px` }}
          />
        ))}
      </div>
      {/* Processing Status */}
      <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
          <div
            className="w-2 h-2 rounded-full bg-accent animate-glow-pulse"
            style={{ animationDelay: '0.3s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-glow-pulse"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground mb-1">
            Ingesting market data & training LSTM model
          </p>
          <p className="text-xs text-muted-foreground">
            Fetching historical trading data · Computing RSI/MACD indicators · Running 100-day
            lookback window
          </p>
        </div>
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full skeleton-dark" />
        </div>
        <div className="grid grid-cols-3 gap-6 mt-2 text-center">
          {[
            { label: 'Data Ingestion', status: 'Complete' },
            { label: 'Indicator Engine', status: 'Complete' },
            { label: 'LSTM Training', status: 'Running...' },
          ]?.map((item) => (
            <div key={`status-${item?.label}`}>
              <div className="text-xs text-muted-foreground">{item?.label}</div>
              <div
                className={`text-xs font-mono-data font-semibold mt-0.5 ${
                  item?.status === 'Complete' ? 'text-positive' : 'text-warning-amber animate-pulse'
                }`}
              >
                {item?.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
