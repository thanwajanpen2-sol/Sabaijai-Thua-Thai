import React from 'react';
import { Sparkles, Compass, Volume2, ShieldCheck, Info } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab: _currentTab,
  onSelectTab,
  isDemoMode,
  onToggleDemoMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Slogan */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#00C2A8] p-0.5 shadow-lg shadow-[#6C63FF]/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B1020]">
              <Compass className="h-5 w-5 text-[#00C2A8] group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FFD166] text-[8px] font-bold text-black">
              AI
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#A78BFA] transition-colors">
                Sabaijai <span className="text-[#00C2A8]">Thua Thai</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#6C63FF]/20 text-[#A78BFA] border border-[#6C63FF]/30">
                สบายใจทั่วไทย
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              ฟังภาษาถิ่น เข้าใจทุกสำเนียง 4 ภาค
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Voice Shortcut */}
          <button
            onClick={() => onSelectTab('voice')}
            className="hidden md:flex items-center space-x-1.5 rounded-lg bg-[#6C63FF]/20 px-3 py-1.5 text-xs font-medium text-[#A78BFA] hover:bg-[#6C63FF]/30 border border-[#6C63FF]/30 transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>เริ่มฟังเสียง</span>
          </button>

          {/* Mode Switcher / Indicator */}
          <button
            onClick={onToggleDemoMode}
            title="คลิกเพื่อสลับระหว่างโหมด AI Real-time และ Demo Fallback"
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
              isDemoMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            {isDemoMode ? (
              <>
                <Info className="h-3.5 w-3.5" />
                <span>Demo Mode</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Live Ready</span>
              </>
            )}
          </button>

          {/* Trust badge */}
          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00C2A8]" />
            <span>4 ภูมิภาคไทย</span>
          </div>
        </div>
      </div>
    </header>
  );
};
