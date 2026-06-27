export interface HistoryRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma100: number;
  ma200: number;
  ma250: number;
  rsi: number;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
}

export interface BacktestRow {
  date: string;
  actual: number;
  predicted: number;
}
export interface ForecastRow {
  date: string;
  predicted: number;
  low: number;
  high: number;
  confidence: number;
}

export interface TickerSummary {
  currentPrice: number;
  prevClose: number;
  dailyHigh: number;
  dailyLow: number;
  volume: number;
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ma100: number;
  ma200: number;
  ma250: number;
  backtestRMSE: number;
}

export interface TickerData {
  summary: TickerSummary;
  history: HistoryRow[];
  backtest: BacktestRow[];
  forecast: ForecastRow[];
}

// Seeded pseudo-random for stable SSR/CSR consistency
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function subtractBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let subtracted = 0;
  while (subtracted < days) {
    result.setDate(result.getDate() - 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) subtracted++;
  }
  return result;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Ticker-specific base prices and volatility profiles
const TICKER_PROFILES: Record<string, { base: number; vol: number; trend: number; seed: number }> = {
  NVDA:  { base: 1087.42, vol: 0.028, trend: 0.0008,  seed: 42 },
'RELIANCE.NS': { base: 2950.00, vol: 0.015, trend: 0.0001, seed: 101 },
  RELIANCE:      { base: 2950.00, vol: 0.015, trend: 0.0001, seed: 101 },
  'TCS.NS':      { base: 3850.00, vol: 0.012, trend: 0.0001, seed: 202 },
  TCS:           { base: 3850.00, vol: 0.012, trend: 0.0001, seed: 202 },
  'INFY.NS':     { base: 1520.00, vol: 0.020, trend: 0.0002, seed: 303 },
  INFY:          { base: 1520.00, vol: 0.020, trend: 0.0002, seed: 303 },
  'HDFCBANK.NS': { base: 1610.00, vol: 0.013, trend: 0.0001, seed: 505 },
  HDFCBANK:      { base: 1610.00, vol: 0.013, trend: 0.0001, seed: 505 },
  'TATAMOTORS.NS': { base: 940.00, vol: 0.028, trend: 0.0004, seed: 404 },
  TATAMOTORS:    { base: 940.00,  vol: 0.028, trend: 0.0004, seed: 404 },
  'SBIN.NS':     { base: 820.00,  vol: 0.018, trend: 0.0002, seed: 606 },
  SBIN:          { base: 820.00,  vol: 0.018, trend: 0.0002, seed: 606 },
  'WIPRO.NS':    { base: 480.00,  vol: 0.016, trend: 0.0001, seed: 707 },
  WIPRO:         { base: 480.00,  vol: 0.016, trend: 0.0001, seed: 707 },
  AAPL:  { base: 211.56,  vol: 0.014, trend: 0.0003,  seed: 77 },
  TSLA:  { base: 248.30,  vol: 0.038, trend: -0.0002, seed: 13 },
  MSFT:  { base: 447.80,  vol: 0.016, trend: 0.0004,  seed: 55 },
  AMZN:  { base: 198.45,  vol: 0.020, trend: 0.0005,  seed: 88 },
  META:  { base: 523.70,  vol: 0.022, trend: 0.0006,  seed: 31 },
  GOOGL: { base: 178.90,  vol: 0.017, trend: 0.0003,  seed: 64 },
  SPY:   { base: 542.30,  vol: 0.010, trend: 0.0002,  seed: 99 },
  QQQ:   { base: 473.60,  vol: 0.013, trend: 0.0003,  seed: 22 },
  AMD:   { base: 162.40,  vol: 0.032, trend: 0.0004,  seed: 47 },
};


const DEFAULT_PROFILE = { base: 150.00, vol: 0.022, trend: 0.0003, seed: 11 };

export function generateMockData(ticker: string): TickerData | null {
  const profile = TICKER_PROFILES[ticker];
  if (!profile) return null;
  const rand = seededRand(profile.seed);

  const TOTAL_DAYS = 500;
  const baseDate = new Date();

  // Generate price series using GBM-like model
  const prices: number[] = [profile.base];
  for (let i = 1; i < TOTAL_DAYS; i++) {
    const r = rand();
    const shock = (r - 0.5) * 2 * profile.vol;
    // Add mean reversion + trend
    const prev = prices[i - 1];
    const meanReversion = (profile.base * (1 + profile.trend * i) - prev) * 0.01;
    const next = Math.max(prev * (1 + shock) + meanReversion, profile.base * 0.3);
    prices.push(next);
  }
  // Reverse so index 0 = most recent
  prices.reverse();

  // Compute rolling MAs
  function rollingMA(arr: number[], window: number, idx: number): number {
    const slice = arr.slice(idx, idx + window);
    if (slice.length < window) return arr[idx];
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  }

  // Compute RSI
  function computeRSI(arr: number[], idx: number, period: number = 14): number {
    const end = idx + period + 1;
    if (end > arr.length) return 50;
    const gains: number[] = [];
    const losses: number[] = [];
    for (let i = idx; i < end - 1; i++) {
      const diff = arr[i] - arr[i + 1]; // arr[i] is more recent
      if (diff > 0) gains.push(diff);
      else losses.push(Math.abs(diff));
    }
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / period : 0;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  // Compute EMA
  function computeEMA(arr: number[], idx: number, period: number): number {
    const k = 2 / (period + 1);
    let ema = arr[idx + period - 1];
    for (let i = idx + period - 2; i >= idx; i--) {
      ema = arr[i] * k + ema * (1 - k);
    }
    return ema;
  }

  // Build history rows (most recent first)
  const history: HistoryRow[] = [];
  for (let i = 0; i < Math.min(TOTAL_DAYS - 260, 400); i++) {
    const close = prices[i];
    const r = seededRand(profile.seed + i);
    const dayVol = profile.vol * 0.6;
    const open = close * (1 + (r() - 0.5) * dayVol);
    const high = Math.max(open, close) * (1 + r() * dayVol * 0.5);
    const low = Math.min(open, close) * (1 - r() * dayVol * 0.5);
    const volume = Math.floor((15_000_000 + r() * 40_000_000) * (ticker === 'NVDA' ? 2.5 : 1));

    const ma100 = rollingMA(prices, 100, i);
    const ma200 = rollingMA(prices, 200, i);
    const ma250 = rollingMA(prices, 250, i);
    const rsi = Math.min(100, Math.max(0, computeRSI(prices, i)));

    const ema12 = computeEMA(prices, i, 12);
    const ema26 = computeEMA(prices, i, 26);
    const macdLine = ema12 - ema26;

    // Signal = EMA9 of MACD (approximate)
    const macdSignal = macdLine * 0.85 + (seededRand(profile.seed + i + 1000)() - 0.5) * Math.abs(macdLine) * 0.3;
    const macdHistogram = macdLine - macdSignal;

    const rowDate = subtractBusinessDays(baseDate, i);

    history.push({
      date: formatDate(rowDate),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      ma100: parseFloat(ma100.toFixed(2)),
      ma200: parseFloat(ma200.toFixed(2)),
      ma250: parseFloat(ma250.toFixed(2)),
      rsi: parseFloat(rsi.toFixed(2)),
      macdLine: parseFloat(macdLine.toFixed(4)),
      macdSignal: parseFloat(macdSignal.toFixed(4)),
      macdHistogram: parseFloat(macdHistogram.toFixed(4)),
    });
  }

  // Build backtest (30% holdout = ~120 days from the middle of history)
  const backtestStart = 120;
  const backtestEnd = 240;
  const backtest: BacktestRow[] = [];
  for (let i = backtestStart; i < backtestEnd; i++) {
    if (i >= history.length) break;
    const actual = history[i].close;
    const noiseR = seededRand(profile.seed + i + 5000);
    const noise = (noiseR() - 0.5) * actual * 0.018;
    const predicted = parseFloat((actual + noise).toFixed(2));
    backtest.push({ date: history[i].date, actual, predicted });
  }

  // Build 7-day forecast
  const lastClose = prices[0];
  const forecast: ForecastRow[] = [];
  let forecastPrice = lastClose;
  for (let i = 0; i < 7; i++) {
    const fr = seededRand(profile.seed + i + 9000);
    const dailyShift = (fr() - 0.48) * profile.vol * forecastPrice;
    forecastPrice = forecastPrice + dailyShift;
    const uncertainty = 0.008 + i * 0.003;
    const low = parseFloat((forecastPrice * (1 - uncertainty)).toFixed(2));
    const high = parseFloat((forecastPrice * (1 + uncertainty)).toFixed(2));
    const confidence = parseFloat(Math.max(55, 82 - i * 3.5 + (fr() - 0.5) * 4).toFixed(1));
    const fDate = addBusinessDays(baseDate, i + 1);
    forecast.push({
      date: formatDate(fDate),
      predicted: parseFloat(forecastPrice.toFixed(2)),
      low,
      high,
      confidence,
    });
  }

  // Summary
  const currentPrice = prices[0];
  const prevClose = prices[1];
  const r0 = seededRand(profile.seed + 99999);
  const dailyHigh = parseFloat((currentPrice * (1 + r0() * profile.vol * 0.6)).toFixed(2));
  const dailyLow = parseFloat((currentPrice * (1 - r0() * profile.vol * 0.6)).toFixed(2));
  const volume = Math.floor(15_000_000 + r0() * 40_000_000);

  const rsi = parseFloat(Math.min(100, Math.max(0, computeRSI(prices, 0))).toFixed(2));
  const ema12 = computeEMA(prices, 0, 12);
  const ema26 = computeEMA(prices, 0, 26);
  const macdVal = ema12 - ema26;
  const macdSig = macdVal * 0.85;
  const macdHist = macdVal - macdSig;

  const ma100 = rollingMA(prices, 100, 0);
  const ma200 = rollingMA(prices, 200, 0);
  const ma250 = rollingMA(prices, 250, 0);

  // RMSE from backtest
  const squaredErrors = backtest.map(b => Math.pow((b.predicted - b.actual) / b.actual, 2));
  const rmse = parseFloat(Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length).toFixed(4));

  return {
    summary: {
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      prevClose: parseFloat(prevClose.toFixed(2)),
      dailyHigh,
      dailyLow,
      volume,
      rsi,
      macd: {
        value: parseFloat(macdVal.toFixed(4)),
        signal: parseFloat(macdSig.toFixed(4)),
        histogram: parseFloat(macdHist.toFixed(4)),
      },
      ma100: parseFloat(ma100.toFixed(2)),
      ma200: parseFloat(ma200.toFixed(2)),
      ma250: parseFloat(ma250.toFixed(2)),
      backtestRMSE: rmse,
    },
    history,
    backtest,
    forecast,
  };
}