import express from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Multi-model resilient caller: starts with fast, high-quota gemini-3.1-flash-lite, cascading to gemini-flash-latest and gemini-3.8-flash
async function callGeminiWithFallback(options: {
  contents: any;
  config?: any;
}) {
  if (!ai || !apiKey) {
    throw new Error('No GEMINI_API_KEY configured');
  }

  const modelCandidates = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${model} encountered an issue:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All available Gemini models were exhausted');
}

// 1. Analyze Dialect Endpoint
app.post('/api/analyze-dialect', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for analysis' });
    }

    const trimmed = text.trim();

    if (!ai || !apiKey) {
      return res.json({
        isDemo: true,
        message: 'No GEMINI_API_KEY configured - running in Demo Mode',
        fallback: true
      });
    }

    const systemPrompt = `คุณคือนักภาษาศาสตร์ผู้เชี่ยวชาญภาษาไทย ภาษาถิ่นไทย และวัฒนธรรมท้องถิ่น (ภาษาเหนือ/คำเมือง, ภาษาอีสาน, ภาษาใต้, ภาษากลาง)
หน้าที่ของคุณคือวิเคราะห์ข้อความเสียง/ประโยคภาษาถิ่นไทยที่ได้รับอย่างแม่นยำ ถูกต้อง 100% ตามหลักภาษาศาสตร์และวิถีชีวิตจริงของคนในท้องถิ่น:

1. วิเคราะห์ภาษาถิ่น:
   - "ภาษาเหนือ" หรือ "ภาษาเหนือ (คำเมือง)" (เช่น คำว่า ลำ, แต้ๆ, กิ๋นข้าว, กึ๊ดเติง, ขะใจ๋, ยะหยัง, ปิ๊กบ้าน, ก๋า, เน้อ, เจ้า)
   - "ภาษาอีสาน" (เช่น คำว่า แซ่บ, อีหลี, เฮ็ดเวียก, เฮ็ดงาน, คึดฮอด, มื้อนี้, เมื่อยหลาย, บ่, สิไปไส, เมือบ้าน, ขี้ตั๋ว, เด้อ)
   - "ภาษาใต้" (เช่น คำว่า หรอย, แหลง, หม้าย, ไซร, พันพรือ, หลบบ้าน, ขี้ฮก, ได้แรงอก, จังหู้, หวันเย็น, ต๊ะ)
   - "ภาษากลาง" (ภาษาไทยมาตรฐานทั่วไป)
   - "ไม่แน่ใจ" (หากข้อความเป็นคำสั้นเกินไป เป็นชื่อเฉพาะ หรือใช้คำที่พบได้ในทุกภาษาถิ่นจนแยกไม่ได้)

2. ประเมินความมั่นใจ (Confidence):
   - ระบุเป็นตัวเลข 0-99% (อย่าอ้างว่าระบุสำเนียงได้ถูกต้อง 100%)
   - ถ้าข้อมูลไม่เพียงพอ ให้เลือก "ไม่แน่ใจ" และระบุเหตุผลว่าเป็นการประเมินเบื้องต้นจาก AI

3. แปลเป็น "ภาษาไทยกลาง" ที่ถูกต้อง ตรงความหมายเดิม และเป็นธรรมชาติ:
   - ถอดความหมายตามบริบทจริง ไม่แปลตรงตัวทื่อๆ
   - เช่น "กินข้าวแล้วหม้าย" -> "กินข้าวแล้วหรือยัง?" (คำว่า "หม้าย" ในภาษาใต้คือคำถามว่า "หรือยัง / ไหม")
   - "ข้าวซอยถ้วยนี้ลำแต้ๆ" -> "ข้าวซอยชามนี้อร่อยจริงๆ"
   - "เฮ็ดเวียกมื้อนี้เมื่อยหลายเด้อ" -> "ทำงานวันนี้เหนื่อยมากเลยนะ"
   - "หรอยได้แรงอก" -> "อร่อยถึงใจมาก / สะใจมาก"

4. คำอธิบายบริบท (Context Explanation):
   - คำศัพท์สำคัญในประโยค ความหมาย ระดับความสุภาพ (เช่น สุภาพทั่วไป, สนิทสนม, กันเอง) เหมาะใช้กับใคร บริบทการใช้งาน
   - ระดับความเป็นทางการ อารมณ์และน้ำเสียง ผู้ฟังที่เหมาะสม และสรุปความหมายภาพรวม

5. การแปลข้ามภาษาถิ่น (Cross-Dialect Translation):
   - ต้องแปลให้ถูกต้อง สละสลวย เป็นสำนวนที่คนในท้องถิ่นนั้นพูดจริง ห้ามมั่วศัพท์เด็ดขาด
   - ระวังไวยากรณ์: ห้ามมีคำซ้ำซ้อน เช่น ห้ามเกิด "แล้วแล้วหม้าย" หรือ "แล้วแล้วก๋า" ให้เป็น "กินข้าวแล้วหม้าย", "กิ๋นข้าวแล้วก๋า", "กินข้าวแล้วบ่"
   - แปลให้ครบทั้ง: central, north, northeast, south

6. ข้อมูลทางวัฒนธรรม (Cultural Context):
   - พื้นที่และจังหวัดที่ใช้
   - ที่มาหรือการออกเสียงของถิ่นนั้น
   - สถานการณ์ที่ใช้
   - ความแตกต่างจากภาษาไทยกลาง`;

    const response = await callGeminiWithFallback({
      contents: `กรุณาวิเคราะห์และแปลภาษาถิ่นของข้อความนี้อย่างถูกต้องแม่นยำ: "${trimmed}"`,
      config: {
        temperature: 0.1,
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dialect: {
              type: Type.STRING,
              description: 'ชื่อภาษาถิ่น เช่น ภาษาใต้, ภาษาเหนือ (คำเมือง), ภาษาอีสาน, ภาษากลาง, ไม่แน่ใจ',
            },
            regionCode: {
              type: Type.STRING,
              description: 'north, northeast, south, central, หรือ unknown',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'เปอร์เซ็นต์ความมั่นใจ 0-99',
            },
            reason: {
              type: Type.STRING,
              description: 'เหตุผลการวิเคราะห์ภาษาถิ่นและสำเนียง',
            },
            detectedSpeech: {
              type: Type.STRING,
              description: 'ข้อความต้นฉบับที่ได้รับ',
            },
            centralThai: {
              type: Type.STRING,
              description: 'คำแปลภาษาไทยกลางที่ถูกต้องสละสลวย',
            },
            context: {
              type: Type.OBJECT,
              properties: {
                keyWords: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      meaning: { type: Type.STRING },
                      politeness: { type: Type.STRING },
                      suitableFor: { type: Type.STRING },
                      contextualMeaning: { type: Type.STRING },
                      otherMeanings: { type: Type.STRING },
                    },
                    required: ['word', 'meaning', 'politeness', 'suitableFor', 'contextualMeaning'],
                  },
                },
                formality: { type: Type.STRING },
                toneAndEmotion: { type: Type.STRING },
                suitableAudience: { type: Type.STRING },
                summaryExplanation: { type: Type.STRING },
              },
              required: ['keyWords', 'formality', 'toneAndEmotion', 'suitableAudience', 'summaryExplanation'],
            },
            crossTranslations: {
              type: Type.OBJECT,
              properties: {
                central: { type: Type.STRING },
                north: { type: Type.STRING },
                northeast: { type: Type.STRING },
                south: { type: Type.STRING },
              },
              required: ['central', 'north', 'northeast', 'south'],
            },
            culturalContext: {
              type: Type.OBJECT,
              properties: {
                originRegion: { type: Type.STRING },
                etymology: { type: Type.STRING },
                usageSituation: { type: Type.STRING },
                differenceFromCentral: { type: Type.STRING },
              },
              required: ['originRegion', 'etymology', 'usageSituation', 'differenceFromCentral'],
            },
          },
          required: [
            'dialect',
            'regionCode',
            'confidence',
            'reason',
            'detectedSpeech',
            'centralThai',
            'context',
            'crossTranslations',
            'culturalContext',
          ],
        },
      },
    });

    const textOutput = response.text?.trim() || '{}';
    const parsedData = JSON.parse(textOutput);
    return res.json({
      ...parsedData,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Error analyzing dialect:', error);
    return res.json({
      fallback: true,
      isDemo: true,
      error: error?.message || 'Error occurred during AI analysis',
    });
  }
});

// 2. Cross-Dialect Translator Endpoint
app.post('/api/translate-dialect', async (req, res) => {
  try {
    const { text, targetDialect, sourceDialect } = req.body;
    if (!text || !targetDialect) {
      return res.status(400).json({ error: 'Text and targetDialect are required' });
    }

    if (!ai || !apiKey) {
      return res.json({
        fallback: true,
        isDemo: true,
      });
    }

    const prompt = `แปลข้อความ "${text}" จากภาษาถิ่น ${sourceDialect || 'เดิม'} ไปเป็นภาษาถิ่น ${targetDialect} (ตัวเลือก: เหนือ, อีสาน, ใต้, ไทยกลาง)
กฎสำคัญทางภาษาศาสตร์:
1. แปลให้ถูกต้องตามการใช้จริงของคนท้องถิ่น ไม่สร้างคำศัพท์มั่วๆ
2. ระวังโครงสร้างประโยคและคำลงท้าย:
   - เหนือ: กิ๋น, ยะหยัง, ลำ, กึ๊ดเติง, ปิ๊ก, เจ้า, ก๋า, เน้อ
   - อีสาน: กิน, เฮ็ดหยัง, แซ่บ, คึดฮอด, เมือ, เด้อ, บ่, ไป่
   - ใต้: กิน, ทำไร, หรอย, แหลง, หลบบ้าน, หม้าย, ต๊ะ, นิ
   - กลาง: กิน, ทำอะไร, อร่อย, คิดถึง, กลับบ้าน, หรือยัง, นะครับ/ค่ะ
3. ถ้าไม่มั่นใจว่าคำแปลนี้ใช้จริงในพื้นที่ ให้ระบุใน confidenceNote ว่า "AI ไม่มั่นใจว่าคำแปลนี้เป็นรูปแบบที่ใช้จริงในพื้นที่ดังกล่าว"
4. ให้คำแนะนำการออกเสียง และคำอธิบายความหมายสั้นๆ ที่เข้าใจง่าย`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING, description: 'ข้อความที่แปลแล้วตามสำนวนถิ่นที่ถูกต้อง' },
            confidence: { type: Type.NUMBER, description: 'ความมั่นใจ 0-99' },
            confidenceNote: { type: Type.STRING, description: 'คำอธิบายความมั่นใจ' },
            notes: { type: Type.STRING, description: 'คำอธิบายบริบทการใช้ในพื้นที่' },
            pronunciationGuide: { type: Type.STRING, description: 'คำแนะนำการออกเสียงและวรรณยุกต์' },
          },
          required: ['translatedText', 'confidence', 'confidenceNote', 'notes', 'pronunciationGuide'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      ...parsed,
      isDemo: false,
    });
  } catch (err: any) {
    console.error('Error in translate-dialect:', err);
    return res.json({
      fallback: true,
      isDemo: true,
      error: err?.message,
    });
  }
});

// 3. AI Dialect Chat Endpoint
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai || !apiKey) {
      return res.json({
        reply: `(Demo Mode) คุณสามารถถามเกี่ยวกับคำศัพท์และวัฒนธรรมภาษาถิ่น เช่น "แหลง แปลว่าอะไร", "กิ๋นข้าวแลง แปลว่าอะไร", หรือ "ทำไมภาษาใต้ถึงพูดเร็ว" ในโหมดตัวอย่างนี้ ระบบมีฐานข้อมูลคำศัพท์ครบทั้ง 4 ภาคให้คุณสืบค้นได้ทันที`,
        isDemo: true,
      });
    }

    const systemInstruction = `คุณคือ Sabaijai Thua Thai (สบายใจทั่วไทย) AI ผู้ช่วยเชี่ยวชาญด้านภาษาถิ่นไทยและวัฒนธรรม 4 ภาค (เหนือ คำเมือง, อีสาน, ใต้, กลาง)
แนวทางการตอบ:
- เน้นให้ข้อมูลที่ถูกต้อง อบอุ่น เป็นมิตร สุภาพ เข้าใจง่าย
- อธิบายที่มา บริบททางสังคม และระดับความสุภาพ (เช่น พูดกับผู้ใหญ่ได้ไหม, ใช้ในเพื่อนฝูงเท่านั้น)
- หากไม่แน่ใจ ให้บอกตรงๆ ว่าไม่ทราบ หรือเป็นข้อสันนิษฐาน ห้ามแต่งข้อมูลวัฒนธรรมที่ไม่มีหลักฐาน
- ยกตัวอย่างประโยคและการออกเสียงประกอบคำตอบเสมอ
- ปิดท้ายด้วยคำถามแนะนำเพิ่มเติม 2-3 ข้อสั้นๆ ให้ผู้ใช้ถามต่อได้`;

    const chatContents: any[] = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        chatContents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      });
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await callGeminiWithFallback({
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return res.json({
      reply: response.text?.trim() || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้',
      isDemo: false,
    });
  } catch (err: any) {
    console.error('Error in ai-chat:', err);
    return res.json({
      reply: 'ขออภัย ระบบ AI ขัดข้องชั่วคราว คุณยังสามารถค้นหาคำศัพท์ในหน้าพจนานุกรมและแผนที่ภาษาถิ่นได้ตามปกติ',
      isDemo: true,
      error: err?.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sabaijai Thua Thai Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
