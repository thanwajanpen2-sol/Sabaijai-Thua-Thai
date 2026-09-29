import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Volume2, Star, Sparkles, Filter, X, Plus, Check } from 'lucide-react';
import { DictionaryItem } from '../types/dialect';
import { speakThaiText } from '../utils/audioHelper';

interface DictionaryProps {
  items: DictionaryItem[];
  favoriteIds: Set<string>;
  onToggleFavorite: (item: DictionaryItem) => void;
  onAnalyzeWord: (word: string) => void;
  onAddNewWord?: (item: DictionaryItem) => void;
}

export const Dictionary: React.FC<DictionaryProps> = ({
  items,
  favoriteIds,
  onToggleFavorite,
  onAnalyzeWord,
  onAddNewWord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New word form state
  const [newWord, setNewWord] = useState('');
  const [newRegion, setNewRegion] = useState<'south' | 'north' | 'northeast' | 'central'>('south');
  const [newMeaning, setNewMeaning] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newSample, setNewSample] = useState('');
  const [newSampleTrans, setNewSampleTrans] = useState('');
  const [newPoliteness, setNewPoliteness] = useState('ภาษาพูดทั่วไป');
  const [newCulturalNote, setNewCulturalNote] = useState('');
  const [formSaved, setFormSaved] = useState(false);

  const regionFilterOptions = [
    { id: 'all', label: 'ทั้งหมด (All)' },
    { id: 'north', label: 'ภาษาเหนือ' },
    { id: 'northeast', label: 'ภาษาอีสาน' },
    { id: 'south', label: 'ภาษาใต้' },
    { id: 'central', label: 'ภาษากลาง' },
  ];

  const tagFilterOptions = ['all', 'อาหาร', 'ทักทาย', 'คำถาม', 'ความรู้สึก', 'กริยา', 'ชมเชย', 'ยอดนิยม'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.centralMeaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sampleSentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.culturalNote && item.culturalNote.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRegion = selectedRegion === 'all' || item.region === selectedRegion;
      const matchTag = selectedTag === 'all' || item.tags.includes(selectedTag);

      return matchSearch && matchRegion && matchTag;
    });
  }, [items, searchTerm, selectedRegion, selectedTag]);

  const handleSpeak = (text: string, region: string) => {
    let rate = 0.95;
    if (region === 'south') rate = 1.1;
    if (region === 'north') rate = 0.88;
    speakThaiText(text, { rate });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;

    const newItem: DictionaryItem = {
      id: 'custom-' + Date.now(),
      word: newWord.trim(),
      region: newRegion,
      regionLabel:
        newRegion === 'south'
          ? 'ภาษาใต้'
          : newRegion === 'north'
          ? 'ภาษาเหนือ'
          : newRegion === 'northeast'
          ? 'ภาษาอีสาน'
          : 'ภาษากลาง',
      centralMeaning: newMeaning.trim(),
      phonetic: newPhonetic.trim() || newWord.trim(),
      sampleSentence: newSample.trim() || newWord.trim(),
      sampleTranslation: newSampleTrans.trim() || newMeaning.trim(),
      politeness: newPoliteness,
      tags: ['ผู้ใช้เพิ่ม'],
      culturalNote: newCulturalNote.trim() || 'คำศัพท์ที่ผู้ใช้งานบันทึกเข้าสู่พจนานุกรม',
    };

    if (onAddNewWord) {
      onAddNewWord(newItem);
    }
    setFormSaved(true);
    setTimeout(() => {
      setFormSaved(false);
      setIsAddModalOpen(false);
      // Reset form
      setNewWord('');
      setNewMeaning('');
      setNewPhonetic('');
      setNewSample('');
      setNewSampleTrans('');
      setNewCulturalNote('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/90 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#00C2A8]" />
              <span>📖 พจนานุกรมภาษาถิ่นไทย (Dialect Dictionary)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              สืบค้นคำศัพท์ท้องถิ่น 4 ภาค พร้อมความหมายภาษาไทยกลาง คำอ่านตัวอย่างประโยค และเกร็ดบริบท
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition-all shadow-md shadow-[#6C63FF]/20"
          >
            <Plus className="h-4 w-4" />
            <span>เสนอ/เพิ่มคำศัพท์</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาคำศัพท์ภาษาถิ่น ความหมาย หรือประโยค เช่น หม้าย, ลำ, แซ่บ, อร่อย..."
              className="w-full rounded-xl border border-white/15 bg-black/40 pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Region Filters */}
            <div className="flex flex-wrap gap-1.5">
              {regionFilterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRegion(opt.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    selectedRegion === opt.id
                      ? 'bg-[#6C63FF] text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Category Tag Filters */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <Filter className="h-3 w-3 text-slate-400 mr-1" />
              {tagFilterOptions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-md px-2 py-0.5 text-[11px] transition-all ${
                    selectedTag === tag
                      ? 'bg-[#00C2A8] text-[#0B1020] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  #{tag === 'all' ? 'หมวดทั้งหมด' : tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          พบ <strong>{filteredItems.length}</strong> คำศัพท์
          {searchTerm && ` ที่ตรงกับ "${searchTerm}"`}
        </span>
        <span className="text-[11px]">คลิก ⭐ เพื่อบันทึกคำศัพท์ลงใน "คำที่บันทึก"</span>
      </div>

      {/* Words Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isFav = favoriteIds.has(item.id);
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141E38]/90 to-[#0E1528]/90 p-5 shadow-lg hover:border-[#6C63FF]/40 transition-all space-y-3.5 group"
              >
                {/* Word header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#FFD166] transition-colors">
                        "{item.word}"
                      </h3>
                      <button
                        onClick={() => handleSpeak(item.word, item.region)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#00C2A8] hover:bg-white/5 transition-colors"
                        title="ฟังเสียงคำศัพท์"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-slate-400 italic">
                        /{item.phonetic}/
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                      <span className="text-[11px] text-slate-400">
                        ระดับ: {item.politeness}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(item)}
                    className={`p-2 rounded-xl border transition-all ${
                      isFav
                        ? 'bg-[#FFD166]/20 border-[#FFD166]/40 text-[#FFD166]'
                        : 'border-white/5 bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                    title={isFav ? 'นำออกจากคำที่บันทึก' : 'บันทึกลงในคำที่บันทึก'}
                  >
                    <Star className={`h-4 w-4 ${isFav ? 'fill-[#FFD166]' : ''}`} />
                  </button>
                </div>

                {/* Central Meaning */}
                <div className="rounded-xl bg-black/30 border border-white/5 p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">ความหมายภาษาไทยกลาง:</span>
                  <span className="text-sm font-semibold text-[#00C2A8] block mt-0.5">
                    {item.centralMeaning}
                  </span>
                </div>

                {/* Example sentence */}
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <div>
                      <span className="text-slate-400">ตัวอย่าง: </span>
                      <span className="font-semibold text-white">"{item.sampleSentence}"</span>
                    </div>
                    <button
                      onClick={() => handleSpeak(item.sampleSentence, item.region)}
                      className="text-slate-400 hover:text-[#00C2A8]"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-slate-400 pl-4">
                    → แปล: "{item.sampleTranslation}"
                  </div>
                </div>

                {/* Cultural note & actions */}
                {item.culturalNote && (
                  <p className="text-[11px] text-slate-400 border-t border-white/5 pt-2 leading-relaxed">
                    💡 <strong className="text-slate-300">เกร็ด:</strong> {item.culturalNote}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onAnalyzeWord(item.sampleSentence || item.word)}
                    className="flex items-center space-x-1 text-xs text-[#6C63FF] hover:text-[#A78BFA] font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>วิเคราะห์ด้วย AI</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-3 text-base font-semibold text-white">
            ไม่พบคำศัพท์ที่ค้นหา
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เสนอ/เพิ่มคำศัพท์" เพื่อบันทึกคำใหม่ลงในฐานข้อมูล
          </p>
        </div>
      )}

      {/* Add Custom Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121A31] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#00C2A8]" />
                <span>เสนอหรือเพิ่มคำศัพท์ภาษาถิ่นใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">คำศัพท์ภาษาถิ่น *</label>
                  <input
                    type="text"
                    required
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="เช่น หรอย, แซ่บ, ลำ..."
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ภูมิภาค / ภาษาถิ่น *</label>
                  <select
                    value={newRegion}
                    onChange={(e: any) => setNewRegion(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white focus:border-[#6C63FF] focus:outline-none"
                  >
                    <option value="south">ภาษาใต้</option>
                    <option value="north">ภาษาเหนือ (คำเมือง)</option>
                    <option value="northeast">ภาษาอีสาน</option>
                    <option value="central">ภาษากลาง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ความหมายภาษาไทยกลาง *</label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="เช่น อร่อยมาก, ทำงาน, คิดถึง..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">คำอ่าน / Phonetic</label>
                  <input
                    type="text"
                    value={newPhonetic}
                    onChange={(e) => setNewPhonetic(e.target.value)}
                    placeholder="เช่น roi, lam, saep..."
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ระดับความสุภาพ</label>
                  <input
                    type="text"
                    value={newPoliteness}
                    onChange={(e) => setNewPoliteness(e.target.value)}
                    placeholder="เช่น สุภาพทั่วไป, เป็นกันเอง..."
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ตัวอย่างประโยค</label>
                <input
                  type="text"
                  value={newSample}
                  onChange={(e) => setNewSample(e.target.value)}
                  placeholder="เช่น กับข้าวถ้วยนี้หรอยแรง..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">คำแปลตัวอย่างประโยค</label>
                <input
                  type="text"
                  value={newSampleTrans}
                  onChange={(e) => setNewSampleTrans(e.target.value)}
                  placeholder="เช่น กับข้าวชามนี้อร่อยมากๆ..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">เกร็ดวัฒนธรรมหรือบริบทการใช้</label>
                <textarea
                  rows={2}
                  value={newCulturalNote}
                  onChange={(e) => setNewCulturalNote(e.target.value)}
                  placeholder="เช่น ใช้เฉพาะในเพื่อนฝูง หรือมีที่มาจากการกร่อนเสียง..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#00C2A8] to-emerald-400 px-5 py-2 text-xs font-bold text-[#0B1020] hover:opacity-90"
                >
                  {formSaved ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>บันทึกสำเร็จ!</span>
                    </>
                  ) : (
                    <span>บันทึกคำศัพท์</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
