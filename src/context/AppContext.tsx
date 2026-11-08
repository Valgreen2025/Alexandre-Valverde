import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserProgressRecord } from '../types/lesson';
import confetti from 'canvas-confetti';

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProgress: (
    lessonId: number,
    score: number,
    details?: Partial<UserProgressRecord>
  ) => boolean;
  isLessonUnlocked: (lessonId: number) => boolean;
  toggleDailyReminder: (enabled: boolean, time?: string) => void;
  triggerStudyReminderNotification: () => void;
  addXp: (amount: number) => void;
  speechSlowMode: boolean;
  setSpeechSlowMode: (slow: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Defensive payload sanitizer to strictly satisfy firebase-blueprint.json & firestore.rules constraints
 */
function sanitizeUserProfile(profile: UserProfile): UserProfile {
  const safeId = String(profile.id || '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 128);
  const safeName = String(profile.name || 'Estudante Google').slice(0, 120);
  const safeEmail = String(profile.email || 'user@gmail.com').slice(0, 160);
  const safePhoto = String(
    profile.photoUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeEmail)}`
  ).slice(0, 500);
  const safeLastStudy = profile.lastStudyDate
    ? String(profile.lastStudyDate).slice(0, 20)
    : new Date().toISOString().split('T')[0];

  const cleanHistory: Record<number, UserProgressRecord> = {};
  if (profile.history && typeof profile.history === 'object') {
    for (const [k, v] of Object.entries(profile.history)) {
      if (!v) continue;
      const numKey = Number(k);
      const record: UserProgressRecord = {
        lessonId: Number(v.lessonId || numKey),
        score: Number(v.score || 0),
        passed: Boolean(v.passed),
        attempts: Number(v.attempts || 1),
        lastAttemptAt: String(v.lastAttemptAt || new Date().toISOString()),
        flashcardsCompleted: Boolean(v.flashcardsCompleted),
        subsectionsCompleted: Array.isArray(v.subsectionsCompleted)
          ? v.subsectionsCompleted.slice(0, 20)
          : [],
      };
      if (typeof v.speechAccuracyAvg === 'number') {
        record.speechAccuracyAvg = v.speechAccuracyAvg;
      }
      if (typeof v.exercisesScore === 'number') {
        record.exercisesScore = v.exercisesScore;
      }
      cleanHistory[numKey] = record;
    }
  }

  return {
    id: safeId,
    name: safeName,
    email: safeEmail,
    photoUrl: safePhoto,
    streakDays: Math.max(0, Number(profile.streakDays || 1)),
    lastStudyDate: safeLastStudy,
    totalXp: Math.max(0, Number(profile.totalXp || 0)),
    currentLessonId: Math.min(105, Math.max(1, Number(profile.currentLessonId || 1))),
    dailyReminderEnabled: Boolean(profile.dailyReminderEnabled),
    dailyReminderTime: String(profile.dailyReminderTime || '19:00').slice(0, 10),
    history: cleanHistory,
    achievements: Array.isArray(profile.achievements)
      ? profile.achievements.map((a) => String(a)).slice(0, 50)
      : ['login_google'],
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [speechSlowMode, setSpeechSlowMode] = useState<boolean>(false);

  const isAuthenticated = Boolean(user && auth.currentUser);

  const saveProfileToFirestore = async (profile: UserProfile) => {
    if (!auth.currentUser || auth.currentUser.uid !== profile.id) return;
    const sanitized = sanitizeUserProfile(profile);
    const userPath = `users/${sanitized.id}`;
    try {
      await setDoc(doc(db, 'users', sanitized.id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  };

  // Listen to real Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const uid = firebaseUser.uid;
      const email = firebaseUser.email || 'estudante@gmail.com';
      const displayName =
        firebaseUser.displayName || email.split('@')[0].replace(/[\._]/g, ' ');
      const photoUrl =
        firebaseUser.photoURL ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

      const userPath = `users/${uid}`;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const existingData = snap.data() as UserProfile;
          const merged = sanitizeUserProfile({
            ...existingData,
            id: uid,
            name: firebaseUser.displayName || existingData.name || displayName,
            email: firebaseUser.email || existingData.email || email,
            photoUrl: firebaseUser.photoURL || existingData.photoUrl || photoUrl,
          });
          setUser(merged);
          // Keep profile metadata up to date
          await setDoc(doc(db, 'users', uid), merged);
        } else {
          const initialProfile = sanitizeUserProfile({
            id: uid,
            name: displayName,
            email: email,
            photoUrl: photoUrl,
            streakDays: 1,
            lastStudyDate: new Date().toISOString().split('T')[0],
            totalXp: 0,
            currentLessonId: 1,
            dailyReminderEnabled: true,
            dailyReminderTime: '19:00',
            history: {},
            achievements: ['login_google'],
          });
          await setDoc(doc(db, 'users', uid), initialProfile);
          setUser(initialProfile);
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, userPath);
        } catch {
          // Fallback in-memory profile if Firestore error occurs while authenticated
          setUser(
            sanitizeUserProfile({
              id: uid,
              name: displayName,
              email,
              photoUrl,
              streakDays: 1,
              lastStudyDate: new Date().toISOString().split('T')[0],
              totalXp: 0,
              currentLessonId: 1,
              dailyReminderEnabled: true,
              dailyReminderTime: '19:00',
              history: {},
              achievements: ['login_google'],
            })
          );
        }
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return Boolean(result.user);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError(
          'A janela de login do Google foi fechada antes de concluir. Você precisa entrar com sua conta Google para acessar o aplicativo.'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthError(
          'O navegador bloqueou a janela pop-up de login do Google. Permita pop-ups para este site e tente novamente.'
        );
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Ignore duplicate click
      } else {
        setAuthError(
          'Não foi possível autenticar com o Google. Verifique se você possui uma Conta Google ativa e tente novamente.'
        );
      }
      return false;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // Rule: Only unlocked if lesson 1 OR previous lesson was passed with >= 80%
  const isLessonUnlocked = (lessonId: number): boolean => {
    if (lessonId === 1) return true;
    if (!user || !user.history) return false;
    const prevLessonId = lessonId - 1;
    const prevRecord = user.history[prevLessonId];
    return !!(prevRecord && prevRecord.passed && prevRecord.score >= 80);
  };

  // Update progress for a lesson
  const updateUserProgress = (
    lessonId: number,
    score: number,
    details?: Partial<UserProgressRecord>
  ): boolean => {
    if (!user) return false;
    const passed = score >= 80;
    const prevRecord = user.history[lessonId];
    const attempts = (prevRecord?.attempts || 0) + 1;
    const bestScore = Math.max(score, prevRecord?.score || 0);

    const newRecord: UserProgressRecord = {
      lessonId,
      score: bestScore,
      passed: bestScore >= 80,
      attempts,
      lastAttemptAt: new Date().toISOString(),
      flashcardsCompleted:
        details?.flashcardsCompleted ?? (prevRecord?.flashcardsCompleted || false),
      subsectionsCompleted: Array.from(
        new Set([
          ...(prevRecord?.subsectionsCompleted || []),
          ...(details?.subsectionsCompleted || []),
        ])
      ),
      speechAccuracyAvg: details?.speechAccuracyAvg ?? prevRecord?.speechAccuracyAvg,
      exercisesScore: details?.exercisesScore ?? prevRecord?.exercisesScore,
    };

    const xpEarned = passed ? 100 : Math.round(score * 0.8);
    let newStreak = user.streakDays;
    const today = new Date().toISOString().split('T')[0];
    if (user.lastStudyDate !== today) {
      newStreak += 1;
    }

    const nextLessonId = passed
      ? Math.min(105, Math.max(user.currentLessonId, lessonId + 1))
      : user.currentLessonId;

    const updatedUser = sanitizeUserProfile({
      ...user,
      currentLessonId: nextLessonId,
      totalXp: user.totalXp + xpEarned,
      streakDays: newStreak,
      lastStudyDate: today,
      history: {
        ...user.history,
        [lessonId]: newRecord,
      },
    });

    if (passed && (!prevRecord || !prevRecord.passed)) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
    }

    setUser(updatedUser);
    saveProfileToFirestore(updatedUser);

    return passed;
  };

  const addXp = (amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = sanitizeUserProfile({ ...prev, totalXp: prev.totalXp + amount });
      saveProfileToFirestore(updated);
      return updated;
    });
  };

  const toggleDailyReminder = (enabled: boolean, time: string = '19:00') => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = sanitizeUserProfile({
        ...prev,
        dailyReminderEnabled: enabled,
        dailyReminderTime: time,
      });
      saveProfileToFirestore(updated);
      return updated;
    });

    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const triggerStudyReminderNotification = () => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Assimil Inglês Americano — Hora da Lição Diária! 🇺🇸', {
        body: 'Pratique 15 minutos hoje para manter sua sequência de estudos ativa!',
        icon: '/pwa-192x192.png',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('Assimil Inglês Americano — Hora da Lição Diária! 🇺🇸', {
            body: 'Pratique 15 minutos hoje para manter sua sequência de estudos ativa!',
            icon: '/pwa-192x192.png',
          });
        }
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        authLoading,
        authError,
        loginWithGoogle,
        logout,
        updateUserProgress,
        isLessonUnlocked,
        toggleDailyReminder,
        triggerStudyReminderNotification,
        addXp,
        speechSlowMode,
        setSpeechSlowMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
