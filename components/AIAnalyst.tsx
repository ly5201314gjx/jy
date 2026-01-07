import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { analyzeMarket } from '../services/geminiService';
import { TickerData, IndicatorData } from '../types';

interface AIAnalystProps {
  ticker: TickerData | null;
  indicators: IndicatorData;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ ticker, indicators }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
        const result = await analyzeMarket(ticker, indicators);
        setAnalysis(result);
    } catch (e: any) {
        setError(e.message || "分析失败");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
       {/* Background Decoration */}
       <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-6 z-10">
        <div className="p-1.5 bg-primary-500/20 rounded-lg">
            <BrainCircuit className="text-primary-400" size={18} />
        </div>
        <h3 className="font-medium text-gray-200">AI 智能分析</h3>
        <span className="text-[10px] text-primary-400/80 border border-primary-500/20 px-2 py-0.5 rounded-full ml-auto bg-primary-500/5">Gemini 驱动</span>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[120px] z-10">
        {loading ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-4">
                <Loader2 className="animate-spin mb-3 text-primary-500" size={20} />
                <span className="text-xs font-light tracking-widest animate-pulse">正在深度分析市场数据...</span>
            </div>
        ) : error ? (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-xs">
                <AlertCircle size={14} className="mt-0.5 shrink-0"/>
                <p>{error}</p>
            </div>
        ) : analysis ? (
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-gray-300 leading-7 font-light text-justify">
                    {analysis}
                </p>
            </div>
        ) : (
            <div className="text-center text-gray-600 text-xs font-light py-4 border border-dashed border-white/10 rounded-xl">
                等待指令，准备分析 {ticker?.instId} 的技术指标
            </div>
        )}
      </div>

      <button 
        onClick={handleAnalyze}
        disabled={loading || !ticker}
        className={`w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-medium tracking-wide transition-all z-10
            ${loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5'}
        `}
      >
        {loading ? '分析中...' : (
            <>
                <Sparkles size={14} />
                生成洞察报告
            </>
        )}
      </button>
    </div>
  );
};

export default AIAnalyst;