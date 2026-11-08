import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Mic,
  Award,
  Loader2,
} from 'lucide-react';

export const GoogleLoginGate: React.FC = () => {
  const { loginWithGoogle, authLoading, authError } = useApp();
  const [isOpeningPopup, setIsOpeningPopup] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsOpeningPopup(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsOpeningPopup(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-200">
          Verificando autenticação com o Google...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-red-600 p-0.5 shadow-md flex items-center justify-center text-white font-black text-xl">
            <span>A</span>
          </div>
          <div>
            <span className="font-black text-lg text-white tracking-tight">Assimil</span>
            <span className="text-[11px] font-bold uppercase tracking-wider ml-2 px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30">
              American English
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Autenticação Google Obrigatória</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-slate-800">
          {/* Google Icon & Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-3.5 shadow-md border border-slate-200 mb-1">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Entrar com o Google
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Autentique-se na janela oficial do Google para iniciar o aplicativo e sincronizar seu progresso nas 105 lições.
            </p>
          </div>

          {/* Mandatory Requirement Warning Alert */}
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Acesso Exclusivo com Conta Google</span>
            </div>
            <p className="leading-relaxed text-rose-900/90">
              <strong>Caso você não tenha uma conta Google, não poderá iniciar o aplicativo.</strong> Seu nome, foto e e-mail são validados diretamente pela tela oficial de login do Google.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Official Google OAuth Popup Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isOpeningPopup}
            className="w-full py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
          >
            {isOpeningPopup ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Abrindo janela oficial do Google...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span>Fazer Login com a Conta do Google</span>
              </>
            )}
          </button>

          {/* Create Google Account Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Não possui uma Conta Google? Crie uma gratuitamente para poder acessar:
            </p>
            <a
              href="https://accounts.google.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              <span>Criar Conta Google Oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>OAuth 2.0 Oficial Google • Firebase Authentication</span>
          </div>
        </div>
      </div>

      {/* Feature Pills Footer */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pb-2">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>105 Lições sequenciais do Livro Assimil</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <Mic className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Avaliação fonética de voz em tempo real</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Desbloqueio progressivo com meta de 80%</span>
        </div>
      </div>
    </div>
  );
};
