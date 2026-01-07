import { TickerData, Candle, Settings, QuantStats, Position, OKXOrder, OKXBalance } from '../types';
import { publicRequest, privateRequest } from './okx';

// Real Data: Fetch Ticker
export const fetchTicker = async (instId: string, settings: Settings): Promise<TickerData> => {
  try {
    // API: /api/v5/market/ticker
    const data = await publicRequest('/api/v5/market/ticker', { instId }, settings);
    const ticker = data[0];
    
    const last = parseFloat(ticker.last);
    const open24h = parseFloat(ticker.open24h);
    
    return {
      instId,
      last: last,
      open24h: open24h,
      high24h: parseFloat(ticker.high24h),
      low24h: parseFloat(ticker.low24h),
      vol24h: parseFloat(ticker.vol24h),
      change24h: ((last - open24h) / open24h) * 100,
      timestamp: parseInt(ticker.ts),
    };
  } catch (e) {
    console.warn(`Fetch ticker failed for ${instId}:`, e);
    // Return a safe fallback structure (zeros) so UI doesn't crash, but log error
    return {
        instId, last: 0, open24h: 0, high24h: 0, low24h: 0, vol24h: 0, change24h: 0, timestamp: Date.now()
    };
  }
};

// Real Data: Fetch Candles (K-Line)
export const fetchRealCandles = async (instId: string, settings: Settings, bar: string = '15m'): Promise<Candle[]> => {
    try {
        // API: /api/v5/market/candles
        const data = await publicRequest('/api/v5/market/candles', { instId, bar, limit: 100 }, settings);
        
        // OKX Format: [ts, o, h, l, c, vol, volCcy]
        return data.reverse().map((c: string[]) => ({
            time: parseInt(c[0]),
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4])
        }));
    } catch (e) {
        console.warn(`Fetch candles failed for ${instId}`, e);
        return [];
    }
};

// Real Data: Fetch Positions
export const fetchRealPositions = async (settings: Settings): Promise<Position[]> => {
    try {
        if (!settings.apiKey) return [];
        // API: /api/v5/account/positions
        const data = await privateRequest('/api/v5/account/positions', {}, settings);
        
        return data.map((pos: any) => ({
            id: pos.posId,
            instId: pos.instId,
            side: pos.posSide === 'short' ? 'short' : 'long', // net mode needs logic, simplified for now
            size: parseFloat(pos.pos),
            entryPrice: parseFloat(pos.avgPx),
            markPrice: parseFloat(pos.markPx),
            upl: parseFloat(pos.upl),
            uplRatio: parseFloat(pos.uplRatio) * 100, // API returns decimal e.g. 0.05 for 5%
            leverage: parseFloat(pos.lever),
            mgnMode: pos.mgnMode,
            liqPx: parseFloat(pos.liqPx) || 0,
            cTime: parseInt(pos.cTime),
            margin: parseFloat(pos.mgn), // Margin used
            notionalUsd: parseFloat(pos.notionalUsd)
        }));
    } catch (e) {
        console.error("Fetch positions failed:", e);
        return [];
    }
};

// Real Data: Fetch Account Balance & Quant Stats
export const fetchRealQuantStats = async (settings: Settings): Promise<QuantStats> => {
    try {
        if (!settings.apiKey) return generateEmptyStats();

        // 1. Get Balance
        const balanceData = await privateRequest('/api/v5/account/balance', { ccy: 'USDT' }, settings);
        const account: OKXBalance = balanceData[0];
        const totalEq = parseFloat(account?.totalEq || '0');

        // 2. Get Order History (Last 100 filled orders to calc stats)
        // API: /api/v5/trade/orders-history-archive (Archive is for > 3 months, use orders-history-archive for recent? No, usually 'orders-history-archive' is 3 months back.
        // Let's use /api/v5/trade/orders-history (last 7 days) or fill history.
        // Fills is better for PnL. /api/v5/trade/fills-history-archive (Up to 3 months)
        // Let's stick to orders history last 7 days for speed: /api/v5/trade/orders-history-archive (actually orders-history is last 7 days)
        // Actually, fills give PnL.
        
        // Simplified: use /api/v5/trade/orders-history for recent calculation
        const ordersData = await privateRequest('/api/v5/trade/orders-history', { state: 'filled', limit: '100' }, settings);
        
        return calculateRealStats(ordersData, totalEq);

    } catch (e) {
        console.error("Fetch quant stats failed:", e);
        return generateEmptyStats();
    }
};

// Helper: Calculate Stats from Order History
const calculateRealStats = (orders: any[], currentEquity: number): QuantStats => {
    if (!orders || orders.length === 0) return { ...generateEmptyStats(), initialCapital: currentEquity };

    let winCount = 0;
    let lossCount = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let maxDrawdown = 0;
    let peakEquity = currentEquity; // Approximation
    let totalFees = 0;
    let longCount = 0;
    let shortCount = 0;
    let maxProfit = 0;

    // Filter for orders that have realized PnL (usually closing orders)
    const closedOrders = orders.filter((o: any) => parseFloat(o.pnl) !== 0);

    closedOrders.forEach((o: any) => {
        const pnl = parseFloat(o.pnl);
        const fee = parseFloat(o.fee); // usually negative
        
        totalFees += Math.abs(fee);

        if (o.side === 'buy') longCount++; // This is loose logic, really need posSide
        if (o.side === 'sell') shortCount++;

        if (pnl > 0) {
            winCount++;
            totalProfit += pnl;
            maxProfit = Math.max(maxProfit, pnl);
        } else {
            lossCount++;
            totalLoss += pnl; // negative number
        }

        // Approx drawdown logic (local)
        // In a real system, you'd track equity curve. Here we sum PnL.
    });

    // Approximate Max Drawdown from the sum of losses in a row? 
    // Simplified: Just the single biggest loss for now as "Max Drawdown" is hard without time series equity
    maxDrawdown = closedOrders.reduce((min, o) => Math.min(min, parseFloat(o.pnl)), 0);

    const totalTrades = closedOrders.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const avgProfit = winCount > 0 ? totalProfit / winCount : 0;
    const avgLoss = lossCount > 0 ? totalLoss / lossCount : 0;
    const profitFactor = Math.abs(totalLoss) > 0 ? totalProfit / Math.abs(totalLoss) : totalProfit > 0 ? 999 : 0;
    const netProfit = totalProfit + totalLoss - totalFees;

    return {
        initialCapital: currentEquity - netProfit, // Rough back-calculation
        netProfit,
        totalTrades,
        winRate: parseFloat(winRate.toFixed(2)),
        totalFees: parseFloat(totalFees.toFixed(2)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
        maxProfit: parseFloat(maxProfit.toFixed(2)),
        winCount,
        lossCount,
        avgProfit: parseFloat(avgProfit.toFixed(2)),
        avgLoss: parseFloat(avgLoss.toFixed(2)),
        avgHoldTimeWin: 'N/A', // Complex to calc from API without order mapping
        avgHoldTimeLoss: 'N/A',
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        longCount,
        shortCount,
    };
};

const generateEmptyStats = (): QuantStats => ({
  initialCapital: 0,
  netProfit: 0,
  totalTrades: 0,
  winRate: 0,
  totalFees: 0,
  maxDrawdown: 0,
  maxProfit: 0,
  winCount: 0,
  lossCount: 0,
  avgProfit: 0,
  avgLoss: 0,
  avgHoldTimeWin: '--',
  avgHoldTimeLoss: '--',
  profitFactor: 0,
  longCount: 0,
  shortCount: 0,
});

// Utilities
export const calculateRSI = (candles: Candle[], period: number = 14): number => {
  if (candles.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};