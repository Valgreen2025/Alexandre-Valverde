import React, { useState } from 'react';
import { Lesson, DialogueLine, LessonNote } from '../types/lesson';
import { speakText, stopSpeaking } from '../utils/speech';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  Mic,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  MessageSquare,
  Award,
  ChevronRight,
  ChevronDown,
  VolumeX,
  Languages,
} from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
  onOpenFlashcards: () => void;
  onOpenFillInBlanks: () => void;
  onOpenTranslation: () => void;
  onOpenSpeechPractice: () => void;
  onOpenAiChat: () => void;
  onNextLesson?: () => void;
  nextLessonUnlocked?: boolean;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onBack,
  onOpenFlashcards,
  onOpenFillInBlanks,
  onOpenTranslation,
  onOpenSpeechPractice,
  onOpenAiChat,
  onNextLesson,
  nextLessonUnlocked,
}) => {
  const { speechSlowMode, setSpeechSlowMode, user, updateUserProgress } = useApp();
  const [activeSubsectionIdx, setActiveSubsectionIdx] = useState(0);
  const [playingLineNumber, setPlayingLineNumber] = useState<number | null>(null);
  const [playingNoteId, setPlayingNoteId] = useState<number | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(1);

  const currentSubsection = lesson.subsections[activeSubsectionIdx] || lesson.subsections[0];
  const record = user?.history[lesson.id];
  const passed = record?.passed;
  const currentScore = record?.score ?? 0;

  // Speak an individual dialogue line
  const handlePlayLine = (line: DialogueLine) => {
    setPlayingLineNumber(line.number);
    speakText(line.en, 'en-US', speechSlowMode ? 0.75 : 0.9, () => {
      setPlayingLineNumber(null);
    });
  };

  // Speak full subsection sequentially
  const handlePlayAllSubsection = async () => {
    if (!currentSubsection) return;
    for (const line of currentSubsection.dialogue) {
      setPlayingLineNumber(line.number);
      await new Promise<void>((resolve) => {
        speakText(line.en, 'en-US', speechSlowMode ? 0.75 : 0.9, () => {
          resolve();
        });
      });
      // slight pause between phrases
      await new Promise((r) => setTimeout(r, 450));
    }
    setPlayingLineNumber(null);
  };

  // Speak observation English phrases and examples in American English female voice
  const handlePlayNote = (note: LessonNote) => {
    if (playingNoteId === note.id) {
      stopSpeaking();
      setPlayingNoteId(null);
      return;
    }

    setPlayingNoteId(note.id);
    let textToSpeak = '';
    if (note.examples && note.examples.length > 0) {
      textToSpeak = note.examples.map((ex) => ex.en).join('. ');
    } else {
      const quotesMatch = note.content.match(/'([^']+)'|"([^"]+)"/g);
      if (quotesMatch && quotesMatch.length > 0) {
        textToSpeak = quotesMatch.map((q) => q.replace(/['"]/g, '')).join('. ');
      } else {
        textToSpeak = note.title;
      }
    }

    speakText(textToSpeak, 'en-US', speechSlowMode ? 0.75 : 0.9, () => {
      setPlayingNoteId(null);
    });
  };

  const handlePlayExample = (exampleText: string) => {
    speakText(exampleText, 'en-US', speechSlowMode ? 0.75 : 0.9);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Lista de Lições
        </button>

        <div className="flex items-center gap-2">
          {passed ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Aprovado com {currentScore}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <span>Nota atual: {currentScore}% (Meta para passar: 80%)</span>
            </div>
          )}

          <button
            onClick={() => setSpeechSlowMode(!speechSlowMode)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
              speechSlowMode
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {speechSlowMode ? 'Áudio Lento (0.8x)' : '1.0x'}
          </button>
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200">
              Lição {lesson.number} • Assimil Inglês Americano
            </span>
            <span className="text-xs text-indigo-200 font-mono">{lesson.phoneticTitle}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lesson.titleEn}
          </h1>
          <p className="text-lg text-indigo-200 font-medium">
            {lesson.titlePt}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl pt-2 leading-relaxed">
            {lesson.introSummary}
          </p>
        </div>

        {/* Quick Launch Action Pills */}
        <div className="relative z-10 pt-6 flex flex-wrap gap-2.5">
          <button
            onClick={onOpenFlashcards}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={onOpenFillInBlanks}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Preencher Lacunas (Glossário)</span>
          </button>

          <button
            onClick={onOpenTranslation}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>Traduzir (EN ⇄ PT)</span>
          </button>

          <button
            onClick={onOpenSpeechPractice}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>Avaliar Pronúncia & Voz</span>
          </button>

          <button
            onClick={onOpenAiChat}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-indigo-950/40 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Conversar com Tutor IA</span>
          </button>
        </div>
      </div>

      {/* Subsection Tabs (5 phrases chunking as in app 1 image) */}
      {lesson.subsections.length > 1 && (
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {lesson.subsections.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubsectionIdx(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeSubsectionIdx === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sub.title}
            </button>
          ))}
        </div>
      )}

      {/* Dialogue Box (Subsections of 5 phrases) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                {currentSubsection.title}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                (Método Assimil: blocos de 5 frases para fixação)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentSubsection.description}</p>
          </div>

          <button
            onClick={handlePlayAllSubsection}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-indigo-600" />
            <span>Ouvir Sequência Completa</span>
          </button>
        </div>

        {/* Phrases List */}
        <div className="space-y-4">
          {currentSubsection.dialogue.map((line) => {
            const isPlaying = playingLineNumber === line.number;
            return (
              <div
                key={line.number}
                className={`p-4 rounded-2xl border transition-all ${
                  isPlaying
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {line.number}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {line.speaker}:
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {line.en}
                        </h4>
                      </div>

                      {/* Phonetic Transcription */}
                      <p className="text-xs font-mono font-semibold text-amber-900/90">
                        [{line.phonetic}]
                      </p>

                      {/* Portuguese Translation */}
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        {line.pt}
                      </p>

                      {/* Notes tags */}
                      {line.notesRef && line.notesRef.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            Notas:
                          </span>
                          {line.notesRef.map((noteId) => (
                            <button
                              key={noteId}
                              onClick={() => setExpandedNoteId(noteId)}
                              className="w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold flex items-center justify-center cursor-pointer"
                              title={`Ver Observação ${noteId}`}
                            >
                              {noteId}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this line */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePlayLine(line)}
                      title="Ouvir esta frase em inglês (en-US)"
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isPlaying
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={onOpenSpeechPractice}
                      title="Praticar falar esta frase no microfone"
                      className="p-2 rounded-xl bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phonetic Footer (like in the book page) */}
        {lesson.phoneticFull && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-950 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block">
              Pronúncia Fonética Completa (Guia do Livro Assimil)
            </span>
            <p className="font-mono text-xs font-semibold leading-relaxed">
              {lesson.phoneticFull}
            </p>
          </div>
        )}
      </div>

      {/* Observações sobre a Lição (com opção de ouvir e ler!) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Observações & Gramática da Lição
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Explicações culturais e linguísticas detalhadas com opção de ouvir em áudio.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {lesson.notes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const isPlayingThis = playingNoteId === note.id;

            return (
              <div
                key={note.id}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                {/* Note Header / Collapsible Trigger */}
                <div
                  onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center shrink-0">
                      {note.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{note.title}</h4>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Audio Option for the Observation */}
                    <button
                      onClick={() => handlePlayNote(note)}
                      title={isPlayingThis ? 'Pausar áudio' : 'Ouvir frases e pronúncia em inglês americano (voz feminina)'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                        isPlayingThis
                          ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                          : 'bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingThis ? 'Ouvindo...' : 'Ouvir em Inglês'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Note Expanded Body */}
                {isExpanded && (
                  <div className="p-5 pt-2 border-t border-slate-200 bg-white space-y-3 animate-in fade-in">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {note.content}
                    </p>

                    {/* Examples with pronunciation */}
                    {note.examples && note.examples.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Exemplos Práticos:
                        </span>
                        <div className="space-y-1.5">
                          {note.examples.map((ex, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 last:border-none"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{ex.en}</span>{' '}
                                <span className="text-slate-500">— {ex.pt}</span>
                                {ex.phonetic && (
                                  <span className="font-mono text-amber-800 ml-1.5 text-[11px]">
                                    [{ex.phonetic}]
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handlePlayExample(ex.en)}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                                title="Ouvir exemplo"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chapter Glossary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Glossário do Capítulo</h3>
            <p className="text-xs text-slate-500">
              Palavras e expressões essenciais desta lição.
            </p>
          </div>
          <button
            onClick={onOpenFillInBlanks}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Treinar com Lacunas &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {lesson.glossary.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900">{item.word}</span>
                  {item.phonetic && (
                    <span className="font-mono text-[11px] text-amber-800">
                      [{item.phonetic}]
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{item.translation}</p>
              </div>

              <button
                onClick={() => handlePlayExample(item.word)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                title="Ouvir palavra"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Lesson Navigation & Quick Return Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300">
            Fim do Conteúdo da Lição {lesson.number}
          </span>
          <h3 className="text-lg sm:text-xl font-bold">
            Terminou de estudar esta lição?
          </h3>
          <p className="text-xs text-slate-300 max-w-md">
            Pratique nos exercícios para atingir 80% de aproveitamento ou volte ao menu principal para escolher outra lição.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Voltar e Escolher Outra Lição</span>
          </button>

          {nextLessonUnlocked && onNextLesson && (
            <button
              onClick={onNextLesson}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <span>Próxima Lição ({lesson.number + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
