import React, { useState } from 'react';
import { Star, Volume2, Trash2, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { DictionaryItem } from '../types/dialect';
import { speakThaiText } from '../utils/audioHelper';

interface FavoritesProps {
  favorites: DictionaryItem[];
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
  onAnalyzeWord: (word: string) => void;
  onNavigateToDictionary: () => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  onRemoveFavorite,
  onClearAll,
  onAnalyzeWord,
  onNavigateToDictionary,
}) => {
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const filteredFavorites = favorites.filter(
    (item) => regionFilter === 'all' || item.region === regionFilter
  );

  const handleSpeak = (text: string, region: string) => {
    let rate = 0.95;
    if (region === 'south') rate = 1.1;
    if (region === 'north') rate = 0.88;
    speakThaiText(text, { rate });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/90 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-[#FFD166] fill-[#FFD166]" />
              <span>⭐ คำที่บันทึก (My Dialect)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              คอลเลกชันคำศัพท์และสำนวนภาษาถิ่นที่คุณชื่นชอบ เก็บข้อมูลไว้ในเบราว์เซอร์ (LocalStorage)
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>ล้างทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Region Filter Bar */}
        {favorites.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: 'all', label: `ทั้งหมด (${favorites.length})` },
              { id: 'north', label: 'ภาษาเหนือ' },
              { id: 'northeast', label: 'ภาษาอีสาน' },
              { id: 'south', label: 'ภาษาใต้' },
              { id: 'central', label: 'ภาษากลาง' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRegionFilter(opt.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  regionFilter === opt.id
                    ? 'bg-[#FFD166] text-[#0B1020] font-bold shadow-md shadow-[#FFD166]/20'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Favorite Words */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141E38]/90 to-[#0E1528]/90 p-5 shadow-lg space-y-3 relative group hover:border-[#FFD166]/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white group-hover:text-[#FFD166] transition-colors">
                      ⭐ {item.word}
                    </span>
                    <button
                      onClick={() => handleSpeak(item.word, item.region)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#00C2A8]"
                      title="ฟังเสียง"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span
                    className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.region === 'south'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.region === 'north'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : item.region === 'northeast'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {item.regionLabel}
                  </span>
                </div>

                <button
                  onClick={() => onRemoveFavorite(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                  title="ลบออกจากรายการโปรด"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl bg-black/30 border border-white/5 p-2.5">
                <span className="text-[10px] text-slate-400 block">แปลว่า:</span>
                <span className="text-sm font-semibold text-[#00C2A8]">
                  {item.centralMeaning}
                </span>
              </div>

              {item.sampleSentence && (
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div className="text-slate-400 text-[11px]">ตัวอย่าง:</div>
                  <div className="font-medium italic text-white">"{item.sampleSentence}"</div>
                  <div className="text-slate-400 text-[11px]">→ {item.sampleTranslation}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-400">
                  {item.politeness || 'ภาษาพูดทั่วไป'}
                </span>
                <button
                  onClick={() => onAnalyzeWord(item.sampleSentence || item.word)}
                  className="flex items-center space-x-1 text-xs text-[#6C63FF] hover:text-[#A78BFA] font-medium"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>วิเคราะห์คำนี้</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-12 text-center space-y-4">
          <Star className="mx-auto h-12 w-12 text-slate-600" />
          <div>
            <h3 className="text-base font-semibold text-white">
              ยังไม่มีคำศัพท์ที่บันทึกไว้
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              กดสัญลักษณ์รูปดาว ⭐ บนการ์ดคำศัพท์ในพจนานุกรม หรือผลการวิเคราะห์เสียง เพื่อบันทึกคำที่สนใจไว้ที่นี่
            </p>
          </div>
          <button
            onClick={onNavigateToDictionary}
            className="inline-flex items-center space-x-2 rounded-xl bg-[#6C63FF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5b52e0] transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>ไปสำรวจพจนานุกรม</span>
          </button>
        </div>
      )}
    </div>
  );
};
