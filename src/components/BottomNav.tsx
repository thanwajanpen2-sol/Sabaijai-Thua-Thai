import React from 'react';
import { Home, Mic, Repeat, MapPin, BookOpen, Star, Bot } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  favoritesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount = 0,
}) => {
  const tabs = [
    { id: 'home', label: 'หน้าหลัก', icon: Home },
    { id: 'voice', label: 'เสียง', icon: Mic },
    { id: 'cross', label: 'แปลข้ามถิ่น', icon: Repeat },
    { id: 'map', label: 'แผนที่', icon: MapPin },
    { id: 'dictionary', label: 'พจนานุกรม', icon: BookOpen },
    { id: 'favorites', label: 'ที่บันทึก', icon: Star, count: favoritesCount },
    { id: 'chat', label: 'AI Chat', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/10 bg-[#0B1020]/95 backdrop-blur-lg px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-[#00C2A8]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FFD166] text-[8px] font-bold text-black">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
