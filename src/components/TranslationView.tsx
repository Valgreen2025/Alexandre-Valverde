import React, { useState } from 'react';
import { Lesson, TranslateExercise } from '../types/lesson';
import { speakText } from '../utils/speech';
import { useApp } from '../context/AppContext';
import {
  Languages,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Award,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface TranslationViewProps {
  lesson: Lesson;
  onFinish: (score: number) => void;
  onBackToLessons?: () => void;
  onBackToLesson?: () => void;
  onNextLesson?: () => void;
  nextLessonUnlocked?: boolean;
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  lesson,
  onFinish,
  onBackToLessons,
  onBackToLesson,
  onNextLesson,
  nextLessonUnlocked,
}) => {
  const { addXp, speechSlowMode } = useApp();
  const exercises = lesson.exercises.translate;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const currentExercise: TranslateExercise | undefined = exercises[currentIndex];

  // Randomly shuffle options whenever exercise changes
  React.useEffect(() => {
    if (currentExercise && currentExercise.options) {
      const copy = [...currentExercise.options];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setShuffledOptions(copy);
    }
  }, [currentIndex, currentExercise]);

  if (!currentExercise || exercises.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
        <Languages className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Exercícios em atualização</h3>
        <p className="text-xs text-slate-500 mt-1">Nenhum exercício de tradução disponível nesta lição.</p>
      </div>
    );
  }

  const isEnToPt = currentExercise.direction === 'en_to_pt';

  const handlePlayAudio = () => {
    const textToSpeak = isEnToPt ? currentExercise.promptEn : currentExercise.correctAnswer;
    speakText(textToSpeak, 'en-US', speechSlowMode ? 0.75 : 0.9);
  };

  const handleSelect = (option: string) => {
    if (isChecked) return;
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setIsChecked(true);
    setScoreHistory((prev) => ({ ...prev, [currentIndex]: correct }));

    if (correct) {
      addXp(15);
      // Speak the English phrase
      handlePlayAudio();
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setIsCorrect(false);
    } else {
      setIsCompleted(true);
      const correctCount = Object.values(scoreHistory).filter(Boolean).length + (isCorrect ? 1 : 0);
      const finalScore = Math.round((correctCount / exercises.length) * 100);
      onFinish(finalScore);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setIsCorrect(false);
    setScoreHistory({});
    setIsCompleted(false);
  };

  if (isCompleted) {
    const correctCount = Object.values(scoreHistory).filter(Boolean).length;
    const finalScore = Math.round((correctCount / exercises.length) * 100);
    const passed = finalScore >= 80;

    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-sm animate-in fade-in">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <Award className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900">
          {passed ? 'Excelente Tradução!' : 'Treino de Tradução Finalizado!'}
        </h3>

        <p className="text-sm text-slate-600 mt-2">
          {passed
            ? `Você alcançou ${finalScore}% de precisão na tradução vice-versa (meta mínima de 80% superada!).`
            : `Você alcançou ${finalScore}%. Para dominar o método Assimil, tente atingir pelo menos 80%!`}
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
          <div>
            <span className={`text-3xl font-black ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {finalScore}%
            </span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pontuação</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-3xl font-black text-indigo-600">
              {correctCount} / {exercises.length}
            </span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Acertos</p>
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

          {(passed || nextLessonUnlocked) && onNextLesson && (
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
              onClick={handleReset}
              className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
            >
              Refazer Tradução
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt text must be the source sentence in the question's source language.
  // We guarantee promptText is never identical to correctAnswer!
  const promptText =
    currentExercise.direction === 'en_to_pt'
      ? (currentExercise.promptEn.trim() !== currentExercise.correctAnswer.trim()
          ? currentExercise.promptEn
          : currentExercise.promptPt)
      : (currentExercise.promptPt.trim() !== currentExercise.correctAnswer.trim()
          ? currentExercise.promptPt
          : currentExercise.promptEn);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Exercise progress header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-indigo-600" />
          <span>
            Tradução {currentIndex + 1} de {exercises.length}
          </span>
        </div>

        {/* Direction badge: EN -> PT or PT -> EN */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            isEnToPt
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <ArrowLeftRight className="w-3 h-3" />
          <span>{isEnToPt ? '🇺🇸 Inglês ➔ 🇧🇷 Português' : '🇧🇷 Português ➔ 🇺🇸 Inglês'}</span>
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {isEnToPt ? 'Traduza do inglês para o português:' : 'Traduza do português para o inglês:'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              "{promptText}"
            </h2>
          </div>

          {/* Audio button for English pronunciation (works in both directions) */}
          <button
            onClick={handlePlayAudio}
            title={isEnToPt ? "Ouvir a frase em inglês (en-US)" : "Ouvir a pronúncia em inglês (en-US)"}
            className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Translation Options */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Escolha a tradução mais correta:
          </span>

          <div className="space-y-2">
            {(shuffledOptions.length > 0 ? shuffledOptions : currentExercise.options).map((option, idx) => {
              const isSelected = selectedOption === option;
              let itemClass =
                'border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800';

              if (isChecked) {
                if (option === currentExercise.correctAnswer) {
                  itemClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  itemClass = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                } else {
                  itemClass = 'border-slate-200 bg-white opacity-40';
                }
              } else if (isSelected) {
                itemClass = 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-500/20';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  disabled={isChecked}
                  className={`w-full p-4 rounded-2xl border text-left text-sm transition flex items-center justify-between cursor-pointer ${itemClass}`}
                >
                  <span>{option}</span>

                  {isChecked && option === currentExercise.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isChecked && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message */}
        {isChecked && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-bold">
                {isCorrect ? 'Tradução Perfeita!' : 'Não está correto.'}
              </p>
              {!isCorrect && (
                <p className="text-xs">
                  Resposta exata:{' '}
                  <span className="font-bold">{currentExercise.correctAnswer}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between">
          {!isChecked ? (
            <button
              onClick={handleCheck}
              disabled={!selectedOption}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition cursor-pointer ${
                selectedOption
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Verificar Tradução
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentIndex < exercises.length - 1 ? 'Próxima Frase' : 'Ver Resultado'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
