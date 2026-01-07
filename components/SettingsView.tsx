import React, { useState } from 'react';
import { Settings } from '../types';
import { Save, Eye, EyeOff, KeyRound, Globe, Server, Radio } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onSave: (s: Settings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showSecrets, setShowSecrets] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleChange = (key: keyof Settings, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onSave(localSettings);
    setTimeout(() => setSaveStatus('saved'), 800);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-light text-white mb-2">系统参数设置</h2>
          <p className="text-xs text-gray-500">配置交易所 API 连接与 AI 密钥</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Section 1: Connection Mode */}
          <section>
             <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Server size={16} /> 数据源连接模式
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    onClick={() => handleChange('useRealData', false)}
                    className={`cursor-pointer border rounded-2xl p-4 transition-all ${!localSettings.useRealData ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!localSettings.useRealData ? 'border-green-500' : 'border-gray-600'}`}>
                            {!localSettings.useRealData && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                        <span className="text-sm font-medium text-white">模拟回测 (Simulation)</span>
                    </div>
                    <p className="text-[10px] text-gray-500 pl-7">使用内置随机游走算法生成市场数据，用于策略测试。</p>
                </div>

                <div 
                    onClick={() => handleChange('useRealData', true)}
                    className={`cursor-pointer border rounded-2xl p-4 transition-all ${localSettings.useRealData ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${localSettings.useRealData ? 'border-blue-500' : 'border-gray-600'}`}>
                            {localSettings.useRealData && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <span className="text-sm font-medium text-white">实盘连接 (OKX API)</span>
                    </div>
                    <p className="text-[10px] text-gray-500 pl-7">通过 WebSocket/Rest API 连接欧易交易所获取实时数据。</p>
                </div>
             </div>
          </section>

          {/* Section 2: OKX API */}
          <section className="space-y-4">
             <div className="flex justify-between items-end">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <KeyRound size={16} /> 欧易 (OKX) API 配置
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  {showSecrets ? <EyeOff size={12}/> : <Eye size={12}/>}
                  {showSecrets ? '隐藏敏感信息' : '显示敏感信息'}
                </button>
             </div>
             
             <div className="grid grid-cols-1 gap-5 bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider ml-1">API Key</label>
                    <input 
                        type={showSecrets ? "text" : "password"}
                        value={localSettings.apiKey}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all font-mono placeholder:text-gray-800"
                        placeholder="输入您的 OKX API Key"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider ml-1">Secret Key</label>
                        <input 
                            type={showSecrets ? "text" : "password"}
                            value={localSettings.secretKey}
                            onChange={(e) => handleChange('secretKey', e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all font-mono placeholder:text-gray-800"
                            placeholder="输入 Secret Key"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider ml-1">Passphrase</label>
                        <input 
                            type={showSecrets ? "text" : "password"}
                            value={localSettings.passphrase}
                            onChange={(e) => handleChange('passphrase', e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all font-mono placeholder:text-gray-800"
                            placeholder="输入 Passphrase"
                        />
                    </div>
                </div>
             </div>
          </section>

          {/* Section 3: Misc */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                    <Globe size={14} /> Gemini API 密钥
                </label>
                <input 
                    type={showSecrets ? "text" : "password"}
                    value={localSettings.geminiApiKey}
                    onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-blue-500/50 outline-none"
                    placeholder="AI Studio API Key"
                />
             </div>
             <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                    <Globe size={14} /> CORS 代理 (Web 端必需)
                </label>
                <input 
                    type="text" 
                    value={localSettings.proxyUrl}
                    onChange={(e) => handleChange('proxyUrl', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-blue-500/50 outline-none"
                    placeholder="Proxy URL"
                />
             </div>
          </section>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            className={`
                flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all min-w-[140px] justify-center
                ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-200'}
            `}
          >
            {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
            {saveStatus === 'idle' && <Save size={16} />}
            {saveStatus === 'idle' && '保存配置'}
            {saveStatus === 'saving' && '保存中...'}
            {saveStatus === 'saved' && '已保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;