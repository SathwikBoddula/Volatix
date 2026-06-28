'use client';
import { formatPrice } from '@/utils/formatCurrency';
import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TickerData } from '../../data/mockData';

interface OverviewMatrixProps {
  data: TickerData;
  ticker: string;
}

type SortKey =
  | 'date'
  | 'open'
  | 'high'
  | 'low'
  | 'close'
  | 'volume'
  | 'ma100'
  | 'ma200'
  | 'rsi'
  | 'macdHistogram';
type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [10, 25, 50];

export default function OverviewMatrix({ data, ticker }: OverviewMatrixProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let rows = [...data.history];
    if (search) {
      rows = rows.filter((r) => r.date.includes(search));
    }
    rows.sort((a, b) => {
      const av = a[sortKey as keyof typeof a] as number | string;
      const bv = b[sortKey as keyof typeof b] as number | string;
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return rows;
  }, [data.history, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown size={12} className="text-muted-foreground opacity-50" />;
    return sortDir === 'asc' ? (
      <ArrowUp size={12} className="text-primary" />
    ) : (
      <ArrowDown size={12} className="text-primary" />
    );
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-negative';
    if (rsi < 30) return 'text-positive';
    return 'text-muted-foreground';
  };

  const getRSIBadge = (rsi: number) => {
    if (rsi > 70)
      return (
        <span className="ml-1 text-xs px-1 py-0.5 rounded bg-danger/10 text-negative border border-danger/20 font-mono-data">
          OB
        </span>
      );
    if (rsi < 30)
      return (
        <span className="ml-1 text-xs px-1 py-0.5 rounded bg-success/10 text-positive border border-success/20 font-mono-data">
          OS
        </span>
      );
    return null;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ticker} Historical Data Matrix</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} trading sessions · sorted by {sortKey} {sortDir}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by date..."
              className="pl-8 pr-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono-data w-48"
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: 'date' as SortKey, label: 'Date' },
                  { key: 'open' as SortKey, label: 'Open' },
                  { key: 'high' as SortKey, label: 'High' },
                  { key: 'low' as SortKey, label: 'Low' },
                  { key: 'close' as SortKey, label: 'Close' },
                  { key: 'volume' as SortKey, label: 'Volume' },
                  { key: 'ma100' as SortKey, label: 'MA 100' },
                  { key: 'ma200' as SortKey, label: 'MA 200' },
                  { key: 'rsi' as SortKey, label: 'RSI(14)' },
                  { key: 'macdHistogram' as SortKey, label: 'MACD Hist.' },
                ].map((col) => (
                  <th
                    key={`th-${col.key}`}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                const isGreen = row.close >= row.open;
                return (
                  <tr
                    key={`row-${row.date}`}
                    className={`border-b border-border/50 hover:bg-white/3 transition-colors ${
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono-data text-xs text-muted-foreground whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs text-foreground">
                      {formatPrice(row.open, ticker)}
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs text-positive">
                      {formatPrice(row.high, ticker)}
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs text-negative">
                      {formatPrice(row.low, ticker)}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-mono-data text-xs font-semibold ${isGreen ? 'text-positive' : 'text-negative'}`}
                    >
                      {formatPrice(row.close, ticker)}
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs text-muted-foreground">
                      {(row.volume / 1_000_000).toFixed(1)}M
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs text-foreground">
                      {formatPrice(row.ma100, ticker)}
                    </td>
                    <td className="px-4 py-2.5 font-mono-data text-xs text-foreground">
                      {formatPrice(row.ma200, ticker)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-mono-data text-xs ${getRSIColor(row.rsi)}`}>
                        {row.rsi.toFixed(1)}
                      </span>
                      {getRSIBadge(row.rsi)}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-mono-data text-xs ${row.macdHistogram >= 0 ? 'text-positive' : 'text-negative'}`}
                    >
                      {row.macdHistogram >= 0 ? '+' : ''}
                      {row.macdHistogram.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-muted border border-border rounded px-2 py-1 text-foreground font-mono-data outline-none focus:border-primary/50"
            >
              {PAGE_SIZES.map((s) => (
                <option key={`ps-${s}`} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="font-mono-data">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{' '}
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setPage(pageNum)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-data transition-colors ${
                    page === pageNum
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
