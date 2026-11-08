import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Zap,
  Bell,
  User,
  History,
  LogOut,
  Sliders,
  Volume2,
  BookOpen,
  Mic,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenReminder: () => void;
  onOpenGoogleLogin: () => void;
  onBackToHome: () => void;
  isHome: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenReminder,
  onOpenGoogleLogin,
  onBackToHome,
  isHome,
}) => {
  const { user, logout, speechSlowMode, setSpeechSlowMode } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [micStatus, setMicStatus] = useState<'granted' | 'denied' | 'unsupported' | null>(null);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2.5 text-left group transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-600 to-red-600 p-0.5 shadow-md flex items-center justify-center text-white font-black text-xl">
              <span className="tracking-tighter">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg group-hover:text-indigo-600 transition">
                  Assimil
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                  American English
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Coleção sem Esforço • Método Intuitivo
              </p>
            </div>
          </button>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Audio speed mode */}
          <button
            onClick={() => setSpeechSlowMode(!speechSlowMode)}
            title={speechSlowMode ? 'Modo de Áudio Lento (0.8x) ativado' : 'Áudio Normal (1.0x)'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              speechSlowMode
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{speechSlowMode ? 'Áudio Lento (0.8x)' : 'Áudio Normal'}</span>
          </button>

          {/* Female American English Audio Badge */}
          <div
            title="Áudios em Inglês Americano com voz feminina nativa"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>Voz: EN-US Feminina</span>
          </div>

          {/* Daily Streak */}
          <div
            title="Sequência de dias estudando"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{user.streakDays}d</span>
          </div>

          {/* Total XP */}
          <div
            title="Pontos de experiência acumulados"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold"
          >
            <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <span>{user.totalXp} XP</span>
          </div>

          {/* Test / Enable Microphone button */}
          <button
            onClick={async () => {
              try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  const s = await navigator.mediaDevices.getUserMedia({ audio: true });
                  s.getTracks().forEach((t) => t.stop());
                  setMicStatus('granted');
                  setTimeout(() => setMicStatus(null), 3500);
                } else {
                  setMicStatus('unsupported');
                  setTimeout(() => setMicStatus(null), 3500);
                }
              } catch (e: any) {
                setMicStatus('denied');
                setTimeout(() => setMicStatus(null), 5000);
              }
            }}
            title="Ativar e testar microfone no navegador"
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              micStatus === 'granted'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : micStatus === 'denied'
                ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>
              {micStatus === 'granted'
                ? 'Microfone Liberado! ✓'
                : micStatus === 'denied'
                ? 'Bloqueado (veja instruções)'
                : 'Ativar Microfone'}
            </span>
          </button>

          {/* Install on Android PWA button */}
          <PWAInstallButton />

          {/* Reminder Bell */}
          <button
            onClick={onOpenReminder}
            title="Lembretes diários de estudo"
            className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {user.dailyReminderEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="Histórico detalhado de progresso"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-bold transition cursor-pointer"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Progresso</span>
          </button>

          {/* User Account / Profile */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition cursor-pointer"
            >
              <img
                src={user.photoUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-xs"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <p className="text-xs font-semibold text-slate-500">Conectado via Google</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenGoogleLogin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    Gerenciar Conta do Google
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenHistory();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition text-left cursor-pointer"
                  >
                    <History className="w-4 h-4 text-indigo-500" />
                    Histórico & Meta 80%
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenReminder();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition text-left cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-emerald-500" />
                    Lembretes Diários ({user.dailyReminderTime})
                  </button>

                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Trocar de Conta / Sair
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
