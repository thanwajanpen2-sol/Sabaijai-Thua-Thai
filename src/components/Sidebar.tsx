import React from 'react';
import {
  Home,
  Mic,
  Repeat,
  MapPin,
  BookOpen,
  Star,
  History,
  Bot,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  favoritesCount?: number;
  historyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount = 0,
  historyCount = 0,
}) => {
  const menuItems = [
    { id: 'home', label: 'หน้าหลัก', icon: Home, badge: null },
    { id: 'voice', label: 'แปลจากเสียง', icon: Mic, badge: 'AI' },
    { id: 'cross', label: 'แปลข้ามภาษาถิ่น', icon: Repeat, badge: null },
    { id: 'map', label: 'แผนที่ภาษาถิ่น', icon: MapPin, badge: '4 ภาค' },
    { id: 'dictionary', label: 'พจนานุกรม', icon: BookOpen, badge: null },
    {
      id: 'favorites',
      label: 'คำที่บันทึก',
      icon: Star,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'history',
      label: 'ประวัติ',
      icon: History,
      badge: historyCount > 0 ? historyCount : null,
    },
    { id: 'chat', label: 'ถาม AI เรื่องภาษาถิ่น', icon: Bot, badge: 'ใหม่' },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#0B1020]/90 p-4 shrink-0">
      <div className="space-y-1 mb-6">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          เมนูหลัก (Navigation)
        </p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#6C63FF]/25 to-[#00C2A8]/10 text-white border border-[#6C63FF]/40 shadow-sm shadow-[#6C63FF]/10'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? 'text-[#00C2A8]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? 'bg-[#00C2A8] text-[#0B1020]'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Culture Tip Card */}
      <div className="mt-auto pt-4">
        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-3.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#FFD166]">
            <Sparkles className="h-4 w-4" />
            <span>เกร็ดภาษาถิ่นวันนี้</span>
          </div>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            "กินข้าวแล้วหม้าย" ในภาษาใต้ กร่อนเสียงจาก "หรือไม่" ใช้ทักทายไต่ถามสุขทุกข์ คล้ายคำว่า "สบายดีไหม"
          </p>
        </div>
      </div>
    </aside>
  );
};
