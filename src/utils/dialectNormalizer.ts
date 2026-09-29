/**
 * Thai Dialect Phonetic Normalizer & Speech-to-Text Enhancer
 * Accurately cleans up Speech-to-Text typos and phonetic misrecognitions from Web Speech API (th-TH)
 * without corrupting user intent, vocabulary, or grammar.
 */

export interface NormalizedDialectText {
  original: string;
  normalized: string;
  detectedHints: string[];
  suggestedDialect?: 'south' | 'north' | 'northeast' | 'central';
}

interface PhoneticRule {
  pattern: RegExp;
  replacement: string;
  hint?: string;
  dialect?: 'south' | 'north' | 'northeast' | 'central';
}

const PHONETIC_CORRECTIONS: PhoneticRule[] = [
  // 1. South (ใต้) - Specific phonetic misrecognitions
  {
    pattern: /(กินข้าว|ทานข้าว)แล้ว(ไม้|ม้าย|ม่าย|ไหม้|หมัย)/g,
    replacement: '$1แล้วหม้าย',
    hint: 'หม้าย (หรือยัง)',
    dialect: 'south',
  },
  {
    pattern: /(ใช่|จริง)หม้าย(?=[^ก-๙]|$)/g,
    replacement: '$1หม้าย',
    hint: 'หม้าย (ไหม/หรือเปล่า)',
    dialect: 'south',
  },
  {
    pattern: /หรอย(จังฮู้|จังฮู)/g,
    replacement: 'หรอยจังหู้',
    hint: 'หรอยจังหู้ (อร่อย/สนุกมาก)',
    dialect: 'south',
  },
  {
    pattern: /(ไซร้|ไซร์)(?=[^ก-๙]|$)/g,
    replacement: 'ไซร',
    hint: 'ไซร (ทำไม)',
    dialect: 'south',
  },
  {
    pattern: /(พันพรื่อ|พันพรือมั่ง)/g,
    replacement: 'พันพรือ',
    hint: 'พันพรือ (เป็นอย่างไร)',
    dialect: 'south',
  },
  {
    pattern: /วันเย็น(?=[^ก-๙]|$)/g,
    replacement: 'หวันเย็น',
    hint: 'หวันเย็น (ตอนเย็น)',
    dialect: 'south',
  },

  // 2. North (เหนือ) - Specific phonetic misrecognitions
  {
    pattern: /(กิ๋นเข้า|กินเข้า)(?=[^ก-๙]|$)/g,
    replacement: 'กิ๋นข้าว',
    hint: 'กิ๋นข้าว (ทานข้าว)',
    dialect: 'north',
  },
  {
    pattern: /กิ๋นข้าวแล้วกาเจ้า(?=[^ก-๙]|$)/g,
    replacement: 'กิ๋นข้าวแล้วก๋าเจ้า',
    hint: 'ก๋าเจ้า (หรือยังคะ)',
    dialect: 'north',
  },
  {
    pattern: /กิ๋นข้าวแล้วกา(?=[^ก-๙]|$)/g,
    replacement: 'กิ๋นข้าวแล้วก๋า',
    hint: 'ก๋า (หรือยัง)',
    dialect: 'north',
  },
  {
    pattern: /ขะใจ(?=[^ก-๙]|หน้อย|$)/g,
    replacement: 'ขะใจ๋',
    hint: 'ขะใจ๋ (รีบๆ)',
    dialect: 'north',
  },
  {
    pattern: /กึดเติง/g,
    replacement: 'กึ๊ดเติง',
    hint: 'กึ๊ดเติง (คิดถึง)',
    dialect: 'north',
  },
  {
    pattern: /ลำแต้(?=[^ก-๙]|$)/g,
    replacement: 'ลำแต้ๆ',
    hint: 'ลำแต้ๆ (อร่อยจริงๆ)',
    dialect: 'north',
  },

  // 3. Northeast (อีสาน) - Specific phonetic misrecognitions
  {
    pattern: /แซบ(หลาย|อีหลี|คัก|คักแหน่)?(?=[^ก-๙]|$)/g,
    replacement: 'แซ่บ$1',
    hint: 'แซ่บ (อร่อย)',
    dialect: 'northeast',
  },
  {
    pattern: /เป็นต่าฮัก/g,
    replacement: 'เป็นตาฮัก',
    hint: 'เป็นตาฮัก (น่ารัก)',
    dialect: 'northeast',
  },
  {
    pattern: /คึดฮอดหลายๆ/g,
    replacement: 'คึดฮอดหลาย',
    hint: 'คึดฮอดหลาย (คิดถึงมาก)',
    dialect: 'northeast',
  },
];

export function normalizeDialectSpeech(rawText: string): NormalizedDialectText {
  if (!rawText || !rawText.trim()) {
    return { original: '', normalized: '', detectedHints: [] };
  }

  const cleaned = rawText.trim().replace(/\s+/g, ' ');
  let normalized = cleaned;
  const hints: string[] = [];
  const dialectVotes: Record<string, number> = { south: 0, north: 0, northeast: 0, central: 0 };

  for (const rule of PHONETIC_CORRECTIONS) {
    if (rule.pattern.test(normalized)) {
      normalized = normalized.replace(rule.pattern, rule.replacement as any);
      if (rule.hint && !hints.includes(rule.hint)) {
        hints.push(rule.hint);
      }
      if (rule.dialect) {
        dialectVotes[rule.dialect] += 2;
      }
    }
  }

  // Check signature vocabulary presence for dialect hint
  if (/หม้าย|หรอย|แหลง|ไซร|หลบบ้าน|หวันเย็น|ขี้ฮก|พันพรือ|นุ้ย|ฉาน|พี่บ่าว/.test(normalized)) {
    dialectVotes.south += 3;
  }
  if (/กิ๋น|ลำ|ขะใจ๋|กึ๊ดเติง|ยะหยัง|ยะก๋าน|ตั๋ว|เปิ้น|บ่าดาย|ขนาดแต้|เจ้า|เน้อ/.test(normalized)) {
    dialectVotes.north += 3;
  }
  if (/แซ่บ|เฮ็ดเวียก|เฮ็ดหยัง|มื้อนี้|มื้ออื่น|เมื่อยหลาย|บ่|เป็นตาฮัก|ม่วน|สิไปไส|อีหลี|เด้อ/.test(normalized)) {
    dialectVotes.northeast += 3;
  }

  let topDialect: 'south' | 'north' | 'northeast' | 'central' | undefined = undefined;
  let maxVote = 0;
  for (const [d, count] of Object.entries(dialectVotes)) {
    if (count > maxVote) {
      maxVote = count;
      topDialect = d as any;
    }
  }

  return {
    original: cleaned,
    normalized: normalized,
    detectedHints: hints,
    suggestedDialect: maxVote >= 2 ? topDialect : undefined,
  };
}
