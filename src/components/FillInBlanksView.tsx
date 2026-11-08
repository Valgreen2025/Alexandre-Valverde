import React, { useState } from 'react';
import { Lesson, FillInTheBlankExercise } from '../types/lesson';
import { speakText } from '../utils/speech';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
} from 'lucide-react';

interface FillInBlanksViewProps {
  lesson: Lesson;
  onFinish: (score: number) => void;
  onBackToLessons?: () => void;
  onBackToLesson?: () => void;
  onNextLesson?: () => void;
  nextLessonUnlocked?: boolean;
}

export const FillInBlanksView: React.FC<FillInBlanksViewProps> = ({
  lesson,
  onFinish,
  onBackToLessons,
  onBackToLesson,
  onNextLesson,
  nextLessonUnlocked,
}) => {
  const { addXp, speechSlowMode } = useApp();
  const exercises = lesson.exercises.fillInTheBlank;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledBank, setShuffledBank] = useState<string[]>([]);

  const currentExercise: FillInTheBlankExercise | undefined = exercises[currentIndex];

  React.useEffect(() => {
    if (currentExercise && currentExercise.blankOptions) {
      const copy = [...currentExercise.blankOptions];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      setShuffledBank(copy);
    }
  }, [currentIndex, currentExercise]);

  if (!currentExercise) {
    return <div className="text-center py-8">Nenhum exercício disponível nesta lição.</div>;
  }

  // Count how many blanks are in the current sentence
  const blanksCount = (currentExercise.sentenceWithBlank.match(/\[blank\]/g) || []).length;

  // Helper to replace each [blank] sequentially with its corresponding word in correctWords
  const buildFullSentence = (exercise: FillInTheBlankExercise): string => {
    let blankIdx = 0;
    return exercise.sentenceWithBlank.replace(/\[blank\]/g, () => {
      const word = exercise.correctWords[blankIdx] ?? exercise.correctWords[0] ?? '';
      blankIdx += 1;
      return word;
    });
  };

  const handleSelectWord = (word: string) => {
    if (isAnswerChecked) return;
    if (selectedWords.length < blanksCount) {
      setSelectedWords([...selectedWords, word]);
      speakText(word, 'en-US', speechSlowMode ? 0.75 : 0.9);
    }
  };

  const handleRemoveSelectedWord = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedWords(selectedWords.filter((_, i) => i !== idx));
  };

  const handleCheckAnswer = () => {
    if (selectedWords.length !== blanksCount) return;

    // Check case-insensitive match
    const correct = currentExercise.correctWords.every(
      (cw, i) => (selectedWords[i] || '').trim().toLowerCase() === cw.trim().toLowerCase()
    );

    setIsCorrect(correct);
    setIsAnswerChecked(true);
    setScoreHistory((prev) => ({ ...prev, [currentIndex]: correct }));

    const fullSentence = buildFullSentence(currentExercise);
    if (correct) {
      addXp(20);
    }
    // Play full correct sentence audio with all blanks properly filled in sequence
    speakText(fullSentence, 'en-US', speechSlowMode ? 0.75 : 0.9);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWords([]);
      setIsAnswerChecked(false);
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
    setSelectedWords([]);
    setIsAnswerChecked(false);
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
          {passed ? 'Excelente Desempenho!' : 'Exercício Finalizado!'}
        </h3>

        <p className="text-sm text-slate-600 mt-2">
          {passed
            ? `Você atingiu ${finalScore}% de acertos nas lacunas do glossário (mínimo de 80% superado!).`
            : `Você atingiu ${finalScore}%. Para desbloquear a próxima etapa com perfeição, tente alcançar 80%!`}
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
          <div>
            <span
              className={`text-3xl font-black ${passed ? 'text-emerald-600' : 'text-amber-600'}`}
            >
              {finalScore}%
            </span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pontuação</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-3xl font-black text-indigo-600">
              {correctCount} / {exercises.length}
            </span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Frases Corretas</p>
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
              Refazer Exercício
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render sentence with interactive blank slots
  const parts = currentExercise.sentenceWithBlank.split(/\[blank\]/);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Exercise progress header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>
            Exercício {currentIndex + 1} de {exercises.length}
          </span>
        </div>
        <span className="text-slate-400">Glossário do Capítulo</span>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Complete em inglês a partir do significado:
            </span>
            <p className="text-lg font-bold text-slate-800">
              "{currentExercise.questionPt}"
            </p>
          </div>

          <button
            onClick={() => {
              const fullSentence = buildFullSentence(currentExercise);
              speakText(fullSentence, 'en-US', speechSlowMode ? 0.75 : 0.9);
            }}
            title="Ouvir frase em inglês americano (voz feminina)"
            className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer shrink-0"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Sentence with Slot Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xl font-medium text-slate-800 flex flex-wrap items-center gap-2 leading-relaxed">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < blanksCount && (
                <button
                  onClick={() => handleRemoveSelectedWord(index)}
                  disabled={isAnswerChecked || !selectedWords[index]}
                  className={`min-w-[80px] h-10 px-3 rounded-xl border-2 text-base font-bold transition flex items-center justify-center cursor-pointer ${
                    selectedWords[index]
                      ? isAnswerChecked
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                          : 'bg-rose-100 border-rose-500 text-rose-800'
                        : 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                      : 'bg-white border-dashed border-slate-300 text-slate-400 hover:border-slate-400'
                  }`}
                  title={selectedWords[index] ? 'Clique para remover a palavra' : 'Espaço para preencher'}
                >
                  {selectedWords[index] || '_____'}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bank of words from the glossary */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Banco de Palavras do Glossário:
          </p>
          <div className="flex flex-wrap gap-2">
            {(shuffledBank.length > 0 ? shuffledBank : currentExercise.blankOptions).map((word, idx) => {
              const isSelected = selectedWords.includes(word);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectWord(word)}
                  disabled={isSelected || isAnswerChecked}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 shadow-xs active:scale-95'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message */}
        {isAnswerChecked && (
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
                {isCorrect ? 'Correto! Muito bem!' : 'Não foi dessa vez.'}
              </p>
              {!isCorrect && (
                <p className="text-xs">
                  Resposta correta:{' '}
                  <span className="font-bold">{currentExercise.correctWords.join(' ')}</span>
                </p>
              )}
              {currentExercise.explanation && (
                <p className="text-xs opacity-80">{currentExercise.explanation}</p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedWords.length !== blanksCount}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition cursor-pointer ${
                selectedWords.length === blanksCount
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Verificar Resposta
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
