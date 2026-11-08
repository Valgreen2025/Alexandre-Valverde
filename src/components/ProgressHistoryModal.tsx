import React from 'react';
import { useApp } from '../context/AppContext';
import { ALL_105_LESSONS as ASSIMIL_LESSONS } from '../data/lessonsData';
import {
  X,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  Calendar,
  Layers,
  Mic,
  BookOpen,
} from 'lucide-react';

interface ProgressHistoryModalProps {
  onClose: () => void;
  onSelectLesson?: (lessonId: number) => void;
}

export const ProgressHistoryModal: React.FC<ProgressHistoryModalProps> = ({
  onClose,
  onSelectLesson,
}) => {
  const { user } = useApp();

  if (!user) return null;

  const historyEntries = Object.values(user.history);
  const completedCount = historyEntries.filter((h) => h.passed).length;
  const totalLessons = ASSIMIL_LESSONS.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
              <Award className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Histórico de Progresso</h2>
              <p className="text-xs text-indigo-200">
                Acompanhamento detalhado das lições e critério de 80%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Summary Stats */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Aprovadas</span>
              </div>
              <span className="text-xl font-black text-slate-900">
                {completedCount} <span className="text-xs font-normal text-slate-400">/ {totalLessons}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Streak</span>
              </div>
              <span className="text-xl font-black text-orange-600">
                {user.streakDays} <span className="text-xs font-normal text-slate-400">dias</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                <span>Total XP</span>
              </div>
              <span className="text-xl font-black text-indigo-600">
                {user.totalXp}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Meta Mínima</span>
              </div>
              <span className="text-xl font-black text-emerald-600">
                80%
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
            <span className="font-bold">Regra de progressão:</span>
            <span>Uma lição só é desbloqueada se a anterior atingir no mínimo 80% de pontuação.</span>
          </div>
        </div>

        {/* Detailed Lessons List */}
        <div className="p-6 max-h-[380px] overflow-y-auto space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Registro por Lição
          </h3>

          {ASSIMIL_LESSONS.map((lesson) => {
            const rec = user.history[lesson.id];
            const isPassed = rec && rec.passed;
            const hasAttempts = rec && rec.attempts > 0;

            return (
              <div
                key={lesson.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-700'
                        : hasAttempts
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {lesson.number}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {lesson.titleEn}{' '}
                      <span className="font-normal text-slate-500">— {lesson.titlePt}</span>
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                      {hasAttempts ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(rec.lastAttemptAt).toLocaleDateString()}
                          </span>
                          <span>Tentativas: {rec.attempts}</span>
                          {rec.speechAccuracyAvg !== undefined && (
                            <span className="text-rose-600 font-semibold">
                              Fala: {rec.speechAccuracyAvg}%
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="italic text-slate-400">Ainda não praticada</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Status Tag */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {hasAttempts ? (
                    <div className="text-right">
                      <span
                        className={`text-base font-extrabold ${
                          isPassed ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {rec.score}%
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isPassed ? 'Aprovado (≥80%)' : 'Abaixo de 80%'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">—</span>
                  )}

                  {onSelectLesson && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectLesson(lesson.id);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold text-xs transition cursor-pointer"
                    >
                      Praticar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
