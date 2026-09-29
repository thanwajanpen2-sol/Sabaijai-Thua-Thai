import React, { useState } from 'react';
import { Repeat, Volume2, Copy, Check, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { translateCrossDialect } from '../services/dialectService';
import { speakThaiText } from '../utils/audioHelper';

interface CrossDialectTranslatorProps {
  initialText?: string;
  initialSourceDialect?: string;
}

export const CrossDialectTranslator: React.FC<CrossDialectTranslatorProps> = ({
  initialText = 'กินข้าวหรือยัง?',
  initialSourceDialect = 'ไทยกลาง',
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [targetDialect, setTargetDialect] = useState<'central' | 'north' | 'northeast' | 'south'>('south');
  const [sourceDialect, setSourceDialect] = useState(initialSourceDialect);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<any>({
    translatedText: 'กินข้าวแล้วหม้าย?',
    confidence: 94,
    confidenceNote: 'รูปแบบคำถามทักทายเอกลักษณ์ภาษาใต้ตอนกลาง',
    notes: 'ใช้ "หม้าย" แทนคำว่า "หรือยัง" เป็นการถามไถ่ทั่วไป',
    pronunciationGuide: 'ออกเสียงกระชับ ห้วนสั้น ท้ายประโยคสูง',
  });
  const [copied, setCopied] = useState(false);

  const dialectOptions: Array<{ code: 'central' | 'north' | 'northeast' | 'south'; label: string; flag: string; color: string }> = [
    { code: 'central', label: 'ไทยกลาง', flag: '🇹🇭', color: 'sky' },
    { code: 'north', label: 'ภาษาเหนือ (คำเมือง)', flag: '🌺', color: 'indigo' },
    { code: 'northeast', label: 'ภาษาอีสาน', flag: '🌾', color: 'emerald' },
    { code: 'south', label: 'ภาษาใต้', flag: '🌴', color: 'amber' },
  ];

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const res = await translateCrossDialect(inputText, targetDialect, sourceDialect);
      setTranslationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (text: string, region: string) => {
    let rate = 0.95;
    if (region === 'south') rate = 1.1;
    if (region === 'north') rate = 0.88;
    speakThaiText(text, { rate });
  };

  const handleCopy = () => {
    if (!translationResult?.translatedText) return;
    navigator.clipboard.writeText(translationResult.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/90 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Repeat className="h-5 w-5 text-[#00C2A8]" />
            <span>🔄 เครื่องมือแปลข้ามภาษาถิ่น (Cross-Dialect Translator)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            แปลงข้อความระหว่าง 4 ภาษาถิ่นหลักอย่างเป็นธรรมชาติ พร้อมคำแนะนำการออกเสียงและระดับความมั่นใจ
          </p>
        </div>

        <form onSubmit={handleTranslate} className="space-y-5">
          {/* Input text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                ข้อความต้นฉบับ (Original Phrase):
              </label>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">ภาษาต้นทาง:</span>
                <select
                  value={sourceDialect}
                  onChange={(e) => setSourceDialect(e.target.value)}
                  className="rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#6C63FF]"
                >
                  <option value="ไทยกลาง">ไทยกลาง</option>
                  <option value="ภาษาเหนือ">ภาษาเหนือ</option>
                  <option value="ภาษาอีสาน">ภาษาอีสาน</option>
                  <option value="ภาษาใต้">ภาษาใต้</option>
                  <option value="ไม่ระบุ">ตรวจหาอัตโนมัติ</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์ข้อความที่ต้องการแปล เช่น กินข้าวหรือยัง?, อร่อยมาก, ไปไหนมา..."
              className="w-full rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all resize-none"
            />
          </div>

          {/* Quick Preset Samples */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">ลองประโยคตัวอย่าง:</span>
            {[
              'กินข้าวหรือยัง?',
              'อาหารจานนี้อร่อยมากๆ',
              'คิดถึงเธอมากๆ เลยนะ',
              'คุณจะไปไหนวันนี้?',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setInputText(sample);
                  setSourceDialect('ไทยกลาง');
                }}
                className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-slate-300 hover:bg-[#6C63FF]/20 hover:text-white transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>

          {/* Target dialect selector: [ ไทยกลาง ] [ เหนือ ] [ อีสาน ] [ ใต้ ] */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              แปลเป็น (Target Dialect):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {dialectOptions.map((opt) => {
                const isSelected = targetDialect === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setTargetDialect(opt.code)}
                    className={`flex items-center justify-center space-x-2 rounded-xl py-3 px-3 text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white border-[#A78BFA] shadow-lg shadow-[#6C63FF]/25 scale-[1.02]'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isTranslating || !inputText.trim()}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#00C2A8] to-emerald-400 px-6 py-2.5 text-sm font-bold text-[#0B1020] hover:opacity-95 shadow-lg shadow-[#00C2A8]/20 disabled:opacity-40 transition-all"
            >
              {isTranslating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1020] border-t-transparent" />
                  <span>กำลังแปล...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>แปลภาษาถิ่น</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {translationResult && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#141E38] to-[#0E1528] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">ผลการแปลเป็น:</span>
              <span className="text-xs font-bold text-[#00C2A8] bg-[#00C2A8]/10 border border-[#00C2A8]/30 px-2.5 py-0.5 rounded-full">
                {dialectOptions.find((d) => d.code === targetDialect)?.label}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">ความมั่นใจ:</span>
              <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                {translationResult.confidence}%
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Translated Box */}
            <div className="rounded-xl border border-[#00C2A8]/40 bg-black/40 p-5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  คำแปลภาษาถิ่น:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSpeak(translationResult.translatedText, targetDialect)}
                    className="flex items-center space-x-1 text-xs text-slate-300 hover:text-[#00C2A8] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>ฟังเสียง</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-white tracking-wide">
                "{translationResult.translatedText}"
              </p>
            </div>

            {/* Confidence warning if uncertain */}
            {translationResult.confidence < 75 && (
              <div className="flex items-start space-x-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  <strong>ข้อสังเกต:</strong> AI ไม่มั่นใจว่าคำแปลนี้เป็นรูปแบบที่ใช้จริงในพื้นที่ดังกล่าว กรุณาตรวจสอบกับผู้ใช้ภาษาถิ่นในพื้นที่เพิ่มเติม
                </p>
              </div>
            )}

            {/* Linguistic Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {translationResult.pronunciationGuide && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <span className="font-bold text-[#FFD166] block mb-1">
                    🗣️ การออกเสียงและสำเนียง:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {translationResult.pronunciationGuide}
                  </p>
                </div>
              )}

              {translationResult.notes && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <span className="font-bold text-[#A78BFA] block mb-1">
                    💡 คำอธิบายบริบท:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {translationResult.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
