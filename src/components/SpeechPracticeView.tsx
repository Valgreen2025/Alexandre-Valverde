import React, { useState, useEffect, useRef } from 'react';
import { Lesson, SpeechExercise } from '../types/lesson';
import { speakText, evaluateSpeechAccuracy, SpeechEvaluationResult } from '../utils/speech';
import { useApp } from '../context/AppContext';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Bot,
  Loader2,
  Award,
  ShieldAlert,
  Info,
  Radio,
} from 'lucide-react';

interface SpeechPracticeViewProps {
  lesson: Lesson;
  onFinish: (score: number) => void;
  onBackToLessons?: () => void;
  onBackToLesson?: () => void;
  onNextLesson?: () => void;
  nextLessonUnlocked?: boolean;
}

export const SpeechPracticeView: React.FC<SpeechPracticeViewProps> = ({
  lesson,
  onFinish,
  onBackToLessons,
  onBackToLesson,
  onNextLesson,
  nextLessonUnlocked,
}) => {
  const { addXp, speechSlowMode } = useApp();
  const exercises = lesson.exercises.speech;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isRecordingMedia, setIsRecordingMedia] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<SpeechEvaluationResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [micTested, setMicTested] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    // Reset state when exercise changes
    setSpokenTranscript('');
    setEvaluation(null);
    setAiAnalysis(null);
    setRecognitionError(null);
    cleanupAudio();
  }, [currentIndex]);

  useEffect(() => {
    // Check permission state if API available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          if (status.state === 'denied') {
            setPermissionDenied(true);
          }
          status.onchange = () => {
            if (status.state === 'granted') {
              setPermissionDenied(false);
              setRecognitionError(null);
            } else if (status.state === 'denied') {
              setPermissionDenied(true);
            }
          };
        })
        .catch(() => {
          // Ignore if permission query not supported
        });
    }

    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setIsListening(false);
    setIsRecordingMedia(false);
    setAudioVolume(0);
  };

  // Explicitly prompt the user for microphone access
  const requestMicrophoneAccess = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecognitionError(
        'A API de áudio e microfone não está disponível neste navegador. Tente abrir em um navegador moderno como Google Chrome.'
      );
      return false;
    }

    try {
      setRecognitionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicTested(true);
      setPermissionDenied(false);

      // Start volume monitor
      setupVolumeMonitor(stream);

      return true;
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setRecognitionError(
          'O acesso ao microfone foi bloqueado pelo navegador. Veja as instruções abaixo para liberar.'
        );
      } else {
        setRecognitionError(`Não foi possível acessar o microfone: ${err.message || err.name}`);
      }
      return false;
    }
  };

  const setupVolumeMonitor = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('Volume meter error:', e);
    }
  };

  const startListening = async () => {
    setRecognitionError(null);
    setAiAnalysis(null);

    // 1. Explicitly ensure mic permission is granted by browser
    const permitted = await requestMicrophoneAccess();
    if (!permitted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: use MediaRecorder + Gemini
      startMediaRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);

        if (event.results[0].isFinal || event.results[event.results.length - 1].isFinal) {
          const evalRes = evaluateSpeechAccuracy(currentExercise.targetPhrase, transcript);
          setEvaluation(evalRes);
          if (evalRes.accuracy >= 80) {
            addXp(25);
          } else {
            addXp(10);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
          setRecognitionError(
            'Permissão negada. Clique no ícone de cadeado na barra de endereços para permitir o microfone.'
          );
        } else if (event.error === 'no-speech') {
          setRecognitionError('Nenhuma voz detectada. Fale mais perto do microfone e tente novamente.');
        } else {
          // Fall back to MediaRecorder
          startMediaRecording();
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition failed, falling back to MediaRecorder:', err);
      startMediaRecording();
    }
  };

  // Fallback: Direct MediaRecorder with Gemini transcription (Android & Mobile compatible)
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Detect best supported mimeType on Android / Mobile
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      const supportedMime = mimeTypes.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || '';
      const options = supportedMime ? { mimeType: supportedMime } : undefined;
      const mediaRecorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecordingMedia(false);
        const actualType = mediaRecorder.mimeType || supportedMime || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
        await sendAudioToGemini(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecordingMedia(true);
      setIsListening(true);
    } catch (err: any) {
      console.error('MediaRecorder start error:', err);
      setRecognitionError('Não foi possível gravar áudio: ' + err.message);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    cleanupAudio();
  };

  const sendAudioToGemini = async (audioBlob: Blob) => {
    setIsLoadingAi(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/gemini/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
            targetPhrase: currentExercise.targetPhrase,
          }),
        });

        const data = await res.json();
        if (data.transcript) {
          setSpokenTranscript(data.transcript);
          const evalRes = evaluateSpeechAccuracy(currentExercise.targetPhrase, data.transcript);
          if (data.accuracy && data.accuracy > evalRes.accuracy) {
            evalRes.accuracy = data.accuracy;
          }
          if (data.feedback) {
            evalRes.generalTip = data.feedback;
          }
          setEvaluation(evalRes);
          if (evalRes.accuracy >= 80) addXp(25);
          else addXp(10);
        }
      };
    } catch (err) {
      console.error('Gemini audio error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Quick simulation helper
  const handleSimulateSpeech = () => {
    const transcript = currentExercise.targetPhrase;
    setSpokenTranscript(transcript);
    const evalRes = evaluateSpeechAccuracy(currentExercise.targetPhrase, transcript);
    setEvaluation(evalRes);
    addXp(20);
  };

  const handlePlayReference = () => {
    speakText(currentExercise.targetPhrase, 'en-US', speechSlowMode ? 0.75 : 0.9);
  };

  const handleAskAiPhoneticAnalysis = async () => {
    if (!spokenTranscript) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/phonetic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhrase: currentExercise.targetPhrase,
          spokenText: spokenTranscript,
          phoneticGuide: currentExercise.phoneticGuide,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Failed to get AI analysis:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleNext = () => {
    const currentScore = evaluation?.accuracy || 0;
    const newScores = [...scores, currentScore];
    setScores(newScores);

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      onFinish(avg);
    }
  };

  if (scores.length === exercises.length) {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passed = avgScore >= 80;

    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-sm animate-in fade-in">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <Award className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900">Treino de Voz Concluído!</h3>
        <p className="text-sm text-slate-600 mt-2">
          {passed
            ? `Precisão média de fala de ${avgScore}%! Parabéns por atingir a meta mínima de 80%.`
            : `Precisão de ${avgScore}%. O método Assimil ensina que a repetição diária constrói a musculatura orofacial ideal. Tente novamente para alcançar 80%!`}
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
          <div>
            <span
              className={`text-3xl font-black ${passed ? 'text-emerald-600' : 'text-amber-600'}`}
            >
              {avgScore}%
            </span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Precisão Média</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-3xl font-black text-indigo-600">{exercises.length}</span>
            <p className="text-xs text-slate-500 font-semibold uppercase">Frases Praticadas</p>
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
              onClick={() => {
                setScores([]);
                setCurrentIndex(0);
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

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Exercise progress header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Treino de Voz {currentIndex + 1} de {exercises.length}
        </span>
        <span className="text-rose-600 font-bold flex items-center gap-1">
          <Mic className="w-3.5 h-3.5" /> Avaliação Fonética Imediata
        </span>
      </div>

      {/* Permission Troubleshooting Banner if blocked */}
      {permissionDenied && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Permissão do Microfone Bloqueada no Navegador</span>
          </div>
          <p className="leading-relaxed">
            O navegador está bloqueando o uso do microfone. Para liberar:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-rose-900 font-medium">
            <li>
              Olhe para a barra de endereços do navegador (ao lado de <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-200">https://...</span>) e clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Configurações do Site</strong>.
            </li>
            <li>
              Encontre o item <strong>Microfone</strong> e mude para <strong>Permitir (Allow)</strong>.
            </li>
            <li>
              Em seguida, clique no botão abaixo para reativar.
            </li>
          </ol>
          <button
            onClick={requestMicrophoneAccess}
            className="mt-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
          >
            Tentar Ativar Microfone Novamente
          </button>
        </div>
      )}

      {/* Target Phrase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Fale em voz alta em inglês:
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {currentExercise.targetPhrase}
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              "{currentExercise.translationPt}"
            </p>
          </div>

          <button
            onClick={handlePlayReference}
            title="Ouvir pronúncia de referência"
            className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Phonetic transcription guide */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-mono">
          <span className="font-bold font-sans uppercase tracking-wider text-[10px] block text-amber-800 mb-0.5">
            Transcrição Fonética Assimil:
          </span>
          [{currentExercise.phoneticGuide}]
        </div>

        {/* Phonetic advice tip */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs leading-relaxed">
          <span className="font-bold block mb-0.5 text-blue-800">Dica de pronúncia:</span>
          {currentExercise.tips}
        </div>

        {/* Microphone action section */}
        <div className="text-center py-4 space-y-3">
          <div className="relative inline-block">
            {isListening && (
              <span
                className="absolute -inset-3 rounded-full bg-rose-400/40 animate-ping"
                style={{
                  transform: `scale(${1 + (audioVolume / 100) * 0.8})`,
                }}
              ></span>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-22 h-22 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-300 scale-105'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-300 hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-9 h-9 animate-pulse" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Volume meter bar when active */}
          {isListening && (
            <div className="max-w-xs mx-auto space-y-1">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-75"
                  style={{ width: `${Math.max(5, audioVolume)}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Captando áudio do microfone ({audioVolume}%)
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-slate-800">
              {isListening
                ? 'Microfone Ativo! Fale a frase em inglês...'
                : 'Clique no botão acima para ativar o microfone'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isListening
                ? 'Toque novamente para finalizar e receber o feedback.'
                : 'Ao clicar, o navegador pedirá permissão para usar o microfone.'}
            </p>
          </div>

          {/* Fallback & Helper Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={requestMicrophoneAccess}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-600" />
              <span>Solicitar Permissão do Microfone</span>
            </button>

            <button
              onClick={handleSimulateSpeech}
              className="text-xs text-slate-500 hover:text-indigo-600 underline cursor-pointer"
            >
              Testar avaliação com simulação
            </button>
          </div>

          {recognitionError && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {recognitionError}
            </p>
          )}
        </div>

        {/* Loading Gemini audio evaluation */}
        {isLoadingAi && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center gap-2 text-indigo-700 text-xs font-bold animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processando áudio e avaliando fonemas com o Tutor IA...</span>
          </div>
        )}

        {/* Evaluation Output */}
        {evaluation && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in">
            {/* Accuracy Score Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                evaluation.accuracy >= 80
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : evaluation.accuracy >= 60
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    evaluation.accuracy >= 80
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {evaluation.accuracy}%
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {evaluation.accuracy >= 80
                      ? 'Pronúncia Excelente! (Meta 80% Atingida)'
                      : 'Boa tentativa! Pratique mais um pouco.'}
                  </h4>
                  <p className="text-xs opacity-80">{evaluation.generalTip}</p>
                </div>
              </div>
            </div>

            {/* What was heard */}
            {spokenTranscript && (
              <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-700">
                <span className="font-bold text-slate-800">Frase captada:</span> "{spokenTranscript}"
              </div>
            )}

            {/* Word by Word Phonetic Feedback */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Análise Palavra por Palavra:
              </span>
              <div className="flex flex-wrap gap-2">
                {evaluation.wordFeedback.map((wf, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                      wf.status === 'correct'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : wf.status === 'near'
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-rose-100 border-rose-300 text-rose-800'
                    }`}
                    title={wf.hint || (wf.status === 'correct' ? 'Perfeito!' : 'Ajustar fonema')}
                  >
                    <span>{wf.word}</span>
                    {wf.status === 'correct' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    {wf.status !== 'correct' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Verde = Reconhecido perfeitamente • Amarelo/Vermelho = Repetir articulação
              </p>
            </div>

            {/* AI Deep Phonetic Coach */}
            {!aiAnalysis ? (
              <button
                onClick={handleAskAiPhoneticAnalysis}
                disabled={isLoadingAi}
                className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando fonemas com o Tutor IA...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>Pedir Dicas Fonéticas Personalizadas ao Tutor IA</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                  <Bot className="w-4 h-4" />
                  <span>Dica do Tutor IA:</span>
                </div>
                <p>{aiAnalysis}</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={startListening}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tentar de Novo
          </button>

          <button
            onClick={handleNext}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer"
          >
            <span>{currentIndex < exercises.length - 1 ? 'Próxima Frase' : 'Concluir Treino'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
