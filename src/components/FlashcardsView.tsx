import React, { useState } from 'react';
import { Lesson, DialogueLine } from '../types/lesson';
import { speakText, stopSpeaking } from '../utils/speech';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  RotateCw,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface FlashcardsViewProps {
  lesson: Lesson;
  onFinish: (score: number) => void;
  onBackToLessons?: () => void;
  onBackToLesson?: () => void;
  onNextLesson?: () => void;
  nextLessonUnlocked?: boolean;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  lesson,
  onFinish,
  onBackToLessons,
  onBackToLesson,
  onNextLesson,
  nextLessonUnlocked,
}) => {
  const { speechSlowMode, addXp } = useApp();

  // Aggregate dialogue lines from all subsections
  const cards: DialogueLine[] = lesson.subsections.flatMap((s) => s.dialogue);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [ratings, setRatings] = useState<Record<number, 'easy' | 'good' | 'hard'>>({});
  const [isDone, setIsDone] = useState(false);

  const currentCard = cards[currentIndex];

  const handlePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;

    setIsPlayingAudio(true);
    speakText(
      currentCard.en,
      'en-US',
      speechSlowMode ? 0.75 : 0.9,
      () => setIsPlayingAudio(false)
    );
  };

  const handleRate = (rating: 'easy' | 'good' | 'hard') => {
    const newRatings = { ...ratings, [currentIndex]: rating };
    setRatings(newRatings);

    if (rating === 'easy') addXp(15);
    else if (rating === 'good') addXp(10);
    else addXp(5);

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsDone(true);
      // Calculate flashcard mastery score
      const easyCount = Object.values(newRatings).filter((r) => r === 'easy').length;
      const goodCount = Object.values(newRatings).filter((r) => r === 'good').length;
      const score = Math.round(
        ((easyCount * 1.0 + goodCount * 0.8) / Math.max(1, cards.length)) * 100
      );
      onFinish(score);
    }
  };

  if (isDone) {
    const easyCount = Object.values(ratings).filter((r) => r === 'easy').length;
    const goodCount = Object.values(ratings).filter((r) => r === 'good').length;
    const finalScore = Math.round(
      ((easyCount * 1.0 + goodCount * 0.8) / Math.max(1, cards.length)) * 100
    );

    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-sm animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4">
          <Trophy className="w-9 h-9" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Flashcards Concluídos!</h3>
        <p className="text-sm text-slate-600 mt-2">
          Você praticou todas as {cards.length} frases da Lição {lesson.number}.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
          <div>
            <span className="text-2xl font-black text-emerald-600">{finalScore}%</span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Domínio</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-2xl font-black text-indigo-600">+{cards.length * 10} XP</span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pontos Ganhos</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {onBackToLessons && (
            <button
              onClick={onBackToLessons}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar e Escolher Outra Lição</span>
            </button>
          )}

          {nextLessonUnlocked && onNextLesson && (
            <button
              onClick={onNextLesson}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para a Lição {lesson.number + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {onBackToLesson && (
              <button
                onClick={onBackToLesson}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Resumo da Lição {lesson.number}
              </button>
            )}

            <button
              onClick={() => {
                setIsDone(false);
                setCurrentIndex(0);
                setIsFlipped(false);
                setRatings({});
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
            >
              Praticar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Cartão {currentIndex + 1} de {cards.length}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Flip Card Container */}
      <div
        className="relative min-h-[300px] sm:min-h-[340px] w-full rounded-3xl bg-white border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all hover:border-indigo-300 select-none group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Flip tag & Audio */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            <RotateCw className="w-3 h-3 text-indigo-500" />
            {isFlipped ? 'Verso (Português)' : 'Frente (Inglês)'} - Toque para virar
          </span>

          <button
            onClick={handlePlayAudio}
            title="Ouvir pronúncia nativa (en-US)"
            className={`p-2.5 rounded-full transition cursor-pointer ${
              isPlayingAudio
                ? 'bg-indigo-600 text-white scale-110 shadow-md'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isFlipped ? (
          <div className="text-center py-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Frase #{currentCard.number} • {currentCard.speaker}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {currentCard.en}
            </h2>

            {currentCard.phonetic && (
              <div className="mt-4 inline-block px-3.5 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 font-mono text-sm font-semibold">
                Pronúncia: [{currentCard.phonetic}]
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 animate-in fade-in zoom-in-95">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
              Tradução & Significado
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {currentCard.pt}
            </h2>

            <div className="mt-4 text-xs text-slate-500 italic max-w-sm mx-auto">
              Original em inglês: "{currentCard.en}"
            </div>
          </div>
        )}

        {/* Hint / Footer */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-400">
          Clique no cartão para {isFlipped ? 'ver o inglês' : 'ver a tradução'}
        </div>
      </div>

      {/* Rating Buttons */}
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        <button
          onClick={() => handleRate('hard')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 mb-1 text-rose-500" />
          <span>Difícil</span>
          <span className="text-[10px] font-normal text-rose-500 mt-0.5">Revisar</span>
        </button>

        <button
          onClick={() => handleRate('good')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 mb-1 text-blue-500" />
          <span>Bom</span>
          <span className="text-[10px] font-normal text-blue-500 mt-0.5">+10 XP</span>
        </button>

        <button
          onClick={() => handleRate('easy')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 mb-1 text-emerald-500" />
          <span>Fácil</span>
          <span className="text-[10px] font-normal text-emerald-600 mt-0.5">+15 XP</span>
        </button>
      </div>
    </div>
  );
};
