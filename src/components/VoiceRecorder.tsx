import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  AlertCircle,
  Play,
  Keyboard,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Volume2,
  Edit3,
} from 'lucide-react';
import { Waveform } from './Waveform';
import { DEMO_PRESET_VOICE_CLIPS } from '../data/dialectKnowledge';
import { playChime, speakThaiText } from '../utils/audioHelper';
import { normalizeDialectSpeech, NormalizedDialectText } from '../utils/dialectNormalizer';

interface VoiceRecorderProps {
  onAnalyzeText: (text: string) => void;
  isAnalyzing: boolean;
  prefilledText?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAnalyzeText,
  isAnalyzing,
  prefilledText = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(prefilledText);
  const [typedText, setTypedText] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const [normalizedHint, setNormalizedHint] = useState<NormalizedDialectText | null>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  // References for Web Speech API and Web Audio API
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        setIsSpeechSupported(false);
      }
    }

    return () => {
      stopAudioCapture();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Audio Context stream setup for real volume measurement
  const startAudioCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedVolume = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalizedVolume);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio capture meter not available:', err);
    }
  };

  const stopAudioCapture = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const clearSilenceCountdown = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceCountdown(null);
  };

  const handleStartListening = async () => {
    setMicError(null);
    clearSilenceCountdown();
    finalTranscriptRef.current = '';
    setTranscript('');
    setNormalizedHint(null);

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setMicError('เบราว์เซอร์นี้ไม่รองรับ Speech Recognition โดยตรง แนะนำให้ใช้ช่องพิมพ์ข้อความหรือเลือกเสียงตัวอย่าง');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'th-TH';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        playChime(550, 0.15);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalAccumulated = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalAccumulated += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        const combinedText = (finalAccumulated + interim).trim();

        if (combinedText) {
          finalTranscriptRef.current = combinedText;
          setTranscript(combinedText);

          // Real-time dialect normalizer preview
          const normalized = normalizeDialectSpeech(combinedText);
          if (normalized.detectedHints.length > 0) {
            setNormalizedHint(normalized);
          }

          // Debounced auto-submit when user stops speaking for 2.8 seconds
          clearSilenceCountdown();
          setSilenceCountdown(3);
          silenceTimerRef.current = setTimeout(() => {
            handleAutoSubmit(combinedText);
          }, 2800);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          stopAudioCapture();
          setMicError('กรุณาอนุญาตให้เว็บไซต์เข้าถึงไมโครโฟนเพื่อใช้งานการบันทึกเสียง');
        } else if (event.error === 'no-speech') {
          // If we already have captured text, don't show error, just wrap up
          if (finalTranscriptRef.current.trim()) {
            handleAutoSubmit(finalTranscriptRef.current);
          } else {
            setMicError('ไม่ได้ยินเสียงพูด ลองพูดใหม่อีกครั้งให้ชัดเจน หรือใช้เสียงตัวอย่างด้านล่าง');
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioCapture();
      };

      recognitionRef.current = recognition;
      recognition.start();
      await startAudioCapture();
    } catch (e: any) {
      console.warn('Could not start recognition:', e);
      setMicError('ไม่สามารถเริ่มไมโครโฟนได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      setIsListening(false);
      stopAudioCapture();
    }
  };

  const handleStopListening = () => {
    clearSilenceCountdown();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    stopAudioCapture();
    playChime(420, 0.15);

    const currentText = (finalTranscriptRef.current || transcript).trim();
    if (currentText) {
      const normalized = normalizeDialectSpeech(currentText);
      const textToAnalyze = normalized.normalized || currentText;
      onAnalyzeText(textToAnalyze);
    }
  };

  const handleAutoSubmit = (text: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopAudioCapture();
    clearSilenceCountdown();

    const normalized = normalizeDialectSpeech(text);
    const textToAnalyze = normalized.normalized || text;
    onAnalyzeText(textToAnalyze);
  };

  const handleApplyPreset = (preset: typeof DEMO_PRESET_VOICE_CLIPS[0]) => {
    clearSilenceCountdown();
    setTranscript(preset.text);
    finalTranscriptRef.current = preset.text;
    setMicError(null);
    speakThaiText(preset.text);
    onAnalyzeText(preset.text);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    const normalized = normalizeDialectSpeech(typedText.trim());
    setTranscript(normalized.normalized || typedText.trim());
    onAnalyzeText(normalized.normalized || typedText.trim());
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/95 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎙️ รับข้อมูลเสียงและวิเคราะห์สำเนียง (Speech Engine)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ระบบถอดเสียงภาษาไทยความเสถียรสูง พร้อมตัวปรับเทียบสำเนียงภาษาถิ่น 4 ภาคอัตโนมัติ
          </p>
        </div>

        <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              inputMode === 'voice'
                ? 'bg-[#6C63FF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>พูดผ่านไมค์</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              inputMode === 'text'
                ? 'bg-[#6C63FF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>พิมพ์ข้อความ</span>
          </button>
        </div>
      </div>

      {/* Voice Mode */}
      {inputMode === 'voice' ? (
        <div className="mt-6 flex flex-col items-center justify-center text-center">
          {/* Big Mic Button */}
          <div className="relative my-4 flex items-center justify-center">
            {isListening && (
              <>
                <div
                  className="absolute rounded-full bg-[#6C63FF]/20 animate-ping"
                  style={{
                    width: `${120 + audioLevel * 0.8}px`,
                    height: `${120 + audioLevel * 0.8}px`,
                  }}
                />
                <div
                  className="absolute rounded-full bg-[#00C2A8]/15 animate-pulse"
                  style={{
                    width: `${140 + audioLevel}px`,
                    height: `${140 + audioLevel}px`,
                  }}
                />
              </>
            )}

            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={isAnalyzing}
              className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 scale-105 shadow-red-500/40 ring-4 ring-red-400/40'
                  : 'bg-gradient-to-tr from-[#6C63FF] via-[#7C3AED] to-[#00C2A8] hover:scale-105 shadow-[#6C63FF]/40 ring-4 ring-white/10 hover:ring-[#6C63FF]/40'
              }`}
            >
              {isListening ? (
                <div className="flex flex-col items-center">
                  <MicOff className="h-10 w-10 text-white animate-pulse" />
                  <span className="mt-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    หยุดและแปล
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Mic className="h-10 w-10 text-white" />
                  <span className="mt-1 text-[11px] font-bold text-white uppercase tracking-wider">
                    เริ่มพูด
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Real-time Status Badge & Mic Volume Meter */}
          <div className="mt-2 min-h-7 flex flex-col items-center">
            {isListening ? (
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-2 rounded-full bg-red-500/20 px-3.5 py-1 border border-red-500/30 text-xs font-semibold text-red-300 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                  <span>กำลังฟังเสียงพูดของคุณ... (Listening...)</span>
                  {silenceCountdown !== null && transcript && (
                    <span className="text-[10px] text-amber-300 font-normal">
                      (แปลอัตโนมัติใน {silenceCountdown}s)
                    </span>
                  )}
                </div>

                {/* Real-time dB signal indicator */}
                <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400">
                  <span>สัญญาณไมค์:</span>
                  <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-[#00C2A8] transition-all duration-100"
                      style={{ width: `${Math.min(100, audioLevel * 1.5)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {audioLevel > 5 ? 'รับเสียงชัดเจน' : 'รอเสียงพูด...'}
                  </span>
                </div>

                {transcript && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleStopListening}
                      className="inline-flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-[#00C2A8] to-emerald-400 px-4 py-1.5 text-xs font-bold text-[#0B1020] shadow-lg shadow-[#00C2A8]/30 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>พูดเสร็จแล้ว แปลทันที</span>
                    </button>
                  </div>
                )}
              </div>
            ) : isAnalyzing ? (
              <div className="inline-flex items-center space-x-2 rounded-full bg-[#6C63FF]/20 px-3.5 py-1 border border-[#6C63FF]/30 text-xs font-medium text-[#A78BFA]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>AI กำลังวิเคราะห์สำเนียงและแปลความหมาย...</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                กดปุ่มไมโครโฟนเพื่อพูดภาษาถิ่น หรือเลือกประโยคตัวอย่างด้านล่าง (ระบบจะแปลอัตโนมัติเมื่อหยุดพูด)
              </p>
            )}
          </div>

          {/* Real-time Reactive Waveform */}
          <div className="mt-3 w-full max-w-md">
            <Waveform isListening={isListening} audioLevel={audioLevel} />
          </div>

          {/* Live Transcript Display Box */}
          {transcript && (
            <div className="mt-4 w-full rounded-2xl bg-black/50 border border-white/10 p-4 text-left shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00C2A8]" />
                  <span>สิ่งที่ตรวจจับได้ (Live Transcript):</span>
                </span>

                <button
                  onClick={() => setIsEditingTranscript((prev) => !prev)}
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>{isEditingTranscript ? 'เสร็จสิ้น' : 'แก้ไขคำ'}</span>
                </button>
              </div>

              {isEditingTranscript ? (
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    finalTranscriptRef.current = e.target.value;
                  }}
                  className="w-full rounded-lg bg-black/40 border border-white/20 p-2 text-base font-semibold text-white focus:outline-none focus:border-[#6C63FF]"
                />
              ) : (
                <p className="text-lg font-bold text-white tracking-wide break-words">
                  "{transcript}"
                </p>
              )}

              {/* Phonetic Normalization Hint */}
              {normalizedHint && normalizedHint.detectedHints.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                  <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>ปรับเทียบสำเนียงอัตโนมัติ:</span>
                  <strong className="text-white">"{normalizedHint.normalized}"</strong>
                </div>
              )}

              {/* Action Button */}
              {!isListening && !isAnalyzing && (
                <div className="mt-3 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => speakThaiText(transcript)}
                    className="flex items-center space-x-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>ฟังที่พูด</span>
                  </button>

                  <button
                    onClick={() => {
                      const normalized = normalizeDialectSpeech(transcript);
                      onAnalyzeText(normalized.normalized || transcript);
                    }}
                    className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#00C2A8] to-emerald-400 px-4 py-1.5 text-xs font-bold text-[#0B1020] hover:opacity-95 transition-all shadow-md shadow-[#00C2A8]/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>วิเคราะห์ด้วย AI ทันที</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Text Input Mode */
        <form onSubmit={handleTextSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              พิมพ์ข้อความหรือสำนวนภาษาถิ่นที่ต้องการวิเคราะห์:
            </label>
            <div className="relative">
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="เช่น กินข้าวแล้วหม้าย, กิ๋นข้าวแลงแล้วก๋า, ข้าวซอยลำแต้ๆ, แซ่บอีหลี..."
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
              />
              <button
                type="submit"
                disabled={!typedText.trim() || isAnalyzing}
                className="absolute right-2 top-2 bottom-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#00C2A8] px-4 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all"
              >
                วิเคราะห์
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Mic Error Banner */}
      {micError && (
        <div className="mt-4 flex items-start space-x-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{micError}</p>
            <p className="mt-1 text-[11px] text-amber-300/80">
              💡 คุณสามารถทดลองกดเลือกประโยคตัวอย่างด้านล่างเพื่อทดสอบระบบได้ทันทีโดยไม่ต้องใช้ไมโครโฟน
            </p>
          </div>
        </div>
      )}

      {/* Demo Preset Voice Clips */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD166]" />
            <span>ประโยคตัวอย่างเสียงถิ่น (คลิกเพื่อทดสอบความเสถียรทันที):</span>
          </span>
          <span className="text-[11px] text-slate-400">ข้อมูลตัวอย่างสำหรับ Demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {DEMO_PRESET_VOICE_CLIPS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              disabled={isAnalyzing}
              className="group flex flex-col items-start rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-left hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/10 transition-all"
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    preset.region === 'south'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : preset.region === 'north'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {preset.dialect}
                </span>
                <Play className="h-3 w-3 text-slate-400 group-hover:text-[#00C2A8] transition-colors" />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-white group-hover:text-[#00C2A8] transition-colors">
                "{preset.text}"
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 truncate w-full">
                → {preset.meaning}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
