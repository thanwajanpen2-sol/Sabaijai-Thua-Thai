import React from 'react';
import { Mic, Keyboard, Compass, Sparkles, Volume2, ShieldCheck, ArrowRight, BookOpen, Repeat, MapPin } from 'lucide-react';
import { DEMO_PRESET_VOICE_CLIPS } from '../data/dialectKnowledge';
import { speakThaiText } from '../utils/audioHelper';

interface HomeHeroProps {
  onStartVoice: () => void;
  onStartText: () => void;
  onSelectSample: (phrase: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onStartVoice,
  onStartText,
  onSelectSample,
  onNavigateTab,
}) => {
  const supportedDialects = [
    { name: 'เหนือ (คำเมือง)', icon: '🌺', color: 'from-[#6C63FF]/30 to-[#8B5CF6]/10', border: 'border-[#6C63FF]/30', desc: 'หวาน นุ่มนวล เนิบช้า' },
    { name: 'อีสาน (ไท-ลาว)', icon: '🌾', color: 'from-[#00C2A8]/30 to-emerald-500/10', border: 'border-[#00C2A8]/30', desc: 'กระชับ สดใส ตรงไปตรงมา' },
    { name: 'กลาง (ไทยมาตรฐาน)', icon: '🇹🇭', color: 'from-sky-500/30 to-blue-500/10', border: 'border-sky-500/30', desc: 'นุ่มนวล เป็นทางการ ไพเราะ' },
    { name: 'ใต้ (ปักษ์ใต้)', icon: '🌴', color: 'from-[#FFD166]/30 to-amber-500/10', border: 'border-[#FFD166]/30', desc: 'กระชับ ตัดพยางค์ พูดเร็ว' },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141E38]/90 via-[#0F172A]/95 to-[#0B1020] p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
        {/* Glow ambient spots */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#6C63FF]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#00C2A8]/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#00C2A8]/30 bg-[#00C2A8]/10 px-4 py-1.5 text-xs font-semibold text-[#00C2A8]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>AI Language & Culture Assistant สัญชาติไทย</span>
          </div>

          {/* Heading (Exactly from prompt requirement) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            เข้าใจทุกสำเนียง <br />
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#A78BFA] to-[#00C2A8] bg-clip-text text-transparent">
              ด้วย AI
            </span>
          </h1>

          {/* Slogan & Description (Prompt requirement) */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            พูดภาษาถิ่นของคุณ แล้วให้ AI ช่วยฟัง วิเคราะห์ แปล และอธิบายความหมาย
            พร้อมเปิดมิติวัฒนธรรมและบริบทของทุกคำพูด
          </p>

          {/* CTA Action Buttons: [ 🎙️ เริ่มพูด ] และ [ ⌨️ พิมพ์ข้อความ ] */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={onStartVoice}
              className="flex items-center space-x-2.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-[#6C63FF]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic className="h-5 w-5" />
              <span>เริ่มพูด</span>
            </button>

            <button
              onClick={onStartText}
              className="flex items-center space-x-2.5 rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-white/15 hover:border-white/30 active:scale-95 transition-all"
            >
              <Keyboard className="h-5 w-5 text-slate-300" />
              <span>พิมพ์ข้อความ</span>
            </button>
          </div>

          {/* Supported Dialects Section (Prompt requirement: [ เหนือ ] [ อีสาน ] [ กลาง ] [ ใต้ ]) */}
          <div className="pt-8 border-t border-white/10 mt-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-4">
              รองรับภาษาถิ่น (Supported Dialects)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {supportedDialects.map((d, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab('map')}
                  className={`cursor-pointer rounded-2xl border ${d.border} bg-gradient-to-b ${d.color} p-3.5 text-center hover:scale-105 transition-all group`}
                >
                  <span className="text-2xl block mb-1">{d.icon}</span>
                  <span className="text-xs font-bold text-white block group-hover:text-[#00C2A8] transition-colors">
                    {d.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {d.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Sound Bites Sample Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-[#FFD166]" />
              <span>ลองฟังสำเนียงและทดสอบวิเคราะห์ทันที</span>
            </h2>
            <p className="text-xs text-slate-400">
              คลิกฟังเสียงตัวอย่าง หรือกด "วิเคราะห์" เพื่อส่งเข้าเครื่องมือถอดความหมาย
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('voice')}
            className="hidden sm:flex items-center space-x-1 text-xs text-[#00C2A8] hover:underline"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DEMO_PRESET_VOICE_CLIPS.slice(0, 3).map((clip) => (
            <div
              key={clip.id}
              className="rounded-2xl border border-white/10 bg-[#121A31]/80 p-4 shadow-lg hover:border-[#6C63FF]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#00C2A8]">
                    {clip.dialect}
                  </span>
                  <button
                    onClick={() => speakThaiText(clip.text)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="ฟังเสียงสำเนียงนี้"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-2 text-base font-bold text-white">
                  "{clip.text}"
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  แปล: {clip.meaning}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 italic">
                  💡 {clip.tip}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => onSelectSample(clip.text)}
                  className="flex items-center space-x-1 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/30 px-3 py-1 text-xs font-semibold text-[#A78BFA] hover:bg-[#6C63FF] hover:text-white transition-all"
                >
                  <span>วิเคราะห์ด้วย AI</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => onNavigateTab('cross')}
          className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-[#141E38]/70 to-[#0E1528]/80 p-6 shadow-lg hover:border-[#00C2A8]/40 hover:-translate-y-1 transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#00C2A8]/10 border border-[#00C2A8]/30 flex items-center justify-center text-[#00C2A8] mb-4 group-hover:scale-110 transition-transform">
            <Repeat className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#00C2A8] transition-colors">
            แปลข้ามภาษาถิ่น (Cross-Dialect)
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            แปลงคำพูดระหว่าง ไทยกลาง, เหนือ, อีสาน, ใต้ ได้อย่างเป็นธรรมชาติพร้อมประเมินระดับความมั่นใจ
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('map')}
          className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-[#141E38]/70 to-[#0E1528]/80 p-6 shadow-lg hover:border-[#6C63FF]/40 hover:-translate-y-1 transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF] mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#6C63FF] transition-colors">
            แผนที่ภาษาถิ่น 4 ภาค (Interactive Map)
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            สำรวจแผนภาพประเทศไทย เจาะลึกระบบเสียง วรรณยุกต์ และตัวอย่างบทสนทนาประจำแต่ละภาค
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('chat')}
          className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-[#141E38]/70 to-[#0E1528]/80 p-6 shadow-lg hover:border-[#FFD166]/40 hover:-translate-y-1 transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/30 flex items-center justify-center text-[#FFD166] mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#FFD166] transition-colors">
            ถาม AI เรื่องบริบทและวัฒนธรรม
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            ปรึกษา AI เมื่อไม่แน่ใจว่าคำศัพท์นี้สุภาพไหม พูดกับผู้ใหญ่ได้หรือไม่ หรือมีที่มาจากอะไร
          </p>
        </div>
      </div>
    </div>
  );
};
