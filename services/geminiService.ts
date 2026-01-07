import { GoogleGenAI } from "@google/genai";
import { TickerData, IndicatorData } from "../types";

export const analyzeMarket = async (
  ticker: TickerData,
  indicators: IndicatorData
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is missing in process.env.");
    return "无法分析：未配置 API 密钥。";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    你是一位专业的加密货币量化交易专家。
    请分析 ${ticker.instId} 的以下市场数据：
    
    - 当前价格: ${ticker.last.toFixed(2)}
    - 24小时涨跌: ${ticker.change24h.toFixed(2)}%
    - 24小时成交量: ${ticker.vol24h.toFixed(2)}
    - RSI (14): ${indicators.rsi.toFixed(2)}
    - MACD 信号: ${indicators.signal.toFixed(4)}
    
    请提供两句简短、专业的中文交易洞察。
    第一句：判断市场趋势（看涨/看跌/震荡）。
    第二句：给出具体的简短操作建议（观望、做多区域、做空区域）并说明理由。
    不要输出任何免责声明，直接输出干货分析。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "暂时无法分析数据。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "分析生成失败，请检查网络或 API 设置。";
  }
};