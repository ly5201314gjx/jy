export interface TickerData {
  instId: string;
  last: number;
  open24h: number;
  high24h: number;
  low24h: number;
  vol24h: number;
  change24h: number;
  timestamp: number;
}

export interface Position {
  id: string; // positionId
  instId: string;
  side: 'long' | 'short';
  size: number; // pos
  entryPrice: number; // avgPx
  markPrice: number;
  upl: number; // Unrealized PnL
  uplRatio: number; // %
  leverage: number;
  mgnMode: string;
  liqPx: number; // Liquidation Price
  cTime: number; // Creation Time (timestamp)
  margin: number; // Margin used
  notionalUsd: number; // Position value in USD
}

export interface Settings {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  geminiApiKey: string;
  proxyUrl: string;
  useRealData: boolean;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface IndicatorData {
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface QuantStats {
  totalTrades: number;
  winRate: number;
  totalFees: number;
  maxDrawdown: number;
  maxProfit: number;
  winCount: number;
  lossCount: number;
  avgProfit: number;
  avgLoss: number;
  avgHoldTimeWin: string;
  avgHoldTimeLoss: string;
  profitFactor: number;
  longCount: number;
  shortCount: number;
  initialCapital: number; // From Account Balance
  netProfit: number;
}

// Internal OKX Types
export interface OKXOrder {
  ordId: string;
  instId: string;
  side: 'buy' | 'sell';
  posSide: 'long' | 'short' | 'net';
  fillSz: string;
  fillPx: string;
  fee: string;
  pnl: string; // Realized PnL
  cTime: string; // Creation Time
  state: string;
}

export interface OKXBalance {
  totalEq: string; // Total Equity
  adjEq: string;
  details: any[];
}