import React, { useEffect, useState, useMemo } from 'react';
import { Activity, BarChart3, RefreshCw, Wifi, AlertTriangle } from 'lucide-react';
import { TickerData, Settings, Candle, QuantStats, Position } from './types';
import { PAIRS, DEFAULT_SETTINGS } from './constants';
import { fetchTicker, fetchRealCandles, fetchRealPositions, fetchRealQuantStats, calculateRSI } from './services/marketService';

import LoginScreen from './components/LoginScreen';
import BottomNav from './components/BottomNav';
import MarketCard from './components/MarketCard';
import PositionsTable from './components/PositionsTable';
import SettingsView from './components/SettingsView';
import QuantStatsView from './components/QuantStats';
import AIAnalyst from './components/AIAnalyst';

import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Data State
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const [selectedPair, setSelectedPair] = useState<string>(PAIRS[0].id);
  const [quantStats, setQuantStats] = useState<QuantStats | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('quantflow_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // UI State
  const [candles, setCandles] = useState<Record<string, Candle[]>>({});
  const [chartType, setChartType] = useState<'candle' | 'line'>('line');
  const [latency, setLatency] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Data Fetching
  const fetchData = async () => {
    if (!settings.proxyUrl) {
        setErrorMsg("请先在设置中配置 CORS 代理地址");
        return;
    }

    const start = Date.now();
    setErrorMsg(null);
    const newTickers: Record<string, TickerData> = {};
    const newCandles: Record<string, Candle[]> = {};

    try {
        // 1. Fetch Market Data (Tickers & Candles)
        // Parallel fetch for selected pair candles to be fast
        await Promise.all(PAIRS.map(async (pair) => {
            // Ticker
            const tData = await fetchTicker(pair.id, settings);
            if (tData) newTickers[pair.id] = tData;

            // Candles (only fetch for selected or all? For perf, maybe just selected, but let's do all for smooth UI switch)
            // To avoid rate limit, maybe only fetch selected pair's candles intensely
            if (pair.id === selectedPair || !candles[pair.id]) {
                const cData = await fetchRealCandles(pair.id, settings, '15m');
                if (cData.length > 0) newCandles[pair.id] = cData;
            }
        }));

        setTickers(prev => ({ ...prev, ...newTickers }));
        setCandles(prev => ({ ...prev, ...newCandles }));

        // 2. Fetch Private Data (Positions & Stats) - Only if keys exist
        if (settings.apiKey && settings.secretKey) {
            const posData = await fetchRealPositions(settings);
            setPositions(posData);

            // Fetch stats less frequently? For now, fetch every time
            const statsData = await fetchRealQuantStats(settings);
            setQuantStats(statsData);
        }

    } catch (e: any) {
        console.error("Data Sync Error:", e);
        // Only show error if no data at all
        if (Object.keys(newTickers).length === 0) {
             setErrorMsg(e.message || "无法连接 OKX API，请检查网络或代理");
        }
    }

    setLatency(Date.now() - start);
  };

  const handleManualRefresh = async () => {
      setIsRefreshing(true);
      await fetchData();
      setTimeout(() => setIsRefreshing(false), 500);
  };

  // Poll Loop
  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchData(); // Initial
    const interval = setInterval(fetchData, 3000); // 3s polling for real API to avoid rate limits
    return () => clearInterval(interval);
  }, [settings, isAuthenticated, selectedPair]); // Re-fetch when pair changes to get candles

  // Memoized Indicators
  const currentCandles = candles[selectedPair] || [];
  const currentTicker = tickers[selectedPair];
  const indicators = useMemo(() => ({
     rsi: calculateRSI(currentCandles, 14),
     macd: 0, signal: 0, histogram: 0
  }), [currentCandles]);

  if (!isAuthenticated) {
      return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-24">
      
      {/* Top Status Bar */}
      <header className="h-16 border-b border-white/5 bg-[#050505]/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
            <Activity className="text-white" size={16} />
          </div>
          <span className="text-sm font-medium text-white tracking-wide">QuantFlow <span className="text-[10px] text-gray-600 ml-1">LIVE CORE</span></span>
        </div>

        <div className="flex items-center gap-4">
            {errorMsg && (
                <div className="flex items-center gap-1 text-red-500 text-xs animate-pulse">
                    <AlertTriangle size={12} />
                    <span className="hidden md:inline">{errorMsg}</span>
                </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-white/10">
                <Wifi size={12} className={latency < 300 ? "text-green-500" : "text-yellow-500"} />
                <span className="text-[10px] font-mono text-gray-400">{latency}ms</span>
            </div>
            <button 
                onClick={handleManualRefresh}
                className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
                <RefreshCw size={16} />
            </button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
        
        {/* TAB 0: HOME / INDICATORS */}
        {activeTab === 0 && (
            <div className="space-y-6">
                 {/* Market Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PAIRS.map(pair => (
                        <MarketCard 
                            key={pair.id}
                            label={pair.name}
                            data={tickers[pair.id] || null}
                            candles={candles[pair.id] || []}
                            isSelected={selectedPair === pair.id}
                            onClick={() => setSelectedPair(pair.id)}
                        />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-gray-900/40 rounded-2xl border border-white/5 p-6 backdrop-blur-sm flex flex-col min-h-[450px]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                                    <BarChart3 size={18} className="text-blue-500"/>
                                    {selectedPair}
                                </h2>
                                <div className="flex gap-2 mt-2">
                                     <button 
                                        onClick={() => setChartType('line')}
                                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${chartType === 'line' ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}
                                     >
                                        走势图
                                     </button>
                                     <button 
                                        onClick={() => setChartType('candle')}
                                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${chartType === 'candle' ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}
                                     >
                                        K线图 (真实)
                                     </button>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-white/5 font-mono">
                                RSI: {indicators.rsi.toFixed(1)}
                            </span>
                        </div>

                        <div className="flex-1 w-full">
                            {currentCandles.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={currentCandles}>
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                                        <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} stroke="#444" tick={{fontSize: 10}} minTickGap={40} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis domain={['auto', 'auto']} orientation="right" stroke="#444" tick={{fontSize: 10}} tickFormatter={(val) => val.toLocaleString()} axisLine={false} tickLine={false} dx={10} />
                                        <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', color: '#fff'}} itemStyle={{fontSize: '12px'}} labelStyle={{display: 'none'}} />
                                        <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#chartGradient)" isAnimationActive={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                                    正在加载真实 K 线数据...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Analyst */}
                    <div className="h-full">
                         <AIAnalyst ticker={currentTicker} indicators={indicators} />
                    </div>
                </div>
            </div>
        )}

        {/* TAB 1: QUANT STATISTICS */}
        {activeTab === 1 && (
            quantStats ? <QuantStatsView stats={quantStats} /> : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
                    <Activity className="animate-pulse" />
                    <p className="text-xs">请配置 API Key 并进行交易以获取量化统计...</p>
                </div>
            )
        )}

        {/* TAB 2: POSITIONS */}
        {activeTab === 2 && <PositionsTable positions={positions} />}

        {/* TAB 3: SETTINGS */}
        {activeTab === 3 && (
            <SettingsView 
                settings={settings} 
                onSave={(s) => {
                    setSettings(s);
                    localStorage.setItem('quantflow_settings', JSON.stringify(s));
                }} 
            />
        )}

      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;