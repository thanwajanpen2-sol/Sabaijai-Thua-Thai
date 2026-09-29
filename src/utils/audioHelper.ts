/**
 * Audio and Speech Synthesis helper for DialectLens AI
 */

export function speakThaiText(text: string, options?: { pitch?: number; rate?: number }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser');
    return false;
  }

  window.speechSynthesis.cancel(); // cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.rate = options?.rate ?? 0.95; // slightly natural cadence

  // Try to find a Thai voice if available
  const voices = window.speechSynthesis.getVoices();
  const thaiVoice = voices.find(v => v.lang.startsWith('th'));
  if (thaiVoice) {
    utterance.voice = thaiVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Creates subtle tactile audio feedback for button interactions
 */
export function playChime(freq = 600, duration = 0.15) {
  if (typeof window === 'undefined') return;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio context autoplay restriction
  }
}
