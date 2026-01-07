import React, { useState, useEffect } from 'react';
import { Position } from '../types';
import { X, Clock, Calculator, Percent, DollarSign, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
}

// Helper to format duration
const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
};

const PositionDetailModal = ({ position, onClose }: { position: Position; onClose: () => void }) => {
  const [duration, setDuration] = useState(Date.now() - position.cTime);
  const [feeRate, setFeeRate] = useState(0.05); // Default 0.05%
  const [tpPrice, setTpPrice] = useState<string>('');
  const [slPrice, setSlPrice] = useState<string>('');
  
  // Timer for duration
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(Date.now() - position.cTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [position.cTime]);

  // Calculations
  const isLong = position.side === 'long';
  const leverage = position.leverage;
  const margin = position.margin;
  const notional = position.notionalUsd; // Total size in USD
  
  // Helper to calc PnL given an exit price
  const calcPnL = (exitPrice: number) => {
    if (!exitPrice) return 0;
    const priceDiff = isLong ? (exitPrice - position.entryPrice) : (position.entryPrice - exitPrice);
    const size = position.size; // contracts
    // Simplified Logic assuming simple contract multiplier, in real app use contract val.
    // For USDT perp, PnL = (Exit - Entry) * Multiplier * Size. 
    // Inferring unit value from notional / size / price
    const unitVal = notional / size / position.entryPrice; 
    
    // Actually OKX UPL formula is simpler: UPL = size * (markPx - avgPx) (for long)
    // We can just use ratio:
    const ratio = (priceDiff / position.entryPrice);
    return notional * ratio;
  };

  const tpPnL = tpPrice ? calcPnL(parseFloat(tpPrice)) : 0;
  const slPnL = slPrice ? calcPnL(parseFloat(slPrice)) : 0;
  const estimatedFee = notional * (feeRate / 100);

  // Max Drawdown (Estimated based on current UPL if negative, otherwise 0 for now as we lack tick history)
  // In a real backend we would query "Lowest Price since cTime". 
  // Here we use current UPL as "Current Drawdown" if it's negative.
  const maxDrawdownAmt = position.upl < 0 ? position.upl : 0;
  const maxDrawdownRate = position.uplRatio < 0 ? position.uplRatio : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
          <div>
             <div className="flex items-center gap-3">
                <h2 className="text-xl font-medium text-white">{position.instId}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {position.side === 'long' ? '做多 (Long)' : '做空 (Short)'} {position.leverage}x
                </span>
             </div>
             <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock size={12}/> 开仓时长: <span className="font-mono text-gray-300">{formatDuration(duration)}</span>
             </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
            
            {/* Section 1: Performance Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 mb-1">未结盈亏 (UPL)</p>
                    <p className={`text-lg font-mono font-medium ${position.upl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.upl >= 0 ? '+' : ''}{position.upl.toFixed(2)}
                    </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 mb-1">盈利率 (ROE)</p>
                    <p className={`text-lg font-mono font-medium ${position.uplRatio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.uplRatio >= 0 ? '+' : ''}{position.uplRatio.toFixed(2)}%
                    </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 mb-1">保证金 (Margin)</p>
                    <p className="text-lg font-mono font-medium text-gray-200">
                        ${position.margin.toFixed(2)}
                    </p>
                </div>
                 <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 mb-1">当前回撤</p>
                    <p className="text-lg font-mono font-medium text-yellow-500">
                       {maxDrawdownAmt.toFixed(2)} <span className="text-xs text-gray-600">({maxDrawdownRate.toFixed(1)}%)</span>
                    </p>
                </div>
            </div>

            {/* Section 2: Detailed Stats Grid */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 border-l-2 border-blue-500 pl-3">仓位详情</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm bg-black/40 p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between">
                        <span className="text-gray-500">开仓均价</span>
                        <span className="font-mono text-gray-200">{position.entryPrice}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">最新标记</span>
                        <span className="font-mono text-gray-200">{position.markPrice}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">持仓张数</span>
                        <span className="font-mono text-gray-200">{position.size}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">强平价格</span>
                        <span className="font-mono text-red-400">{position.liqPx || '--'}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">开仓时间</span>
                        <span className="font-mono text-gray-400 text-xs">{new Date(position.cTime).toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">交易平台</span>
                        <span className="font-mono text-gray-200">OKX (欧易)</span>
                    </div>
                </div>
            </div>

            {/* Section 3: Interactive Risk Management */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-sm font-medium text-gray-300 border-l-2 border-purple-500 pl-3">止盈止损计算器 (预设)</h3>
                     <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-gray-500">预期手续费率(%)</span>
                        <input 
                            type="number" 
                            value={feeRate} 
                            onChange={(e) => setFeeRate(parseFloat(e.target.value))}
                            className="w-12 bg-transparent text-right text-xs text-gray-300 outline-none border-b border-gray-700 focus:border-purple-500"
                        />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Take Profit Input */}
                    <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl space-y-3">
                        <label className="text-xs text-green-400 font-medium flex items-center gap-1">
                            <Target size={12}/> 止盈价格 (TP)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 text-xs">$</span>
                            <input 
                                type="number" 
                                value={tpPrice}
                                onChange={(e) => setTpPrice(e.target.value)}
                                placeholder="输入目标止盈价"
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-6 pr-3 text-sm text-white focus:border-green-500/50 outline-none font-mono"
                            />
                        </div>
                        {tpPrice && (
                            <div className="pt-2 border-t border-green-500/10 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">预期盈利</span>
                                    <span className="text-green-400 font-mono">+${tpPnL.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">扣除手续费后</span>
                                    <span className="text-green-400 font-mono font-bold">+${(tpPnL - estimatedFee).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stop Loss Input */}
                     <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
                        <label className="text-xs text-red-400 font-medium flex items-center gap-1">
                            <AlertTriangle size={12}/> 止损价格 (SL)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 text-xs">$</span>
                            <input 
                                type="number" 
                                value={slPrice}
                                onChange={(e) => setSlPrice(e.target.value)}
                                placeholder="输入目标止损价"
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-6 pr-3 text-sm text-white focus:border-red-500/50 outline-none font-mono"
                            />
                        </div>
                         {slPrice && (
                            <div className="pt-2 border-t border-red-500/10 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">预期亏损</span>
                                    <span className="text-red-400 font-mono">${slPnL.toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">扣除手续费后</span>
                                    <span className="text-red-400 font-mono font-bold">${(slPnL - estimatedFee).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  return (
    <>
      <div className="bg-gray-900/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full backdrop-blur-sm">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-200">实时持仓监控 (点击查看详情)</h3>
          <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-500">Live</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-gray-500 text-xs font-normal border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-normal">交易对</th>
                <th className="px-6 py-4 font-normal">方向</th>
                <th className="px-6 py-4 font-normal text-right">张数/Size</th>
                <th className="px-6 py-4 font-normal text-right">杠杆</th>
                <th className="px-6 py-4 font-normal text-right">保证金</th>
                <th className="px-6 py-4 font-normal text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {positions.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-600 font-light">
                          暂无活跃持仓
                      </td>
                  </tr>
              ) : (
                  positions.map((pos) => {
                  return (
                      <tr 
                        key={pos.id} 
                        onClick={() => setSelectedPosition(pos)}
                        className="hover:bg-white/[0.05] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-medium text-gray-300 group-hover:text-white transition-colors">
                            {pos.instId}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${pos.side === 'long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {pos.side === 'long' ? '做多' : '做空'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 font-mono">{pos.size}</td>
                        <td className="px-6 py-4 text-right text-gray-400 font-mono">{pos.leverage}x</td>
                        <td className="px-6 py-4 text-right text-gray-400 font-mono">${pos.margin.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                               详情 >
                           </span>
                        </td>
                      </tr>
                  );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPosition && (
        <PositionDetailModal 
            position={selectedPosition} 
            onClose={() => setSelectedPosition(null)} 
        />
      )}
    </>
  );
};

export default PositionsTable;