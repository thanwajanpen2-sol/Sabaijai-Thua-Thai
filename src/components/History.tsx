import React, { useState } from 'react';
import { History as HistoryIcon, Volume2, Trash2, ChevronRight, Eye, Calendar, Sparkles } from 'lucide-react';
import { DialectAnalysisResult } from '../types/dialect';
import { speakThaiText } from '../utils/audioHelper';

interface HistoryProps {
  historyItems: DialectAnalysisResult[];
  onSelectItem: (item: DialectAnalysisResult) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({
  historyItems,
  onSelectItem,
  onClearHistory,
  onRemoveItem,
}) => {
  const [selectedDetailItem, setSelectedDetailItem] = useState<DialectAnalysisResult | null>(null);

  const handleSpeak = (text: string, dialect?: string) => {
    let rate = 0.95;
    if (dialect?.includes('ใต้')) rate = 1.1;
    if (dialect?.includes('เหนือ')) rate = 0.88;
    speakThaiText(text, { rate });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/90 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-[#00C2A8]" />
              <span>🕘 ประวัติการวิเคราะห์และแปลภาษาถิ่น (History)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              บันทึกรายการเสียงพูดและข้อความภาษาถิ่นที่คุณเคยวิเคราะห์ไว้ (เก็บใน LocalStorage)
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>ล้างประวัติทั้งหมด</span>
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {historyItems.length > 0 ? (
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141E38]/90 to-[#0E1528]/90 p-5 shadow-lg hover:border-[#6C63FF]/40 transition-all group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.timestamp}</span>
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.regionCode === 'south'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.regionCode === 'north'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : item.regionCode === 'northeast'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {item.dialect}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    ความมั่นใจ {item.confidence}%
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Speech and translation comparison */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/30 border border-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      สิ่งที่ AI ได้ยิน:
                    </span>
                    <button
                      onClick={() => handleSpeak(item.detectedSpeech, item.dialect)}
                      className="text-slate-400 hover:text-[#00C2A8]"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-base font-bold text-white">
                    "{item.detectedSpeech}"
                  </p>
                </div>

                <div className="rounded-xl bg-[#00C2A8]/5 border border-[#00C2A8]/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-[#00C2A8]">
                      🇹🇭 ภาษาไทยกลาง:
                    </span>
                    <button
                      onClick={() => handleSpeak(item.centralThai, 'กลาง')}
                      className="text-slate-400 hover:text-[#00C2A8]"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-base font-bold text-[#5EEAD4]">
                    "{item.centralThai}"
                  </p>
                </div>
              </div>

              {/* Context Summary & Action */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                <p className="text-slate-400 text-[11px] truncate max-w-lg">
                  💡 <strong>ความหมาย:</strong> {item.context?.summaryExplanation || item.reason}
                </p>

                <button
                  onClick={() => onSelectItem(item)}
                  className="flex items-center space-x-1 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/40 px-3 py-1.5 text-xs font-semibold text-[#A78BFA] hover:bg-[#6C63FF] hover:text-white transition-all ml-auto"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>ดูผลวิเคราะห์แบบเต็ม</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-12 text-center">
          <HistoryIcon className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-white">
            ยังไม่มีประวัติการแปล
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            เมื่อคุณทดลองบันทึกเสียงหรือแปลภาษาถิ่น รายการจะถูกบันทึกไว้ที่นี่เพื่อให้คุณกลับมาดูได้ทุกเมื่อ
          </p>
        </div>
      )}
    </div>
  );
};
