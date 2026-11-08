import React, { useState, useRef, useEffect } from 'react';
import { Lesson } from '../types/lesson';
import { speakText, stopSpeaking } from '../utils/speech';
import { useApp } from '../context/AppContext';
import {
  Send,
  Bot,
  User,
  Volume2,
  Sparkles,
  RotateCcw,
  Loader2,
  MessageSquare,
  X,
} from 'lucide-react';

interface AiTutorChatProps {
  lesson: Lesson;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const AiTutorChat: React.FC<AiTutorChatProps> = ({ lesson, onClose }) => {
  const { user, speechSlowMode } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello! 👋 Sou o seu Tutor IA de Inglês Americano pelo método Assimil. Estamos na Lição ${lesson.number}: "${lesson.titleEn}" (${lesson.titlePt}). Podemos praticar o diálogo em formato de encenação (roleplay), tirar dúvidas sobre pronúncia ou criar frases juntos. Como você gostaria de começar?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    `🎭 Vamos encenar o diálogo da Lição ${lesson.number}? Você começa!`,
    `📖 Qual a diferença entre as expressões desta lição?`,
    `🗣️ Como é a pronúncia correta de "${lesson.subsections[0]?.dialogue[0]?.en || 'hello'}"?`,
    `🇺🇸 Crie uma pequena conversa prática nos EUA usando o vocabulário deste capítulo.`,
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build dialogue snippet for context
      const snippet = lesson.subsections
        .flatMap((s) => s.dialogue)
        .map((d) => `${d.speaker}: ${d.en} (${d.pt})`)
        .join('\n');

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonNumber: lesson.number,
          lessonTitle: `${lesson.titleEn} (${lesson.titlePt})`,
          dialogueSnippet: snippet,
          message: text.trim(),
          conversationHistory,
        }),
      });

      const data = await res.json();
      const botReply =
        data.reply ||
        `Excelente pergunta sobre a Lição ${lesson.number}! Como vimos no método Assimil, a chave é repetir as frases em voz alta observando a entonação e as contrações. Deseja encenar o diálogo comigo agora?`;

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Olá! Vamos praticar o diálogo da Lição ${lesson.number}: "${lesson.titleEn}". Você prefere começar fazendo a primeira fala ou quer que eu comece?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      stopSpeaking();
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(msg.id);

    // Always speak with American English female voice
    speakText(msg.text, 'en-US', speechSlowMode ? 0.8 : 0.95, () => {
      setPlayingMessageId(null);
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[600px] max-w-2xl mx-auto overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-700 to-blue-700 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-xs">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold leading-tight">Tutor IA Assimil</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-xs text-indigo-100">
              Lição {lesson.number}: {lesson.titleEn}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isPlaying = playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-indigo-600 shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] space-y-1 ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>

                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleSpeakMessage(msg)}
                      className={`hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer ${
                        isPlaying ? 'text-indigo-600 font-bold' : ''
                      }`}
                      title="Ouvir áudio da resposta"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isPlaying ? 'Parar' : 'Ouvir'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 p-2 bg-indigo-50/60 rounded-xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>O Tutor IA está digitando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-medium whitespace-nowrap transition border border-slate-200 cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Converse com a IA sobre a Lição ${lesson.number}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm text-slate-800 transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-xl transition cursor-pointer ${
              inputText.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
