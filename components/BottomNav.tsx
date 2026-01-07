import React from 'react';
import { LayoutDashboard, BarChart2, Layers, Settings as SettingsIcon } from 'lucide-react';

interface BottomNavProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 0, label: '实时行情', icon: LayoutDashboard },
    { id: 1, label: '量化数据', icon: BarChart2 },
    { id: 2, label: '持仓监控', icon: Layers },
    { id: 3, label: '系统设置', icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 z-50 px-6 pb-2">
      <div className="max-w-md mx-auto h-full flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`mb-1.5 transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`} 
              />
              <span className={`text-[10px] font-medium tracking-wide transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;