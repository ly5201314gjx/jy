import React from 'react';
import { QuantStats } from '../types';
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock, Percent, Hash } from 'lucide-react';

interface QuantStatsViewProps {
  stats: QuantStats;
}

const StatCard = ({ label, value, subValue, icon: Icon, highlight = false, colorClass = "text-white" }: any) => (
  <div className="bg-gray-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-sm hover:bg-gray-900/60 transition-colors">
    <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-gray-500 font-medium tracking-wide">{label}</span>
        <div className={`p-1.5 rounded-lg ${highlight ? 'bg-white/10' : 'bg-transparent'}`}>
            <Icon size={14} className="text-gray-400" />
        </div>
    </div>
    <div className={`text-xl font-mono font-light tracking-tight ${colorClass}`}>
        {value}
    </div>
    {subValue && (
        <div className="text-[10px] text-gray-600 mt-1 font-mono">
            {subValue}
        </div>
    )}
  </div>
);

const QuantStatsView: React.FC<QuantStatsViewProps> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-2">
             <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500"/>
                量化核心数据
             </h2>
             <span className="text-[10px] text-gray-500 border border-white/5 px-2 py-1 rounded-full">
                实时计算中
             </span>
        </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Row 1: Capital & Profit */}
        <StatCard 
            label="初始入金" 
            value={`$${stats.initialCapital.toLocaleString()}`} 
            icon={DollarSign} 
        />
        <StatCard 
            label="净获利" 
            value={`+$${stats.netProfit.toLocaleString()}`} 
            colorClass="text-green-400"
            highlight
            icon={TrendingUp} 
        />
        <StatCard 
            label="最大浮动盈利" 
            value={`+$${stats.maxProfit.toLocaleString()}`} 
            colorClass="text-green-400"
            icon={TrendingUp} 
        />
        <StatCard 
            label="最大浮动亏损" 
            value={`${stats.maxDrawdown.toLocaleString()}`} 
            colorClass="text-red-400"
            icon={TrendingDown} 
        />

        {/* Row 2: Performance Ratios */}
        <StatCard 
            label="策略胜率" 
            value={`${stats.winRate}%`} 
            subValue={`盈利因子: ${stats.profitFactor}`}
            colorClass="text-blue-400"
            highlight
            icon={Percent} 
        />
        <StatCard 
            label="交易总频次" 
            value={stats.totalTrades} 
            subValue={`手续费: -$${stats.totalFees}`}
            icon={Hash} 
        />
        <StatCard 
            label="做多 / 做空" 
            value={`${stats.longCount} / ${stats.shortCount}`} 
            subValue="开仓分布"
            icon={Activity} 
        />
        <StatCard 
            label="盈亏次数比" 
            value={`${stats.winCount} / ${stats.lossCount}`} 
            colorClass="text-gray-300"
            icon={Hash} 
        />

        {/* Row 3: Averages */}
        <StatCard 
            label="平均盈利金额" 
            value={`+$${stats.avgProfit}`} 
            colorClass="text-green-400"
            icon={DollarSign} 
        />
         <StatCard 
            label="平均亏损金额" 
            value={`${stats.avgLoss}`} 
            colorClass="text-red-400"
            icon={DollarSign} 
        />
         <StatCard 
            label="盈利持仓时间" 
            value={stats.avgHoldTimeWin} 
            icon={Clock} 
        />
         <StatCard 
            label="亏损持仓时间" 
            value={stats.avgHoldTimeLoss} 
            icon={Clock} 
        />
      </div>
      
      {/* Decorative Footer Area */}
      <div className="mt-8 p-6 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-gray-500 mb-2">系统由本地算法驱动，数据每 200ms 刷新一次</p>
        <div className="w-full max-w-md h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/20 w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default QuantStatsView;