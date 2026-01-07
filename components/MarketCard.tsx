import React from 'react';
import { TickerData, Candle } from '../types';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketCardProps {
  data: TickerData | null;
  candles: Candle[];
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

const MarketCard: React.FC<MarketCardProps> = ({ data, candles, isSelected, onClick, label }) => {
  if (!data) return <div className="animate-pulse h-32 bg-gray-900/50 rounded-2xl border border-white/5"></div>;

  const isUp = data.change24h >= 0;
  const color = isUp ? '#10b981' : '#ef4444';

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-500 border group
        ${isSelected 
          ? 'bg-gray-900 border-primary-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
          : 'bg-gray-900/40 border-white/5 hover:bg-gray-900/60 hover:border-white/10'}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-medium text-gray-500 tracking-wider mb-1">{label}</h3>
          <div className="flex items-baseline gap-2">
             <span className="text-2xl font-light tracking-tight text-gray-100 font-mono">
                {data.last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </span>
          </div>
        </div>
        <div className={`
            flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors
            ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}
        `}>
           {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
           {Math.abs(data.change24h).toFixed(2)}%
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-12 w-full mt-2 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={candles}>
            <defs>
              <linearGradient id={`gradient-${data.instId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={color} 
              strokeWidth={1.5}
              fill={`url(#gradient-${data.instId})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketCard;