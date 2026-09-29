export type DialectRegion = 'central' | 'north' | 'northeast' | 'south' | 'unknown';

export interface KeyWordExplanation {
  word: string;
  meaning: string;
  politeness: string;
  suitableFor: string;
  contextualMeaning: string;
  otherMeanings?: string;
}

export interface DialectAnalysisResult {
  id: string;
  timestamp: string;
  detectedSpeech: string;
  centralThai: string;
  dialect: string;
  regionCode: DialectRegion;
  confidence: number;
  reason: string;
  context: {
    keyWords: KeyWordExplanation[];
    formality: string;
    toneAndEmotion: string;
    suitableAudience: string;
    summaryExplanation: string;
  };
  crossTranslations: {
    central: string;
    north: string;
    northeast: string;
    south: string;
  };
  culturalContext: {
    originRegion: string;
    etymology: string;
    usageSituation: string;
    differenceFromCentral: string;
  };
  isDemo?: boolean;
}

export interface DictionaryItem {
  id: string;
  word: string;
  region: DialectRegion;
  regionLabel: string;
  centralMeaning: string;
  phonetic: string;
  sampleSentence: string;
  sampleTranslation: string;
  politeness: string;
  tags: string[];
  culturalNote?: string;
  audioPitch?: number;
  audioRate?: number;
}

export interface DialectRegionInfo {
  code: DialectRegion;
  name: string;
  subName: string;
  color: string;
  accentColor: string;
  bgGradient: string;
  description: string;
  phonology: string;
  toneCharacteristics: string;
  provincesCount: number;
  sampleProvinces: string[];
  signatureWords: {
    word: string;
    meaning: string;
    phonetic: string;
  }[];
  sampleDialogues: {
    dialect: string;
    central: string;
    context: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}
