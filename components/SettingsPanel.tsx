import React, { useState } from 'react';
import { Settings } from '../types';
import { X, Save, Eye, EyeOff, KeyRound, Globe } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (s: Settings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showSecrets, setShowSecrets] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key: keyof Settings, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-lg font-medium text-white">系统设置</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Data Source Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">实盘数据连接</p>
              <p className="text-xs text-gray-500 mt-1">启用 WebSocket/API 实时获取欧易数据</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={localSettings.useRealData}
                onChange={(e) => handleChange('useRealData', e.target.checked)}
              />
              <div className="w-10 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="space-y-5">
             <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <Globe size={14} /> CORS 代理地址 (浏览器端必需)
              </label>
              <input 
                type="text" 
                value={localSettings.proxyUrl}
                onChange={(e) => handleChange('proxyUrl', e.target.value)}
                placeholder="例如: https://cors-anywhere.herokuapp.com/"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="relative">
               <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <KeyRound size={14} /> Gemini API 密钥
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-[10px] text-primary-500 hover:text-primary-400 flex items-center gap-1 transition-colors"
                >
                  {showSecrets ? <EyeOff size={12}/> : <Eye size={12}/>}
                  {showSecrets ? '隐藏' : '显示'}
                </button>
               </div>
              <input 
                type={showSecrets ? "text" : "password"}
                value={localSettings.geminiApiKey}
                onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                placeholder="输入 Google AI Studio Key"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="border-t border-white/5 pt-5">
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-4 tracking-wider">OKX 交易所凭证 (本地加密存储)</p>
              <div className="space-y-3">
                <input 
                  type={showSecrets ? "text" : "password"}
                  value={localSettings.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="API Key"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-primary-500 outline-none transition-all placeholder:text-gray-700"
                />
                 <input 
                  type={showSecrets ? "text" : "password"}
                  value={localSettings.secretKey}
                  onChange={(e) => handleChange('secretKey', e.target.value)}
                  placeholder="Secret Key"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-primary-500 outline-none transition-all placeholder:text-gray-700"
                />
                 <input 
                  type={showSecrets ? "text" : "password"}
                  value={localSettings.passphrase}
                  onChange={(e) => handleChange('passphrase', e.target.value)}
                  placeholder="Passphrase"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-primary-500 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
          >
            <Save size={16} />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;