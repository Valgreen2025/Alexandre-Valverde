import React from 'react';
import { Smartphone, Download, CheckCircle2, X, Share2, Sparkles, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isAndroid: boolean;
  isIOS: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  isInstallable,
  isAndroid,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md flex items-center justify-center text-white">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                Android & Mobile PWA
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              Instalar Assimil no Android
            </h3>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-6 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Funciona como App Nativo:</strong> Abre direto na tela inicial sem barra de navegador.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Reconhecimento de Voz & Áudio:</strong> Microfone e síntese de voz feminina otimizados para Android.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Acesso Offline & Rápido:</strong> Conteúdo das lições e glossário carregam instantaneamente.
            </span>
          </div>
        </div>

        {/* Direct Install Button if supported */}
        {isInstallable ? (
          <button
            onClick={async () => {
              const res = await onTriggerInstall();
              if (res) onClose();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Agora no Android</span>
          </button>
        ) : isIOS ? (
          <div className="space-y-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
            <p className="font-bold flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-indigo-600" />
              Como instalar no iPhone / iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>Toque no botão <strong>Compartilhar</strong> no Safari.</li>
              <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <p className="font-bold text-amber-900">Como instalar no Chrome do Android:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
              <li>
                Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do Chrome.
              </li>
              <li>
                Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </li>
              <li>Confirme para ter o ícone do Assimil direto na sua gaveta de apps!</li>
            </ol>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PWA Oficial • Seguro e leve</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
