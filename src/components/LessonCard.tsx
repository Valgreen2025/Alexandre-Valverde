import React from 'react';
import { Lesson } from '../types/lesson';
import { useApp } from '../context/AppContext';
import {
  Lock,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  Headphones,
  Mic,
  MessageSquare,
} from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  onSelect: (lesson: Lesson) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onSelect }) => {
  const { isLessonUnlocked, user } = useApp();
  const unlocked = isLessonUnlocked(lesson.id);
  const record = user?.history[lesson.id];
  const passed = record && record.passed;
  const score = record?.score ?? 0;

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        unlocked
          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg group cursor-pointer'
          : 'bg-slate-50 border-slate-200/80 opacity-75'
      }`}
      onClick={() => {
        if (unlocked) onSelect(lesson);
      }}
    >
      {/* Top Banner / Status */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg transition ${
                passed
                  ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400/40'
                  : unlocked
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 group-hover:scale-105'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {unlocked ? lesson.number : <Lock className="w-5 h-5 text-slate-400" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Lição {lesson.number}
                </span>
                {lesson.isRevision && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    Revisão Semanal
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                {lesson.titleEn}
              </h3>
            </div>
          </div>

          {/* Badge: Passed >= 80% or Locked */}
          {passed ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{score}% Concluída</span>
            </div>
          ) : record ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <span>{score}% (meta 80%)</span>
            </div>
          ) : unlocked ? (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Disponível
            </span>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Bloqueada</span>
            </div>
          )}
        </div>

        <div className="mt-2.5">
          <p className="text-sm font-medium text-slate-700">{lesson.titlePt}</p>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{lesson.phoneticTitle}</p>
        </div>

        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {lesson.introSummary}
        </p>
      </div>

      {/* Feature tags */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Subseções de 5 frases com áudio">
            <Headphones className="w-3.5 h-3.5 text-blue-500" />
            {lesson.subsections.length} {lesson.subsections.length === 1 ? 'subseção' : 'subseções'}
          </span>
          <span className="flex items-center gap-1" title="Avaliação de fala fonética">
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            Voz
          </span>
          <span className="flex items-center gap-1" title="Tutor IA disponível">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            Tutor IA
          </span>
        </div>

        {unlocked ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition">
            Iniciar <Play className="w-3.5 h-3.5 fill-indigo-600" />
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            Requer 80% na Lição {lesson.number - 1}
          </span>
        )}
      </div>

      {/* Progress bar if practiced */}
      {unlocked && record && (
        <div className="w-full h-1 bg-slate-100">
          <div
            className={`h-full transition-all duration-300 ${
              passed ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      )}
    </div>
  );
};
