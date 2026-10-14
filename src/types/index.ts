/**
 * Core type definitions for KeyCraft typing tutor & speed test suite.
 */

export type FingerName =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export type HandName = 'left' | 'right' | 'both';

export interface KeyDefinition {
  code: string;
  primaryChar: string;
  shiftChar?: string;
  finger: FingerName;
  hand: HandName;
  width?: string; // Tailwind width class or flex flex-grow
  isSpecial?: boolean;
}

export type KeyMasteryStatus = 'unpracticed' | 'weak' | 'average' | 'strong';

export interface KeyStats {
  key: string;
  correctAttempts: number;
  incorrectAttempts: number;
  totalAttempts: number;
  errorRate: number; // 0 to 1
  avgResponseTimeMs: number;
  lastPracticedAt: number;
  masteryScore: number; // 0 to 100
  status: KeyMasteryStatus;
}

export type PracticeMode = 'strict' | 'relaxed';

export type EngineState =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error-recovery';

export type SoundProfile = 'mechanical' | 'clicky' | 'creamy' | 'typewriter';

export interface UserSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundProfile: SoundProfile;
  strictMode: boolean;
  allowBackspace: boolean;
  showFingerGuides: boolean;
  showHands: boolean;
  showTargetHighlight: boolean;
  keyboardHeatmapMetric: 'none' | 'mastery' | 'errorRate' | 'responseTime';
  defaultTestDuration: number; // in seconds
  soundOnMistake: boolean;
}

export type LessonCategory =
  | 'home-row'
  | 'top-row'
  | 'bottom-row'
  | 'shift-keys'
  | 'numbers'
  | 'symbols'
  | 'words'
  | 'sentences'
  | 'code'
  | 'weak-keys'
  | 'custom';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  difficulty: DifficultyLevel;
  description: string;
  targetSequence: string;
  focusKeys: string[];
  targetWpm?: number;
  targetAccuracy?: number;
}

export interface LessonProgress {
  lessonId: string;
  completedAt: number;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  mistakeCount: number;
  timeSpentSeconds: number;
  stars: number; // 1 to 3
}

export type SpeedTestMode = 'time' | 'words' | 'quote' | 'code' | 'custom';

export interface SpeedTestConfig {
  mode: SpeedTestMode;
  durationSeconds: number; // e.g. 15, 30, 60, 120
  wordCount?: number;
  includePunctuation: boolean;
  includeNumbers: boolean;
  allowBackspace: boolean;
  customText?: string;
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  mode: SpeedTestMode;
  durationSeconds: number;
  elapsedSeconds: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  cpm: number;
  totalCharactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  correctedMistakes: number;
  uncorrectedErrors: number;
  consistency: number; // percentage 0 - 100
  mistakesByKey: Record<string, number>;
}

export interface PracticeSessionSummary {
  mode: 'practice' | 'test';
  title: string;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  elapsedSeconds: number;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  weakestKeysInSession: string[];
}
