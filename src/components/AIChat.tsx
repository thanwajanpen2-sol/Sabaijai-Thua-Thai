import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Volume2, HelpCircle, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types/dialect';
import { sendChatMessage } from '../services/dialectService';
import { speakThaiText } from '../utils/audioHelper';

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `สวัสดีครับ! ผมคือ **Sabaijai Thua Thai (สบายใจทั่วไทย)** ผู้ช่วย AI วิเคราะห์ภาษาถิ่นและวัฒนธรรมไทย 4 ภาค (เหนือ คำเมือง, อีสาน, ใต้, กลาง) 

คุณสามารถถามเกี่ยวกับความหมายของคำศัพท์, ระดับความสุภาพ, ข้อควรระวังในการพูดกับผู้ใหญ่, หรือที่มาทางวัฒนธรรมของสำเนียงต่างๆ ได้เลยครับ`,
      timestamp: 'ตอนนี้',
      suggestedQuestions: [
        'คำว่า "แหลง" หมายถึงอะไร และใช้ในภาคไหน?',
        'คำว่า "ลำ" กับ "แซ่บ" ต่างกันอย่างไร?',
        'คำว่า "กินข้าวแล้วหม้าย" พูดกับผู้ใหญ่ได้ไหม?',
        'ทำไมสำเนียงใต้ถึงพูดเร็วและตัดพยางค์สั้น?'
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage(text.trim(), historyPayload);

      const modelMsg: ChatMessage = {
        id: 'model-' + Date.now(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'มีคำศัพท์ในความหมายใกล้เคียงกันอีกไหม?',
          'คำนี้มีความหมายในเชิงลบหรือไม่?',
          'มีตัวอย่างบทสนทนาจริงในชีวิตประจำวันไหม?'
        ],
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'model',
          content: 'ขออภัย ระบบไม่สามารถประมวลผลคำตอบได้ชั่วคราว คุณยังสามารถค้นหาคำศัพท์ในหน้าพจนานุกรมได้ครับ',
          timestamp: 'ตอนนี้',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    // Strip markdown formatting for cleaner speech synthesis
    const cleanText = text.replace(/[*_#`]/g, '').slice(0, 200);
    speakThaiText(cleanText);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#121A31]/90 to-[#0B1020]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#6C63FF]" />
            <span>🤖 ถาม AI เรื่องภาษาถิ่นและวัฒนธรรม (AI Dialect Chat)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ปรึกษาและซักถามข้อสงสัยเกี่ยวกับภาษาถิ่น ระดับความสุภาพ มารยาทการสื่อสาร และรากเหง้าวัฒนธรรม 4 ภูมิภาค
          </p>
        </div>

        {/* Chat History Box */}
        <div className="mt-4 h-[440px] overflow-y-auto space-y-4 p-4 rounded-xl bg-black/40 border border-white/10 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] text-white'
                    : 'bg-gradient-to-tr from-[#00C2A8] to-emerald-400 text-[#0B1020]'
                }`}
              >
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[#6C63FF] text-white rounded-tr-none shadow-md shadow-[#6C63FF]/20'
                    : 'bg-[#182344] text-slate-200 border border-white/10 rounded-tl-none shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1.5 mb-1.5">
                  <span className="font-semibold text-slate-300">
                    {msg.role === 'user' ? 'คุณ' : 'Sabaijai Thua Thai'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-normal text-[13px] leading-relaxed">
                  {msg.content}
                </div>

                {msg.role === 'model' && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleSpeak(msg.content)}
                      className="flex items-center space-x-1 text-[11px] text-[#00C2A8] hover:underline"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>ฟังเสียงอ่าน</span>
                    </button>
                  </div>
                )}

                {/* Suggested prompt chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-semibold text-[#FFD166] uppercase tracking-wider block">
                      คำถามที่เกี่ยวข้อง:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((sq, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sq)}
                          disabled={isLoading}
                          className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 hover:border-[#6C63FF] hover:text-white transition-all text-left"
                        >
                          "{sq}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00C2A8] to-emerald-400 text-[#0B1020]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-[#182344] border border-white/10 p-3.5 text-xs text-slate-300 flex items-center space-x-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#00C2A8]" />
                <span>AI กำลังวิเคราะห์และเรียบเรียงข้อมูลภาษาถิ่น...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำถามเกี่ยวกับภาษาถิ่น เช่น คำว่า แหลง หมายถึงอะไร? หรือ พูดกับผู้ใหญ่ได้ไหม?..."
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#6C63FF] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 shadow-lg shadow-[#6C63FF]/20 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
