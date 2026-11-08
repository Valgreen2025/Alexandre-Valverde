import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ALL_105_LESSONS as ASSIMIL_LESSONS } from './data/lessonsData';
import { Lesson } from './types/lesson';
import { Header } from './components/Header';
import { LessonCard } from './components/LessonCard';
import { LessonViewer } from './components/LessonViewer';
import { FlashcardsView } from './components/FlashcardsView';
import { FillInBlanksView } from './components/FillInBlanksView';
import { SpeechPracticeView } from './components/SpeechPracticeView';
import { TranslationView } from './components/TranslationView';
import { AiTutorChat } from './components/AiTutorChat';
import { ProgressHistoryModal } from './components/ProgressHistoryModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GoogleLoginGate } from './components/GoogleLoginGate';
import {
  BookOpen,
  Layers,
  Mic,
  MessageSquare,
  Award,
  Sparkles,
  Search,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  Headphones,
  Languages,
} from 'lucide-react';

type ActiveTab = 'dialogue' | 'flashcards' | 'blanks' | 'translation' | 'speech' | 'chat';

function MainApp() {
  const { user, isAuthenticated, authLoading, isLessonUnlocked, updateUserProgress } = useApp();

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dialogue');

  // Modals
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [googleLoginOpen, setGoogleLoginOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unlocked' | 'passed'>('all');

  // Mandatory Google Login Gate: user can only start the app after logging in with Google
  if (authLoading || !isAuthenticated || !user) {
    return <GoogleLoginGate />;
  }

  const filteredLessons = ASSIMIL_LESSONS.filter((lesson) => {
    const matchesSearch =
      lesson.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.titlePt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.number.toString() === searchQuery.trim();

    if (!matchesSearch) return false;

    const unlocked = isLessonUnlocked(lesson.id);
    const passed = user.history[lesson.id]?.passed;

    if (filterType === 'unlocked') return unlocked;
    if (filterType === 'passed') return passed;
    return true;
  });

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('dialogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishFlashcards = (score: number) => {
    if (!selectedLesson) return;
    updateUserProgress(selectedLesson.id, score, { flashcardsCompleted: true });
  };

  const handleFinishBlanks = (score: number) => {
    if (!selectedLesson) return;
    updateUserProgress(selectedLesson.id, score, { exercisesScore: score });
  };

  const handleFinishTranslation = (score: number) => {
    if (!selectedLesson) return;
    updateUserProgress(selectedLesson.id, score, { exercisesScore: score });
  };

  const handleFinishSpeech = (score: number) => {
    if (!selectedLesson) return;
    updateUserProgress(selectedLesson.id, score, { speechAccuracyAvg: score });
  };

  const nextLessonObj = selectedLesson
    ? ASSIMIL_LESSONS.find((l) => l.id === selectedLesson.id + 1)
    : undefined;
  const isNextUnlocked = nextLessonObj ? isLessonUnlocked(nextLessonObj.id) : false;

  const handleGoToNextLesson = () => {
    if (nextLessonObj && isLessonUnlocked(nextLessonObj.id)) {
      handleLessonSelect(nextLessonObj);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenReminder={() => setReminderOpen(true)}
        onOpenGoogleLogin={() => setGoogleLoginOpen(true)}
        onBackToHome={() => setSelectedLesson(null)}
        isHome={!selectedLesson}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!selectedLesson ? (
          /* Home Screen: Course Overview & Lesson List */
          <div className="space-y-8 animate-in fade-in">
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-800 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Método Intuitivo de Assimilação Diária</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Aprenda Inglês Americano com a Sequência Real do Livro
                </h1>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  Lições divididas em subseções de 5 frases, pronúncia fonética detalhada, observações escritas e faladas, flashcards interativos, preenchimento de lacunas com palavras do glossário e avaliação de voz em tempo real.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <PWAInstallButton variant="hero" />

                  <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Meta de 80% para desbloquear cada próxima lição</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Lembretes diários para consistência</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none"></div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar lição por título ou número..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm text-slate-800 transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Todas ({ASSIMIL_LESSONS.length})
                </button>

                <button
                  onClick={() => setFilterType('unlocked')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    filterType === 'unlocked'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Disponíveis
                </button>

                <button
                  onClick={() => setFilterType('passed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    filterType === 'passed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Concluídas (≥80%)
                </button>
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Lições do Livro Assimil Inglês Americano
                  </h2>
                  <p className="text-xs text-slate-500">
                    Siga a sequência progressiva. O aproveitamento mínimo de 80% desbloqueia a etapa seguinte.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onSelect={handleLessonSelect}
                  />
                ))}
              </div>

              {filteredLessons.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
                  <p className="text-sm font-bold text-slate-600">Nenhuma lição encontrada para o filtro.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Lesson Workspace with Tabs */
          <div className="space-y-6 pb-20 md:pb-6">
            {/* Tabs Bar */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setSelectedLesson(null)}
                title="Voltar para a lista de todas as 105 lições"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 transition whitespace-nowrap cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
                <span>Escolher Outra Lição</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-0.5 shrink-0" />

              <button
                onClick={() => setActiveTab('dialogue')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'dialogue'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Lição & Subseções</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Flashcards Interativos</span>
              </button>

              <button
                onClick={() => setActiveTab('blanks')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'blanks'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Preencher Lacunas</span>
              </button>

              <button
                onClick={() => setActiveTab('translation')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'translation'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Languages className="w-4 h-4 text-cyan-500" />
                <span>Traduzir (EN ⇄ PT)</span>
              </button>

              <button
                onClick={() => setActiveTab('speech')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'speech'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4 text-rose-500" />
                <span>Avaliação de Voz</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>Tutor IA do Capítulo</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'dialogue' && (
              <LessonViewer
                lesson={selectedLesson}
                onBack={() => setSelectedLesson(null)}
                onOpenFlashcards={() => setActiveTab('flashcards')}
                onOpenFillInBlanks={() => setActiveTab('blanks')}
                onOpenTranslation={() => setActiveTab('translation')}
                onOpenSpeechPractice={() => setActiveTab('speech')}
                onOpenAiChat={() => setActiveTab('chat')}
                onNextLesson={nextLessonObj ? handleGoToNextLesson : undefined}
                nextLessonUnlocked={isNextUnlocked}
              />
            )}

            {activeTab === 'flashcards' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('dialogue')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      &larr; Voltar para a Lição
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Escolher Outra Lição
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Flashcards: Lição {selectedLesson.number}
                  </span>
                </div>
                <FlashcardsView
                  lesson={selectedLesson}
                  onFinish={handleFinishFlashcards}
                  onBackToLessons={() => setSelectedLesson(null)}
                  onBackToLesson={() => setActiveTab('dialogue')}
                  onNextLesson={nextLessonObj ? handleGoToNextLesson : undefined}
                  nextLessonUnlocked={isNextUnlocked}
                />
              </div>
            )}

            {activeTab === 'blanks' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('dialogue')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      &larr; Voltar para a Lição
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Escolher Outra Lição
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Preenchimento de Lacunas: Lição {selectedLesson.number}
                  </span>
                </div>
                <FillInBlanksView
                  lesson={selectedLesson}
                  onFinish={handleFinishBlanks}
                  onBackToLessons={() => setSelectedLesson(null)}
                  onBackToLesson={() => setActiveTab('dialogue')}
                  onNextLesson={nextLessonObj ? handleGoToNextLesson : undefined}
                  nextLessonUnlocked={isNextUnlocked}
                />
              </div>
            )}

            {activeTab === 'translation' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('dialogue')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      &larr; Voltar para a Lição
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Escolher Outra Lição
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Tradução Vice-Versa: Lição {selectedLesson.number}
                  </span>
                </div>
                <TranslationView
                  lesson={selectedLesson}
                  onFinish={handleFinishTranslation}
                  onBackToLessons={() => setSelectedLesson(null)}
                  onBackToLesson={() => setActiveTab('dialogue')}
                  onNextLesson={nextLessonObj ? handleGoToNextLesson : undefined}
                  nextLessonUnlocked={isNextUnlocked}
                />
              </div>
            )}

            {activeTab === 'speech' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('dialogue')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      &larr; Voltar para a Lição
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Escolher Outra Lição
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Reconhecimento de Fala: Lição {selectedLesson.number}
                  </span>
                </div>
                <SpeechPracticeView
                  lesson={selectedLesson}
                  onFinish={handleFinishSpeech}
                  onBackToLessons={() => setSelectedLesson(null)}
                  onBackToLesson={() => setActiveTab('dialogue')}
                  onNextLesson={nextLessonObj ? handleGoToNextLesson : undefined}
                  nextLessonUnlocked={isNextUnlocked}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('dialogue')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      &larr; Voltar para a Lição
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Escolher Outra Lição
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Tutor IA: Lição {selectedLesson.number}
                  </span>
                </div>
                <AiTutorChat
                  lesson={selectedLesson}
                  onClose={() => setActiveTab('dialogue')}
                />
              </div>
            )}

            {/* Mobile Bottom Navigation Bar for Android (Sticky) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around md:hidden shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => setSelectedLesson(null)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
              >
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
                <span>Lições</span>
              </button>

              <button
                onClick={() => setActiveTab('dialogue')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  activeTab === 'dialogue'
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Headphones className="w-5 h-5" />
                <span>Diálogo</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  activeTab === 'flashcards'
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setActiveTab('blanks')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  activeTab === 'blanks'
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <span>Lacunas</span>
              </button>

              <button
                onClick={() => setActiveTab('translation')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  activeTab === 'translation'
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Languages className="w-5 h-5 text-cyan-500" />
                <span>Traduzir</span>
              </button>

              <button
                onClick={() => setActiveTab('speech')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  activeTab === 'speech'
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mic className="w-5 h-5 text-rose-500" />
                <span>Voz</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  activeTab === 'chat'
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span>Tutor IA</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>
          Assimil English • Baseado na metodologia de assimilação intuitiva de David Applefield e Fernando Nonohay.
        </p>
        <p className="mt-1 text-slate-400">
          Reconhecimento de fala, pronúncia fonética e tutor IA com Google Gemini.
        </p>
      </footer>

      {/* Modals */}
      {historyOpen && (
        <ProgressHistoryModal
          onClose={() => setHistoryOpen(false)}
          onSelectLesson={(lessonId) => {
            const l = ASSIMIL_LESSONS.find((x) => x.id === lessonId);
            if (l) handleLessonSelect(l);
          }}
        />
      )}

      {reminderOpen && (
        <NotificationSettingsModal onClose={() => setReminderOpen(false)} />
      )}

      {googleLoginOpen && (
        <GoogleAuthModal onClose={() => setGoogleLoginOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
