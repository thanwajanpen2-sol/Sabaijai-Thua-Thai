import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Compass, ChevronRight, Layers, Check } from 'lucide-react';
import { DIALECT_REGIONS_DATA } from '../data/dialectKnowledge';
import { DialectRegionInfo } from '../types/dialect';
import { speakThaiText } from '../utils/audioHelper';

interface DialectMapProps {
  onSelectPhraseToAnalyze: (phrase: string) => void;
}

export const DialectMap: React.FC<DialectMapProps> = ({ onSelectPhraseToAnalyze }) => {
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('south');
  const [hoveredRegionKey, setHoveredRegionKey] = useState<string | null>(null);

  const currentRegion: DialectRegionInfo =
    DIALECT_REGIONS_DATA[selectedRegionKey] || DIALECT_REGIONS_DATA.south;

  const activeHoverRegion: DialectRegionInfo =
    hoveredRegionKey && DIALECT_REGIONS_DATA[hoveredRegionKey]
      ? DIALECT_REGIONS_DATA[hoveredRegionKey]
      : currentRegion;

  const handlePlayVoice = (text: string, region: string) => {
    let rate = 0.95;
    if (region === 'south') rate = 1.1;
    if (region === 'north') rate = 0.88;
    speakThaiText(text, { rate });
  };

  const regionsList = [
    { key: 'north', name: 'ภาคเหนือ', label: 'คำเมือง', color: '#8B5CF6', tag: '8 จังหวัด' },
    { key: 'northeast', name: 'ภาคอีสาน', label: 'สำเนียงอีสาน', color: '#14B8A6', tag: '20 จังหวัด' },
    { key: 'central', name: 'ภาคกลาง', label: 'ไทยมาตรฐาน', color: '#38BDF8', tag: '22 จังหวัด' },
    { key: 'south', name: 'ภาคใต้', label: 'ภาษาปักษ์ใต้', color: '#F59E0B', tag: '14 จังหวัด' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/90 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#00C2A8]/10 border border-[#00C2A8]/30 px-3 py-1 text-xs font-semibold text-[#00C2A8] mb-2">
              <Compass className="h-3.5 w-3.5" />
              <span>แผนที่ประเทศไทยแบบมินิมอล (Minimalist Thailand Map)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>🗺️ แผนที่ภาษาถิ่น 4 ภูมิภาคไทย</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ดีไซน์แบบมินิมอล เรียบหรู ชัดเจน สื่อถึงรูปทรงขวานทองของไทย คลิกเลือกภูมิภาคเพื่อสำรวจสำเนียงและคำศัพท์
            </p>
          </div>

          {/* Quick Region Selector Pills */}
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
            {regionsList.map((r) => {
              const isSelected = selectedRegionKey === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setSelectedRegionKey(r.key)}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Grid Container */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Minimalist Thailand Map (Left Column, 5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/50 border border-white/10 relative overflow-hidden shadow-2xl">
            {/* Minimalist Floating HUD Indicator */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <div className="flex items-center space-x-2.5">
                <span
                  className="h-3 w-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: activeHoverRegion.color,
                    boxShadow: `0 0 10px ${activeHoverRegion.color}`,
                  }}
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {activeHoverRegion.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {activeHoverRegion.subName.split(' ')[0]}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {activeHoverRegion.provincesCount} จังหวัด
              </span>
            </div>

            {/* Minimalist Clean Thailand Vector Map */}
            <div className="relative w-full max-w-[320px] h-[520px] flex items-center justify-center select-none">
              <svg
                viewBox="0 0 380 620"
                className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              >
                <defs>
                  {/* Subtle clean grid */}
                  <pattern id="minimal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.75" fill="rgba(255,255,255,0.06)" />
                  </pattern>

                  {/* Glow filter for active selection */}
                  <filter id="active-glow" x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(255,255,255,0.3)" />
                  </filter>
                </defs>

                {/* Subtle Map Background */}
                <rect width="100%" height="100%" fill="url(#minimal-grid)" rx="16" />

                {/* Subtle Geographical Waterlines / Sea labels */}
                <text x="35" y="420" fill="rgba(255,255,255,0.15)" fontSize="9" letterSpacing="1.5">
                  ANDAMAN SEA
                </text>
                <text x="215" y="380" fill="rgba(255,255,255,0.15)" fontSize="9" letterSpacing="1.5">
                  GULF OF THAILAND
                </text>

                {/* ========================================================
                    1. ภาคเหนือ (Northern Thailand)
                    Clean, minimalist contours of Upper North crown
                    ======================================================== */}
                <g
                  onClick={() => setSelectedRegionKey('north')}
                  onMouseEnter={() => setHoveredRegionKey('north')}
                  onMouseLeave={() => setHoveredRegionKey(null)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <path
                    d={`
                      M 135 22
                      C 152 20, 172 32, 182 48
                      C 192 65, 202 88, 195 115
                      C 190 128, 178 142, 168 152
                      C 155 160, 136 166, 118 166
                      C 100 166, 88 174, 78 168
                      C 64 154, 58 132, 60 105
                      C 62 82, 72 58, 88 44
                      C 102 32, 118 22, 135 22
                      Z
                    `}
                    fill={
                      selectedRegionKey === 'north'
                        ? '#8B5CF6'
                        : hoveredRegionKey === 'north'
                        ? 'rgba(139, 92, 246, 0.45)'
                        : 'rgba(139, 92, 246, 0.2)'
                    }
                    stroke={selectedRegionKey === 'north' ? '#FFFFFF' : '#8B5CF6'}
                    strokeWidth={selectedRegionKey === 'north' ? '2.5' : '1.2'}
                    strokeLinejoin="round"
                    filter={selectedRegionKey === 'north' ? 'url(#active-glow)' : undefined}
                  />

                  {/* Clean Minimalist Center Label */}
                  <text
                    x="126"
                    y="100"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.5"
                    className="pointer-events-none drop-shadow"
                  >
                    ภาคเหนือ
                  </text>
                  <text
                    x="126"
                    y="116"
                    textAnchor="middle"
                    fill="#DDD6FE"
                    fontSize="9"
                    fontWeight="500"
                    className="pointer-events-none opacity-80"
                  >
                    คำเมือง
                  </text>
                </g>

                {/* ========================================================
                    2. ภาคอีสาน (Northeastern Thailand - Isan)
                    Khorat Plateau and Mekong curve
                    ======================================================== */}
                <g
                  onClick={() => setSelectedRegionKey('northeast')}
                  onMouseEnter={() => setHoveredRegionKey('northeast')}
                  onMouseLeave={() => setHoveredRegionKey(null)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <path
                    d={`
                      M 168 152
                      C 174 136, 186 118, 198 104
                      C 210 92, 230 84, 256 82
                      C 284 80, 312 92, 330 112
                      C 346 130, 358 158, 355 190
                      C 352 212, 366 228, 362 254
                      C 358 270, 344 284, 328 286
                      C 310 288, 282 290, 260 290
                      C 242 290, 228 275, 222 256
                      C 215 234, 206 210, 194 186
                      C 184 172, 175 160, 168 152
                      Z
                    `}
                    fill={
                      selectedRegionKey === 'northeast'
                        ? '#14B8A6'
                        : hoveredRegionKey === 'northeast'
                        ? 'rgba(20, 184, 166, 0.45)'
                        : 'rgba(20, 184, 166, 0.2)'
                    }
                    stroke={selectedRegionKey === 'northeast' ? '#FFFFFF' : '#14B8A6'}
                    strokeWidth={selectedRegionKey === 'northeast' ? '2.5' : '1.2'}
                    strokeLinejoin="round"
                    filter={selectedRegionKey === 'northeast' ? 'url(#active-glow)' : undefined}
                  />

                  {/* Clean Minimalist Center Label */}
                  <text
                    x="276"
                    y="180"
                    textAnchor="middle"
                    fill={selectedRegionKey === 'northeast' ? '#042F2E' : '#FFFFFF'}
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.5"
                    className="pointer-events-none drop-shadow"
                  >
                    ภาคอีสาน
                  </text>
                  <text
                    x="276"
                    y="196"
                    textAnchor="middle"
                    fill={selectedRegionKey === 'northeast' ? '#134E4A' : '#5EEAD4'}
                    fontSize="9"
                    fontWeight="600"
                    className="pointer-events-none opacity-85"
                  >
                    สำเนียงอีสาน
                  </text>
                </g>

                {/* ========================================================
                    3. ภาคกลาง ตะวันตก และตะวันออก (Central Thailand)
                    Chao Phraya plain, Gulf bight, and East coast
                    ======================================================== */}
                <g
                  onClick={() => setSelectedRegionKey('central')}
                  onMouseEnter={() => setHoveredRegionKey('central')}
                  onMouseLeave={() => setHoveredRegionKey(null)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <path
                    d={`
                      M 78 168
                      C 88 174, 100 166, 118 166
                      C 136 166, 155 160, 168 152
                      C 175 160, 184 172, 194 186
                      C 206 210, 215 234, 222 256
                      C 228 275, 242 290, 260 290
                      C 274 292, 288 302, 292 320
                      C 296 338, 288 354, 278 365
                      C 268 374, 260 368, 254 356
                      C 245 344, 226 338, 208 335
                      C 190 335, 174 341, 162 344
                      C 152 356, 142 378, 138 402
                      C 126 402, 118 398, 115 385
                      C 112 366, 115 342, 108 314
                      C 100 286, 84 258, 72 230
                      C 66 212, 68 184, 78 168
                      Z
                    `}
                    fill={
                      selectedRegionKey === 'central'
                        ? '#38BDF8'
                        : hoveredRegionKey === 'central'
                        ? 'rgba(56, 189, 248, 0.45)'
                        : 'rgba(56, 189, 248, 0.2)'
                    }
                    stroke={selectedRegionKey === 'central' ? '#FFFFFF' : '#38BDF8'}
                    strokeWidth={selectedRegionKey === 'central' ? '2.5' : '1.2'}
                    strokeLinejoin="round"
                    filter={selectedRegionKey === 'central' ? 'url(#active-glow)' : undefined}
                  />

                  {/* Minimalist Island: Koh Chang */}
                  <ellipse
                    cx="276"
                    cy="378"
                    rx="3.5"
                    ry="6"
                    transform="rotate(25 276 378)"
                    fill={selectedRegionKey === 'central' ? '#38BDF8' : 'rgba(56, 189, 248, 0.35)'}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />

                  {/* Clean Minimalist Center Label */}
                  <text
                    x="158"
                    y="256"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.5"
                    className="pointer-events-none drop-shadow"
                  >
                    ภาคกลาง
                  </text>
                  <text
                    x="158"
                    y="272"
                    textAnchor="middle"
                    fill="#BAE6FD"
                    fontSize="9"
                    fontWeight="500"
                    className="pointer-events-none opacity-80"
                  >
                    ไทยมาตรฐาน
                  </text>
                </g>

                {/* ========================================================
                    4. ภาคใต้ (Southern Thailand Peninsula)
                    Kra Isthmus down to Andaman / Gulf coasts
                    ======================================================== */}
                <g
                  onClick={() => setSelectedRegionKey('south')}
                  onMouseEnter={() => setHoveredRegionKey('south')}
                  onMouseLeave={() => setHoveredRegionKey(null)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <path
                    d={`
                      M 115 385
                      C 118 398, 126 402, 138 402
                      C 142 416, 148 434, 154 458
                      C 158 472, 170 482, 180 496
                      C 190 510, 196 534, 202 558
                      C 206 576, 218 590, 226 604
                      C 232 614, 235 628, 228 640
                      C 218 646, 198 654, 180 650
                      C 166 646, 155 630, 142 614
                      C 134 600, 128 580, 120 556
                      C 112 534, 105 510, 102 482
                      C 100 454, 105 426, 110 402
                      C 112 390, 114 386, 115 385
                      Z
                    `}
                    fill={
                      selectedRegionKey === 'south'
                        ? '#F59E0B'
                        : hoveredRegionKey === 'south'
                        ? 'rgba(245, 158, 11, 0.45)'
                        : 'rgba(245, 158, 11, 0.2)'
                    }
                    stroke={selectedRegionKey === 'south' ? '#FFFFFF' : '#F59E0B'}
                    strokeWidth={selectedRegionKey === 'south' ? '2.5' : '1.2'}
                    strokeLinejoin="round"
                    filter={selectedRegionKey === 'south' ? 'url(#active-glow)' : undefined}
                  />

                  {/* Minimalist Islands: Samui & Phuket */}
                  <ellipse
                    cx="178"
                    cy="465"
                    rx="4"
                    ry="5"
                    fill={selectedRegionKey === 'south' ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />
                  <ellipse
                    cx="96"
                    cy="528"
                    rx="3.5"
                    ry="8"
                    transform="rotate(-15 96 528)"
                    fill={selectedRegionKey === 'south' ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />

                  {/* Clean Minimalist Center Label */}
                  <text
                    x="160"
                    y="555"
                    textAnchor="middle"
                    fill={selectedRegionKey === 'south' ? '#451A03' : '#FFFFFF'}
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.5"
                    className="pointer-events-none drop-shadow"
                  >
                    ภาคใต้
                  </text>
                  <text
                    x="160"
                    y="571"
                    textAnchor="middle"
                    fill={selectedRegionKey === 'south' ? '#78350F' : '#FEF08A'}
                    fontSize="9"
                    fontWeight="600"
                    className="pointer-events-none opacity-90"
                  >
                    ภาษาปักษ์ใต้
                  </text>
                </g>
              </svg>
            </div>

            {/* Clean Minimalist 4-Region Selector Cards Below */}
            <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs">
              {regionsList.map((r) => {
                const isSelected = selectedRegionKey === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRegionKey(r.key)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/30 text-white font-bold ring-1 ring-white/20'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      <span>{r.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Details Panel (Right Column, 7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header info */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: currentRegion.color }}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ภูมิภาคที่กำลังแสดง (Selected Region)
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {currentRegion.name}
                  </h3>
                  <p className="text-xs text-[#00C2A8] mt-0.5 font-medium">
                    {currentRegion.subName}
                  </p>
                </div>

                <div className="rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    จำนวนจังหวัด:
                  </span>
                  <span className="text-sm font-bold text-[#FFD166]">
                    {currentRegion.provincesCount} จังหวัด
                  </span>
                </div>
              </div>

              {/* Provinces Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                <span className="text-[11px] text-slate-400 mr-1 self-center">จังหวัดตัวแทน:</span>
                {currentRegion.sampleProvinces.map((prov, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-slate-300"
                  >
                    {prov}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                {currentRegion.description}
              </p>

              {/* Linguistics features */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-black/30 border border-white/5 p-3.5 space-y-1">
                  <span className="font-bold text-[#FFD166] flex items-center gap-1.5">
                    <span>🗣️ ระบบเสียงและวรรณยุกต์:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {currentRegion.phonology}
                  </p>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/5 p-3.5 space-y-1">
                  <span className="font-bold text-[#A78BFA] flex items-center gap-1.5">
                    <span>🎵 จังหวะและน้ำเสียง:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {currentRegion.toneCharacteristics}
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Words */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#00C2A8]" />
                  <span>คำศัพท์เด่นประจำภาค (Signature Words)</span>
                </h4>
                <span className="text-[11px] text-slate-400">กด 🔊 เพื่อฟังเสียงสำเนียง</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {currentRegion.signatureWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/30 p-3 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#FFD166] group-hover:text-white transition-colors">
                        "{item.word}"
                      </span>
                      <button
                        onClick={() => handlePlayVoice(item.word, currentRegion.code)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#00C2A8] hover:bg-white/10 transition-colors"
                        title="ฟังการออกเสียง"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="mt-1 text-xs text-slate-300 font-medium">
                      = {item.meaning}
                    </span>
                    <span className="text-[10px] text-slate-500 italic mt-0.5">
                      /{item.phonetic}/
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Dialogues */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4 w-4 text-[#FFD166]" />
                <span>ตัวอย่างบทสนทนาและบริบทการใช้งาน</span>
              </h4>

              <div className="space-y-3">
                {currentRegion.sampleDialogues.map((dlg, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 p-4 hover:border-[#6C63FF]/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base font-bold text-white">
                          "{dlg.dialect}"
                        </span>
                        <button
                          onClick={() => handlePlayVoice(dlg.dialect, currentRegion.code)}
                          className="p-1 text-slate-400 hover:text-[#00C2A8] transition-colors"
                          title="ฟังเสียงประโยคนี้"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-[#00C2A8] font-medium">
                        → {dlg.central}
                      </p>
                      <span className="text-[11px] text-slate-400 block">
                        บริบท: {dlg.context}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectPhraseToAnalyze(dlg.dialect)}
                      className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-90 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md shadow-[#6C63FF]/20"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>วิเคราะห์ด้วย AI</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
