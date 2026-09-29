import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeHero } from './components/HomeHero';
import { VoiceRecorder } from './components/VoiceRecorder';
import { TranslationCard } from './components/TranslationCard';
import { CrossDialectTranslator } from './components/CrossDialectTranslator';
import { DialectMap } from './components/DialectMap';
import { Dictionary } from './components/Dictionary';
import { Favorites } from './components/Favorites';
import { History } from './components/History';
import { AIChat } from './components/AIChat';

import { DialectAnalysisResult, DictionaryItem } from './types/dialect';
import {
  DICTIONARY_ITEMS,
  INITIAL_DEMO_HISTORY,
  analyzeDialectLocalFallback,
} from './data/dialectKnowledge';
import { analyzeSpeechOrText } from './services/dialectService';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DialectAnalysisResult | null>(
    INITIAL_DEMO_HISTORY[0] // Preload sample result for rich immediate evaluation
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cross dialect prefill state
  const [crossPrefill, setCrossPrefill] = useState<{ text: string; source: string }>({
    text: 'กินข้าวแล้วหม้าย?',
    source: 'ภาษาใต้',
  });

  // LocalStorage Persistence for Favorites
  const [favorites, setFavorites] = useState<DictionaryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('dialectlens_favorites_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading favorites from localStorage', e);
    }
    // Default favorites for demo
    return [DICTIONARY_ITEMS[0], DICTIONARY_ITEMS[7], DICTIONARY_ITEMS[13]];
  });

  // LocalStorage Persistence for History
  const [historyItems, setHistoryItems] = useState<DialectAnalysisResult[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DEMO_HISTORY;
    try {
      const saved = localStorage.getItem('dialectlens_history_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading history from localStorage', e);
    }
    return INITIAL_DEMO_HISTORY;
  });

  // Dynamic Dictionary Items
  const [dictionaryItems, setDictionaryItems] = useState<DictionaryItem[]>(() => {
    if (typeof window === 'undefined') return DICTIONARY_ITEMS;
    try {
      const custom = localStorage.getItem('dialectlens_custom_words_v1');
      if (custom) {
        return [...DICTIONARY_ITEMS, ...JSON.parse(custom)];
      }
    } catch (e) {
      // ignore
    }
    return DICTIONARY_ITEMS;
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dialectlens_favorites_v1', JSON.stringify(favorites));
    } catch (e) {
      // ignore
    }
  }, [favorites]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dialectlens_history_v1', JSON.stringify(historyItems));
    } catch (e) {
      // ignore
    }
  }, [historyItems]);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  // Handler: Analyze Text or Speech
  const handleAnalyzeText = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let result: DialectAnalysisResult;
      if (isDemoMode) {
        // Force offline demo generator
        await new Promise((r) => setTimeout(r, 600)); // subtle realistic delay
        result = analyzeDialectLocalFallback(text);
      } else {
        result = await analyzeSpeechOrText(text);
      }

      setAnalysisResult(result);
      // Prepend to history
      setHistoryItems((prev) => [result, ...prev.filter((h) => h.id !== result.id)].slice(0, 50));
      setCurrentTab('voice');
    } catch (err: any) {
      console.warn('Analysis error:', err);
      // Fallback mode without failing
      const fallbackResult = analyzeDialectLocalFallback(text);
      setAnalysisResult(fallbackResult);
      setHistoryItems((prev) => [fallbackResult, ...prev]);
      setCurrentTab('voice');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler: Favorite Toggle
  const handleToggleFavorite = (item: DictionaryItem | DialectAnalysisResult) => {
    const isAnalysis = 'detectedSpeech' in item;
    const targetId = item.id;

    if (favoriteIds.has(targetId)) {
      setFavorites((prev) => prev.filter((f) => f.id !== targetId));
    } else {
      if (isAnalysis) {
        const analysis = item as DialectAnalysisResult;
        const newItem: DictionaryItem = {
          id: analysis.id,
          word: analysis.detectedSpeech,
          region: analysis.regionCode,
          regionLabel: analysis.dialect,
          centralMeaning: analysis.centralThai,
          phonetic: analysis.detectedSpeech,
          sampleSentence: analysis.detectedSpeech,
          sampleTranslation: analysis.centralThai,
          politeness: analysis.context.formality,
          tags: ['จากเสียงพูด', analysis.dialect],
          culturalNote: analysis.culturalContext.usageSituation,
        };
        setFavorites((prev) => [newItem, ...prev]);
      } else {
        setFavorites((prev) => [item as DictionaryItem, ...prev]);
      }
    }
  };

  // Handler: Add Custom Word
  const handleAddNewWord = (newWordItem: DictionaryItem) => {
    setDictionaryItems((prev) => [newWordItem, ...prev]);
    try {
      const customOnly = [newWordItem];
      const existing = localStorage.getItem('dialectlens_custom_words_v1');
      if (existing) {
        const parsed = JSON.parse(existing);
        localStorage.setItem('dialectlens_custom_words_v1', JSON.stringify([newWordItem, ...parsed]));
      } else {
        localStorage.setItem('dialectlens_custom_words_v1', JSON.stringify(customOnly));
      }
    } catch (e) {
      // ignore
    }
  };

  // Handler: Open Cross Translate with prefilled text
  const handleOpenCrossTranslate = (text: string, sourceDialect: string) => {
    setCrossPrefill({ text, source: sourceDialect });
    setCurrentTab('cross');
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode((prev) => !prev)}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          favoritesCount={favorites.length}
          historyCount={historyItems.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
          {/* Demo Mode Notice Banner if Active */}
          {isDemoMode && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  <strong>โหมดตัวอย่าง (Demo Mode):</strong> ระบบกำลังใช้ฐานข้อมูลและโมเดลภาษาถิ่นจำลองในเครื่อง สามารถทดสอบได้โดยไม่ต้องเชื่อมต่อภายนอก
                </span>
              </div>
              <button
                onClick={() => setIsDemoMode(false)}
                className="underline text-amber-300 hover:text-white"
              >
                ปิดโหมดนี้
              </button>
            </div>
          )}

          {/* TAB 1: HOME */}
          {currentTab === 'home' && (
            <HomeHero
              onStartVoice={() => setCurrentTab('voice')}
              onStartText={() => setCurrentTab('voice')}
              onSelectSample={(sample) => handleAnalyzeText(sample)}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* TAB 2: VOICE RECORDER & TRANSLATION CARD */}
          {currentTab === 'voice' && (
            <div className="space-y-6">
              <VoiceRecorder
                onAnalyzeText={handleAnalyzeText}
                isAnalyzing={isAnalyzing}
              />

              {analysisResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ผลการวิเคราะห์ภาษาถิ่นล่าสุด:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ID: {analysisResult.id}
                    </span>
                  </div>
                  <TranslationCard
                    result={analysisResult}
                    isFavorite={favoriteIds.has(analysisResult.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenCrossTranslate={handleOpenCrossTranslate}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CROSS-DIALECT TRANSLATOR */}
          {currentTab === 'cross' && (
            <CrossDialectTranslator
              initialText={crossPrefill.text}
              initialSourceDialect={crossPrefill.source}
            />
          )}

          {/* TAB 4: DIALECT MAP */}
          {currentTab === 'map' && (
            <DialectMap
              onSelectPhraseToAnalyze={(phrase) => handleAnalyzeText(phrase)}
            />
          )}

          {/* TAB 5: DICTIONARY */}
          {currentTab === 'dictionary' && (
            <Dictionary
              items={dictionaryItems}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onAnalyzeWord={(w) => handleAnalyzeText(w)}
              onAddNewWord={handleAddNewWord}
            />
          )}

          {/* TAB 6: FAVORITES */}
          {currentTab === 'favorites' && (
            <Favorites
              favorites={favorites}
              onRemoveFavorite={(id) => setFavorites((prev) => prev.filter((f) => f.id !== id))}
              onClearAll={() => setFavorites([])}
              onAnalyzeWord={(w) => handleAnalyzeText(w)}
              onNavigateToDictionary={() => setCurrentTab('dictionary')}
            />
          )}

          {/* TAB 7: HISTORY */}
          {currentTab === 'history' && (
            <History
              historyItems={historyItems}
              onSelectItem={(item) => {
                setAnalysisResult(item);
                setCurrentTab('voice');
              }}
              onClearHistory={() => setHistoryItems([])}
              onRemoveItem={(id) => setHistoryItems((prev) => prev.filter((h) => h.id !== id))}
            />
          )}

          {/* TAB 8: AI CHAT */}
          {currentTab === 'chat' && <AIChat />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
