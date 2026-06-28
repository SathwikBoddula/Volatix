'use client';

import React from 'react';
import {
  Table,
  TrendingUp,
  GitMerge,
  Activity,
  BarChart2,
  FlaskConical,
  Grid3X3,
  Cpu,
} from 'lucide-react';
import type { TabId } from './AnalyticsDashboard';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  shortLabel: string;
}[] = [
  { id: 'overview', label: 'Overview Matrix', shortLabel: 'Overview', icon: Table },
  { id: 'moving-averages', label: 'Moving Averages', shortLabel: 'MA Lines', icon: TrendingUp },
  { id: 'combined-trends', label: 'Combined Trends', shortLabel: 'Trends', icon: GitMerge },
  { id: 'rsi-momentum', label: 'Momentum (RSI)', shortLabel: 'RSI', icon: Activity },
  { id: 'macd-convergence', label: 'Trend Convergence', shortLabel: 'MACD', icon: BarChart2 },
  { id: 'backtest', label: 'Model Backtest', shortLabel: 'Backtest', icon: FlaskConical },
  { id: 'forecast-grid', label: '7-Day Forecast', shortLabel: 'Forecast', icon: Grid3X3 },
  { id: 'ai-trajectory', label: 'AI Trajectory', shortLabel: 'AI Chart', icon: Cpu },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-border overflow-x-auto scrollbar-none">
      <div className="flex gap-0 min-w-max">
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
              <span className="hidden lg:block">{tab.label}</span>
              <span className="lg:hidden">{tab.shortLabel}</span>
              {tab.id === 'ai-trajectory' && (
                <span className="text-xs px-1.5 py-0.5 rounded font-mono-data leading-none bg-accent/10 text-accent border border-accent/20">
                  LSTM
                </span>
              )}
              {tab.id === 'forecast-grid' && (
                <span className="text-xs px-1.5 py-0.5 rounded font-mono-data leading-none bg-primary/10 text-primary border border-primary/20">
                  7D
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
