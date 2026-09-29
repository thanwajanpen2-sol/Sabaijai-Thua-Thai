import React, { useState } from 'react';
import {
  Volume2,
  Star,
  Copy,
  Check,
  Repeat,
  Sparkles,
  BookOpen,
  Info,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { DialectAnalysisResult } from '../types/dialect';
import { speakThaiText } from '../utils/audioHelper';

interface TranslationCardProps {
  result: DialectAnalysisResult;
  isFavorite: boolean;
  onToggleFavorite: (result: DialectAnalysisResult) => void;
  onOpenCrossTranslate?: (text: string, sourceDialect: string) => void;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  result,
  isFavorite,
  onToggleFavorite,
  onOpenCrossTranslate,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'meaning' | 'words' | 'culture' | 'cross'>('meaning');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = () => {
    const textToCopy = `[${result.dialect}] ${result.detectedSpeech}\n→ ภาษาไทยกลาง: ${result.centralThai}\nความหมาย: ${result.context.summaryExplanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, dialect?: string) => {
    setIsPlayingAudio(true);
    let pitch = 1.0;
    let rate = 0.95;

    if (dialect?.includes('ใต้')) {
      rate = 1.1; // Southern dialect is faster
      pitch = 1.05;
    } else if (dialect?.includes('เหนือ')) {
      rate = 0.88; // Northern dialect is slower/smoother
      pitch = 0.98;
    } else if (dialect?.includes('อีสาน')) {
      rate = 1.02;
    }

    speakThaiText(text, { pitch, rate });
    setTimeout(() => setIsPlayingAudio(false), 2200);
  };

  // Region Badge Styling
  const getDialectBadge = (dialect: string, region: string) => {
    if (dialect === 'ไม่แน่ใจ' || region === 'unknown') {
      return {
        bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        dot: 'bg-slate-400',
      };
    }
    if (dialect.includes('ใต้') || region === 'south') {
      return {
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    }
    if (dialect.includes('เหนือ') || region === 'north') {
      return {
        bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        dot: 'bg-indigo-400',
      };
    }
    if (dialect.includes('อีสาน') || region === 'northeast') {
      return {
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    return {
      bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      dot: 'bg-sky-400',
    };
  };

  const badge = getDialectBadge(result.dialect, result.regionCode);

  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#141E38]/95 to-[#0E1528]/95 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300">
      {/* 1. Header: Detected Dialect & Confidence */}
      <div className="border-b border-white/10 bg-white/[0.03] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
              <span>🎙️ ภาษาที่ตรวจพบ:</span>
            </span>
            <div className={`flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}>
              <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
              <span>{result.dialect}</span>
            </div>
            {result.isDemo && (
              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                Demo Evaluation
              </span>
            )}
          </div>

          {/* Confidence Meter */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xs text-slate-400 font-medium">Confidence:</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 sm:w-28 bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.confidence >= 80
                      ? 'bg-gradient-to-r from-[#00C2A8] to-emerald-400'
                      : result.confidence >= 60
                      ? 'bg-gradient-to-r from-amber-400 to-[#FFD166]'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, result.confidence))}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white">
                {result.confidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Reason */}
        <p className="mt-2 text-xs text-slate-300 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 text-[#00C2A8] shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">Reason:</strong> {result.reason}
          </span>
        </p>
      </div>

      {/* 2. Detected Speech vs Central Thai */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* สิ่งที่ AI ได้ยิน */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FFD166] uppercase tracking-wider flex items-center gap-1.5">
                <span>สิ่งที่ AI ได้ยิน</span>
              </span>
              <button
                onClick={() => handleSpeak(result.detectedSpeech, result.dialect)}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-[#00C2A8] transition-colors"
                title="ฟังเสียงต้นฉบับ"
              >
                <Volume2 className={`h-3.5 w-3.5 ${isPlayingAudio ? 'animate-bounce text-[#00C2A8]' : ''}`} />
                <span>ฟังเสียง</span>
              </button>
            </div>
            <p className="mt-2 text-xl font-bold text-white tracking-wide">
              "{result.detectedSpeech}"
            </p>
          </div>

          {/* ภาษาไทยกลาง */}
          <div className="rounded-xl border border-[#00C2A8]/30 bg-[#00C2A8]/5 p-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#00C2A8] uppercase tracking-wider flex items-center gap-1.5">
                <span>🇹🇭 ภาษาไทยกลาง</span>
              </span>
              <button
                onClick={() => handleSpeak(result.centralThai, 'กลาง')}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-[#00C2A8] transition-colors"
                title="ฟังเสียงภาษาไทยกลาง"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>ฟังเสียง</span>
              </button>
            </div>
            <p className="mt-2 text-xl font-bold text-[#5EEAD4] tracking-wide">
              "{result.centralThai}"
            </p>
          </div>
        </div>

        {/* Tabs for In-depth Context */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('meaning')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'meaning'
                  ? 'bg-[#6C63FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>💡 บริบทและความหมาย</span>
            </button>

            <button
              onClick={() => setActiveTab('words')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'words'
                  ? 'bg-[#6C63FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>📖 คำศัพท์สำคัญ ({result.context.keyWords?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('culture')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'culture'
                  ? 'bg-[#6C63FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>🏛️ รู้จักภาษาถิ่นนี้</span>
            </button>

            <button
              onClick={() => setActiveTab('cross')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'cross'
                  ? 'bg-[#6C63FF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>🔄 แปลข้ามภาษาถิ่น</span>
            </button>
          </div>

          {/* Tab Content: Meaning & Context */}
          {activeTab === 'meaning' && (
            <div className="pt-3 space-y-3">
              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>💡 ความหมายโดยสรุป</span>
                </span>
                <p className="mt-1 text-sm text-slate-200 leading-relaxed">
                  {result.context.summaryExplanation}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">ระดับความสุภาพ (Level)</span>
                  <span className="mt-1 text-xs font-semibold text-[#FFD166] block">
                    {result.context.formality || 'ภาษาพูด / เป็นกันเอง'}
                  </span>
                </div>
                <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">เหมาะใช้กับใคร (Audience)</span>
                  <span className="mt-1 text-xs font-semibold text-[#00C2A8] block">
                    {result.context.suitableAudience || 'เพื่อน ครอบครัว คนสนิท'}
                  </span>
                </div>
                <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">อารมณ์/น้ำเสียง (Tone)</span>
                  <span className="mt-1 text-xs font-semibold text-[#A78BFA] block">
                    {result.context.toneAndEmotion || 'อบอุ่น เป็นกันเอง'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Key Words Breakdown */}
          {activeTab === 'words' && (
            <div className="pt-3 space-y-2.5">
              {result.context.keyWords && result.context.keyWords.length > 0 ? (
                result.context.keyWords.map((kw, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-black/20 p-3.5 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-[#FFD166]">
                          "{kw.word}"
                        </span>
                        <span className="text-xs text-slate-400">หมายถึง:</span>
                        <span className="text-sm font-semibold text-white">
                          "{kw.meaning}"
                        </span>
                      </div>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                        ระดับ: {kw.politeness}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                      <div>
                        <strong className="text-slate-400">การใช้งาน:</strong> {kw.suitableFor}
                      </div>
                      <div>
                        <strong className="text-slate-400">บริบท:</strong> {kw.contextualMeaning}
                      </div>
                      {kw.otherMeanings && (
                        <div className="sm:col-span-2 text-slate-400">
                          <strong>ความหมายอื่น:</strong> {kw.otherMeanings}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">ไม่มีคำศัพท์ย่อยที่ต้องแยกวิเคราะห์</p>
              )}
            </div>
          )}

          {/* Tab Content: Cultural Context */}
          {activeTab === 'culture' && (
            <div className="pt-3 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="font-bold text-[#00C2A8] block mb-0.5">
                    📍 ภาษานี้พบในพื้นที่ใด:
                  </span>
                  <p className="text-slate-300">{result.culturalContext.originRegion}</p>
                </div>

                <div>
                  <span className="font-bold text-[#FFD166] block mb-0.5">
                    📜 คำนี้มีที่มาอย่างไร:
                  </span>
                  <p className="text-slate-300">{result.culturalContext.etymology}</p>
                </div>

                <div>
                  <span className="font-bold text-[#A78BFA] block mb-0.5">
                    💬 ใช้ในสถานการณ์ใด:
                  </span>
                  <p className="text-slate-300">{result.culturalContext.usageSituation}</p>
                </div>

                <div>
                  <span className="font-bold text-sky-400 block mb-0.5">
                    ⚖️ ความแตกต่างจากภาษาไทยกลาง:
                  </span>
                  <p className="text-slate-300">{result.culturalContext.differenceFromCentral}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Cross-Dialect Translations */}
          {activeTab === 'cross' && (
            <div className="pt-3 space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                เปรียบเทียบประโยคนี้ใน 4 ภาษาถิ่นหลัก:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Central */}
                <div className="rounded-xl border border-white/5 bg-black/25 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      🇹🇭 ภาษาไทยกลาง
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      "{result.crossTranslations?.central || result.centralThai}"
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(result.crossTranslations?.central || result.centralThai, 'กลาง')}
                    className="p-1.5 text-slate-400 hover:text-sky-400"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                {/* North */}
                <div className="rounded-xl border border-white/5 bg-black/25 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      🌺 ภาษาเหนือ (คำเมือง)
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      "{result.crossTranslations?.north || 'กิ๋นข้าวแล้วก๋า?'}"
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(result.crossTranslations?.north || '', 'เหนือ')}
                    className="p-1.5 text-slate-400 hover:text-indigo-400"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Northeast */}
                <div className="rounded-xl border border-white/5 bg-black/25 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      🌾 ภาษาอีสาน
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      "{result.crossTranslations?.northeast || 'กินข้าวแล้วบ่?'}"
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(result.crossTranslations?.northeast || '', 'อีสาน')}
                    className="p-1.5 text-slate-400 hover:text-emerald-400"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                {/* South */}
                <div className="rounded-xl border border-white/5 bg-black/25 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      🌴 ภาษาใต้
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      "{result.crossTranslations?.south || 'กินข้าวแล้วหม้าย?'}"
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(result.crossTranslations?.south || '', 'ใต้')}
                    className="p-1.5 text-slate-400 hover:text-amber-400"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Action Buttons Bar (Requirement: 🔊 ฟังเสียง, ⭐ บันทึก, 📋 คัดลอก, 🔄 แปลเป็นถิ่นอื่น) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            {/* 🔊 ฟังเสียง */}
            <button
              onClick={() => handleSpeak(result.detectedSpeech, result.dialect)}
              className="flex items-center space-x-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-all"
            >
              <Volume2 className="h-4 w-4 text-[#00C2A8]" />
              <span>ฟังเสียง</span>
            </button>

            {/* ⭐ บันทึก */}
            <button
              onClick={() => onToggleFavorite(result)}
              className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all ${
                isFavorite
                  ? 'bg-[#FFD166]/20 text-[#FFD166] border-[#FFD166]/40'
                  : 'bg-white/10 text-slate-300 border-transparent hover:bg-white/15'
              }`}
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-[#FFD166] text-[#FFD166]' : ''}`} />
              <span>{isFavorite ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>

            {/* 📋 คัดลอก */}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/15 hover:text-white transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-400" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>

          {/* 🔄 แปลเป็นถิ่นอื่น */}
          {onOpenCrossTranslate && (
            <button
              onClick={() => onOpenCrossTranslate(result.detectedSpeech, result.dialect)}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow-lg shadow-[#6C63FF]/25 transition-all"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>แปลเป็นถิ่นอื่น</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
