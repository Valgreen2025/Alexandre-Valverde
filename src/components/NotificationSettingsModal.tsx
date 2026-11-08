import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bell,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
} from 'lucide-react';

interface NotificationSettingsModalProps {
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  onClose,
}) => {
  const { user, toggleDailyReminder, triggerStudyReminderNotification } = useApp();
  const [enabled, setEnabled] = useState(user?.dailyReminderEnabled ?? true);
  const [time, setTime] = useState(user?.dailyReminderTime || '19:00');
  const [testSent, setTestSent] = useState(false);

  const handleSave = () => {
    toggleDailyReminder(enabled, time);
    onClose();
  };

  const handleTest = () => {
    triggerStudyReminderNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Lembretes & Consistência</h2>
              <p className="text-xs text-emerald-100">Método Assimil: regularidade diária</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">O segredo do Método Assimil:</span>
              <p className="text-amber-800/90 leading-relaxed">
                Estudar 15 a 30 minutos todos os dias gera resultados muito superiores a estudar horas apenas uma vez por semana.
              </p>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Ativar Lembretes Diários</h4>
              <p className="text-xs text-slate-500">Notificações no navegador e no app</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Time Picker */}
          {enabled && (
            <div className="space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Horário Preferido de Estudo
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-bold text-slate-800 transition"
                  />
                </div>
                <span className="text-xs text-slate-400 font-medium">Todos os dias</span>
              </div>
            </div>
          )}

          {/* Test Notification Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTest}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Testar Notificação Agora</span>
            </button>

            {testSent && (
              <p className="text-xs text-emerald-600 text-center font-bold mt-2 animate-in fade-in">
                ✓ Lembrete disparado com sucesso!
              </p>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
