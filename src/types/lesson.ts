export interface DialogueLine {
  number: number;
  speaker: string;
  en: string;
  pt: string;
  phonetic: string;
  notesRef?: number[];
}

export interface LessonSubsection {
  id: number;
  title: string;
  description: string;
  dialogue: DialogueLine[];
  phoneticExcerpt?: string;
}

export interface LessonNoteExample {
  en: string;
  pt: string;
  phonetic?: string;
}

export interface LessonNote {
  id: number;
  title: string;
  content: string;
  audioText: string;
  examples?: LessonNoteExample[];
}

export interface GlossaryItem {
  word: string;
  translation: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleEn?: string;
  examplePt?: string;
}

export interface FillInTheBlankExercise {
  id: number;
  questionPt: string;
  sentenceWithBlank: string; // e.g. "What's [blank] name?"
  correctWords: string[]; // words that go in the blanks
  blankOptions: string[]; // word bank including distractors from lesson glossary
  hint?: string;
  explanation?: string;
}

export interface TranslateExercise {
  id: number;
  promptEn: string;
  promptPt: string;
  direction: 'en_to_pt' | 'pt_to_en';
  options: string[];
  correctAnswer: string;
}

export interface SpeechExercise {
  id: number;
  targetPhrase: string;
  translationPt: string;
  phoneticGuide: string;
  tips: string;
}

export interface Lesson {
  id: number;
  number: number;
  titleEn: string;
  titlePt: string;
  phoneticTitle: string;
  isRevision?: boolean;
  theme: string;
  introSummary: string;
  subsections: LessonSubsection[];
  phoneticFull: string;
  notes: LessonNote[];
  glossary: GlossaryItem[];
  exercises: {
    fillInTheBlank: FillInTheBlankExercise[];
    translate: TranslateExercise[];
    speech: SpeechExercise[];
  };
}

export interface UserProgressRecord {
  lessonId: number;
  score: number; // 0 to 100
  passed: boolean; // score >= 80
  attempts: number;
  lastAttemptAt: string;
  flashcardsCompleted: boolean;
  subsectionsCompleted: number[];
  speechAccuracyAvg?: number;
  exercisesScore?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  streakDays: number;
  lastStudyDate: string | null;
  totalXp: number;
  currentLessonId: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "19:00"
  history: Record<number, UserProgressRecord>;
  achievements: string[];
}
