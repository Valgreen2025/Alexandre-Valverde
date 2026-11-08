/**
 * Web Speech Audio & Pronunciation Evaluation Engine
 */

export interface SpeechEvaluationResult {
  accuracy: number; // 0 to 100
  spokenText: string;
  targetText: string;
  wordFeedback: Array<{
    word: string;
    status: 'correct' | 'near' | 'incorrect' | 'missing';
    hint?: string;
  }>;
  generalTip: string;
}

// Cache voices to handle asynchronous loading in Web Speech API
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Finds the highest quality American English (en-US) female voice available.
 */
export function getAmericanFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  // Well-known female voice names in browsers (Windows, macOS, iOS, Android, ChromeOS)
  const femaleKeywords = [
    'samantha', 'zira', 'victoria', 'karen', 'allison', 'ava', 'susan',
    'serena', 'fiona', 'jenny', 'aria', 'michelle', 'lisa', 'sarah',
    'olivia', 'emma', 'ana', 'catherine', 'hazel', 'veena', 'tessa',
    'google us english', 'female', 'woman', 'natural (female)', 'sfg#female',
    'iom#female', 'tpd#female', 'en-us-x-sfg', 'network female'
  ];

  // Common male voice names to strictly reject
  const maleKeywords = [
    'david', 'daniel', 'george', 'mark', 'richard', 'alex', 'fred',
    'bruce', 'tom', 'diego', 'jorge', 'felipe', 'antonio', 'antônio',
    'junior', 'guy', 'christopher', 'eric', 'male', 'man', 'boy', 'paul',
    'james', 'john', 'mike', 'michael', 'steve', 'steven', 'roger', 'oliver',
    'charles', 'bernard', 'jack', 'bill'
  ];

  const isUsEnglish = (v: SpeechSynthesisVoice) => {
    const l = v.lang.toLowerCase().replace('_', '-');
    return l === 'en-us' || (l.startsWith('en') && v.name.toLowerCase().includes('united states'));
  };

  const isAnyEnglish = (v: SpeechSynthesisVoice) => {
    return v.lang.toLowerCase().startsWith('en');
  };

  // Tier 1: en-US with explicit female keyword and no male keyword
  const tier1 = voices.find((v) => {
    const name = v.name.toLowerCase();
    return isUsEnglish(v) &&
      femaleKeywords.some((k) => name.includes(k)) &&
      !maleKeywords.some((m) => name.includes(m));
  });
  if (tier1) return tier1;

  // Tier 2: en-US without male keyword
  const tier2 = voices.find((v) => {
    const name = v.name.toLowerCase();
    return isUsEnglish(v) && !maleKeywords.some((m) => name.includes(m));
  });
  if (tier2) return tier2;

  // Tier 3: any English voice with female keyword
  const tier3 = voices.find((v) => {
    const name = v.name.toLowerCase();
    return isAnyEnglish(v) &&
      femaleKeywords.some((k) => name.includes(k)) &&
      !maleKeywords.some((m) => name.includes(m));
  });
  if (tier3) return tier3;

  // Tier 4: any en-US voice
  const tier4 = voices.find((v) => isUsEnglish(v));
  if (tier4) return tier4;

  // Tier 5: any English voice not male
  const tier5 = voices.find((v) => isAnyEnglish(v) && !maleKeywords.some((m) => v.name.toLowerCase().includes(m)));
  if (tier5) return tier5;

  return voices[0] || null;
}

/**
 * Clean text for smooth natural speech synthesis (remove Markdown and phonetic brackets)
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove phonetic brackets like [fárst léssãn]
    .replace(/\[[^\]]+\]/g, ' ')
    // Remove markdown bold / italic / headings
    .replace(/[*_#`~]/g, '')
    // Remove leading numbering like "1 - " or "1. "
    .replace(/^\s*\d+\s*[-–.]\s*/gm, '')
    // Replace multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Play speech using Web Speech Synthesis API strictly with American English Female Voice
export function speakText(
  text: string,
  lang: string = 'en-US',
  rate: number = 0.9,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported on this browser.');
    return false;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      if (onEnd) onEnd();
      return true;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    // Enforce American English as the standard voice language
    utterance.lang = 'en-US';
    utterance.rate = rate; // clear pacing for learners
    // Natural female acoustic pitch range (1.14 - 1.18 delivers a crisp, melodious female voice even on neutral fallbacks)
    utterance.pitch = 1.16;

    const femaleVoice = getAmericanFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Error during speakText:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Levenshtein distance for fuzzy string comparison
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function cleanWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/g, '').trim();
}

/**
 * Phonetic & Lexical Speech Evaluation
 */
export function evaluateSpeechAccuracy(
  targetText: string,
  spokenText: string
): SpeechEvaluationResult {
  const targetWords = targetText.split(/\s+/).filter(Boolean);
  const spokenWords = spokenText.split(/\s+/).filter(Boolean).map(cleanWord);

  const wordFeedback: SpeechEvaluationResult['wordFeedback'] = [];
  let matchedScore = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const rawTarget = targetWords[i];
    const cleanedTarget = cleanWord(rawTarget);

    // Look for best match within window
    let bestMatchIdx = -1;
    let minDistance = 999;

    for (let j = 0; j < spokenWords.length; j++) {
      const dist = levenshteinDistance(cleanedTarget, spokenWords[j]);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatchIdx = j;
      }
    }

    if (minDistance === 0) {
      wordFeedback.push({
        word: rawTarget,
        status: 'correct',
      });
      matchedScore += 1;
    } else if (minDistance <= Math.max(1, Math.floor(cleanedTarget.length * 0.35))) {
      wordFeedback.push({
        word: rawTarget,
        status: 'near',
        hint: `Quase lá! Pronúncia captada: "${spokenWords[bestMatchIdx] || ''}"`,
      });
      matchedScore += 0.7;
    } else {
      wordFeedback.push({
        word: rawTarget,
        status: 'incorrect',
        hint: `Atenção aos fonemas: tente articular mais claramente "${rawTarget}"`,
      });
      matchedScore += 0;
    }
  }

  const accuracy = Math.min(100, Math.round((matchedScore / Math.max(1, targetWords.length)) * 100));

  let generalTip = '';
  if (accuracy >= 85) {
    generalTip = 'Excelente pronúncia! Seu ritmo e fonemas foram reconhecidos com grande clareza.';
  } else if (accuracy >= 65) {
    generalTip = 'Bom trabalho! Quase perfeito. Ouça o áudio da frase novamente e preste atenção nas palavras destacadas em amarelo/vermelho.';
  } else {
    generalTip = 'Tente novamente falando um pouco mais pausadamente perto do microfone. Preste atenção no guia de pronúncia fonética da lição!';
  }

  return {
    accuracy,
    spokenText,
    targetText,
    wordFeedback,
    generalTip,
  };
}
