import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '030452Gl') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-gray-200">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]">
                 <ShieldCheck size={32} className="text-gray-200" />
            </div>
        </div>
        
        <h1 className="text-2xl font-light text-center mb-2 tracking-wide text-white">QuantFlow</h1>
        <p className="text-xs text-gray-500 text-center mb-10 tracking-[0.2em] uppercase">智能量化终端访问</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={16} className={`text-gray-500 transition-colors ${error ? 'text-red-500' : 'group-focus-within:text-white'}`} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`
                w-full bg-[#0a0a0a] border text-sm rounded-xl block w-full pl-10 p-4 outline-none transition-all placeholder:text-gray-700
                ${error ? 'border-red-500/50 text-red-500' : 'border-white/10 focus:border-white/30 text-white'}
              `}
              placeholder="请输入访问密钥"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-white/10 font-medium rounded-xl text-sm px-5 py-4 text-center flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            进入系统 <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] text-gray-700 font-mono">
          SECURE CONNECTION ENCRYPTED
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;