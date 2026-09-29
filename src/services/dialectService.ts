import { DialectAnalysisResult } from '../types/dialect';
import { analyzeDialectLocalFallback, DICTIONARY_ITEMS } from '../data/dialectKnowledge';
import { normalizeDialectSpeech } from '../utils/dialectNormalizer';

export async function analyzeSpeechOrText(input: string): Promise<DialectAnalysisResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('กรุณาระบุข้อความหรือเสียงพูด');
  }

  // Pre-normalize dialect phonetic variances (e.g. กินข้าวแล้วไม้ -> กินข้าวแล้วหม้าย)
  const normalized = normalizeDialectSpeech(trimmed);
  const textToSend = normalized.normalized || trimmed;

  // Use AbortController with 10-second timeout for reliable AI network completion
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('/api/analyze-dialect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToSend }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.fallback || data.isDemo || !data.dialect) {
      return analyzeDialectLocalFallback(textToSend);
    }

    return {
      id: 'res-' + Date.now(),
      timestamp: new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      detectedSpeech: data.detectedSpeech || textToSend,
      centralThai: data.centralThai,
      dialect: data.dialect,
      regionCode: data.regionCode,
      confidence: data.confidence,
      reason: data.reason,
      context: data.context,
      crossTranslations: data.crossTranslations,
      culturalContext: data.culturalContext,
      isDemo: Boolean(data.isDemo),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('API call timed out or failed, using ultra-fast local fallback:', error);
    return analyzeDialectLocalFallback(textToSend);
  }
}

export async function translateCrossDialect(
  text: string,
  targetDialect: 'central' | 'north' | 'northeast' | 'south',
  sourceDialect?: string
): Promise<{
  translatedText: string;
  confidence: number;
  confidenceNote: string;
  notes: string;
  pronunciationGuide?: string;
}> {
  const targetLabels: Record<string, string> = {
    central: 'ไทยกลาง',
    north: 'เหนือ (คำเมือง)',
    northeast: 'อีสาน',
    south: 'ใต้',
  };

  try {
    const res = await fetch('/api/translate-dialect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetDialect: targetLabels[targetDialect] || targetDialect, sourceDialect }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.translatedText) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Translate API fallback', e);
  }

  // Local fallback translation
  const fallback = analyzeDialectLocalFallback(text);
  const translated = fallback.crossTranslations[targetDialect] || text;

  let note = 'แปลโดยระบบวิเคราะห์สำนวนภาษาถิ่นพื้นฐาน';
  let confNote = 'ผลลัพธ์เป็นการประเมินความหมายจากสำนวนท้องถิ่นยอดนิยม';
  let pronunciation = 'ออกเสียงตามเอกลักษณ์ภูมิภาค';

  if (targetDialect === 'north') {
    pronunciation = 'ทอดเสียงยาว นุ่มนวล เติมคำลงท้าย เช่น "เจ้า" หรือ "เน้อ"';
    note = 'ใช้คำศัพท์สำเนียงล้านนาตอนบน';
  } else if (targetDialect === 'northeast') {
    pronunciation = 'จังหวะกระชับ สดใส คำลงท้าย "เด้อ" หรือ "บ่"';
    note = 'สำเนียงอีสานทั่วไป (ไท-ลาว)';
  } else if (targetDialect === 'south') {
    pronunciation = 'ตัดพยางค์ให้สั้น พูดเร็วและกระแทกเสียงฉับไว';
    note = 'สำเนียงปักษ์ใต้ตอนกลาง (นครศรีฯ/สงขลา)';
  } else {
    pronunciation = 'ออกเสียงชัดถ้อยชัดคำตามสำเนียงมาตรฐาน';
  }

  return {
    translatedText: translated,
    confidence: 88,
    confidenceNote: confNote,
    notes: note,
    pronunciationGuide: pronunciation,
  };
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'model'; content: string }>
): Promise<string> {
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (e) {
    console.warn('AI chat API fallback:', e);
  }

  // Smart local Q&A engine
  const query = message.toLowerCase();

  // Search in dictionary
  const matched = DICTIONARY_ITEMS.find(
    (item) => query.includes(item.word.toLowerCase()) || query.includes(item.centralMeaning.toLowerCase())
  );

  if (matched) {
    return `💡 **คำว่า "${matched.word}" (${matched.regionLabel})**

• **ความหมายภาษาไทยกลาง:** ${matched.centralMeaning}
• **ระดับความสุภาพ:** ${matched.politeness}
• **ตัวอย่างประโยค:** "${matched.sampleSentence}" (แปลว่า: "${matched.sampleTranslation}")
• **เกร็ดทางวัฒนธรรม:** ${matched.culturalNote || 'เป็นคำที่นิยมใช้อย่างกว้างขวางในชีวิตประจำวันของคนในท้องถิ่น'}

คำนี้สามารถใช้ในบรรยากาศเป็นกันเองได้เป็นอย่างดีครับ มีคำอื่นที่คุณอยากสอบถามเพิ่มเติมไหมครับ?`;
  }

  if (query.includes('แหลง')) {
    return `💡 **คำว่า "แหลง" เป็นภาษาใต้** หมายถึง "พูด" หรือ "สนทนา"
• ตัวอย่าง: "แหลงใต้" = พูดภาษาใต้, "แหลงความ" = เล่าเรื่อง/คุยเรื่องราว
• ระดับความสุภาพ: สุภาพทั่วไป ใช้ได้ทั้งกับเพื่อน ญาติ และคนทั่วไปในชีวิตประจำวัน
• เกร็ด: คนใต้นิยมตัดทอนคำให้สั้นกระชับ คำว่า "แหลง" จึงเป็นกริยาพื้นฐานที่ได้ยินบ่อยที่สุดคำหนึ่งครับ`;
  }

  if (query.includes('ลำ') || query.includes('กิ๋น')) {
    return `🍜 **ภาษาเหนือ (คำเมือง)**
คำว่า "ลำ" หมายถึง "อร่อย" (เทียบกับอีสานคือ "แซ่บ" และใต้คือ "หรอย")
• หากอร่อยมากๆ จะพูดว่า "ลำแต้ๆ" หรือ "ลำปะล้ำปะเหลือ"
• "กิ๋น" หมายถึง กิน เช่น "กิ๋นข้าวแลง" (กินข้าวเย็น)
• ระดับความสุภาพ: สามารถพูดชมแม่ครัวหรือคนทำอาหารได้อย่างสุภาพ อ่อนโยนครับ`;
  }

  if (query.includes('แซ่บ') || query.includes('เฮ็ด')) {
    return `🌶️ **ภาษาอีสาน**
คำว่า "แซ่บ" หมายถึง อร่อย หรือรสชาติดีกลมกล่อม ส่วน "เฮ็ด" หมายถึง ทำ (เช่น เฮ็ดเวียก = ทำงาน)
• ระดับความสุภาพ: สุภาพทั่วไป สามารถใช้ได้ทุกสถานการณ์
• หากต้องการเน้นว่าอร่อยอย่างแท้จริง มักพูดว่า "แซ่บหลายเด้อ" หรือ "แซ่บอีหลี" ครับ`;
  }

  return `ยินดีต้อนรับสู่ **Sabaijai Thua Thai (สบายใจทั่วไทย)** AI Assistant ครับ! 
ผมสามารถช่วยอธิบายความหมายของคำศัพท์ภาษาถิ่น (เหนือ, อีสาน, ใต้, กลาง), ระดับความสุภาพ, ข้อควรระวังในการพูดกับผู้ใหญ่, และที่มาทางวัฒนธรรมได้ครับ

💡 **คำถามแนะนำที่คุณสามารถถามได้:**
1. "คำว่า แหลง หมายถึงอะไรและพูดกับใครได้บ้าง?"
2. "คำว่า ลำ กับ แซ่บ ต่างกันอย่างไร?"
3. "ทำไมสำเนียงใต้ถึงพูดสั้นและรวดเร็ว?"
4. "คำลงท้าย 'เจ้า' ในภาษาเหนือมีวิธีใช้อย่างไร?"`;
}
