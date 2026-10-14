import {
  KeyStats,
  LessonProgress,
  SpeedTestResult,
  UserSettings,
} from '../types';
import { calculateKeyMastery } from './metrics';

const SETTINGS_KEY = 'keycraft_settings_v1';
const KEY_STATS_KEY = 'keycraft_keystats_v1';
const SPEED_TESTS_KEY = 'keycraft_speedtests_v1';
const LESSON_PROGRESS_KEY = 'keycraft_lessons_v1';
const PRACTICE_STREAK_KEY = 'keycraft_streak_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  soundEnabled: true,
  soundVolume: 0.5,
  soundProfile: 'mechanical',
  strictMode: true,
  allowBackspace: true,
  showFingerGuides: true,
  showHands: true,
  showTargetHighlight: true,
  keyboardHeatmapMetric: 'mastery',
  defaultTestDuration: 60,
  soundOnMistake: true,
};

export interface PracticeStreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  totalPracticeDays: number;
  todayPracticeSeconds: number;
  totalPracticeSeconds: number;
}

export const DEFAULT_STREAK: PracticeStreakInfo = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: '',
  totalPracticeDays: 0,
  todayPracticeSeconds: 0,
  totalPracticeSeconds: 0,
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Failed reading storage key "${key}":`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed writing storage key "${key}":`, err);
  }
}

export const storage = {
  getSettings(): UserSettings {
    const stored = safeGet<Partial<UserSettings>>(SETTINGS_KEY, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  saveSettings(settings: UserSettings): void {
    safeSet(SETTINGS_KEY, settings);
  },

  getKeyStatsMap(): Record<string, KeyStats> {
    return safeGet<Record<string, KeyStats>>(KEY_STATS_KEY, {});
  },

  updateKeyStat(
    keyChar: string,
    isCorrect: boolean,
    responseTimeMs: number
  ): KeyStats {
    const map = this.getKeyStatsMap();
    const char = keyChar.toLowerCase();
    const existing: KeyStats = map[char] || {
      key: char,
      correctAttempts: 0,
      incorrectAttempts: 0,
      totalAttempts: 0,
      errorRate: 0,
      avgResponseTimeMs: 0,
      lastPracticedAt: 0,
      masteryScore: 0,
      status: 'unpracticed',
    };

    const newCorrect = existing.correctAttempts + (isCorrect ? 1 : 0);
    const newIncorrect = existing.incorrectAttempts + (isCorrect ? 0 : 1);
    const newTotal = newCorrect + newIncorrect;

    // Moving average for response time (if reasonable)
    let newAvgRt = existing.avgResponseTimeMs;
    if (responseTimeMs > 20 && responseTimeMs < 4000) {
      if (existing.avgResponseTimeMs === 0) {
        newAvgRt = responseTimeMs;
      } else {
        newAvgRt = Math.round(existing.avgResponseTimeMs * 0.8 + responseTimeMs * 0.2);
      }
    }

    const { masteryScore, status } = calculateKeyMastery(newCorrect, newIncorrect, newAvgRt);
    const errorRate = newTotal > 0 ? Math.round((newIncorrect / newTotal) * 1000) / 1000 : 0;

    const updated: KeyStats = {
      key: char,
      correctAttempts: newCorrect,
      incorrectAttempts: newIncorrect,
      totalAttempts: newTotal,
      errorRate,
      avgResponseTimeMs: newAvgRt,
      lastPracticedAt: Date.now(),
      masteryScore,
      status,
    };

    map[char] = updated;
    safeSet(KEY_STATS_KEY, map);
    return updated;
  },

  getSpeedTestResults(): SpeedTestResult[] {
    const results = safeGet<SpeedTestResult[]>(SPEED_TESTS_KEY, []);
    return Array.isArray(results) ? results : [];
  },

  saveSpeedTestResult(result: SpeedTestResult): void {
    const results = this.getSpeedTestResults();
    // Keep last 150 results
    const updated = [result, ...results].slice(0, 150);
    safeSet(SPEED_TESTS_KEY, updated);

    // Update streak and practice time
    this.recordPracticeTime(result.elapsedSeconds);
  },

  getLessonProgress(): Record<string, LessonProgress> {
    return safeGet<Record<string, LessonProgress>>(LESSON_PROGRESS_KEY, {});
  },

  saveLessonProgress(progress: LessonProgress): void {
    const map = this.getLessonProgress();
    const existing = map[progress.lessonId];
    // Keep best result or update if better
    if (!existing || progress.netWpm >= existing.netWpm) {
      map[progress.lessonId] = progress;
    }
    safeSet(LESSON_PROGRESS_KEY, map);

    // Update streak and practice time
    this.recordPracticeTime(progress.timeSpentSeconds);
  },

  getStreakInfo(): PracticeStreakInfo {
    const streak = safeGet<PracticeStreakInfo>(PRACTICE_STREAK_KEY, DEFAULT_STREAK);
    const today = new Date().toISOString().split('T')[0];

    // Check if streak was broken (missed yesterday)
    if (streak.lastPracticeDate && streak.lastPracticeDate !== today) {
      const last = new Date(streak.lastPracticeDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        streak.currentStreak = 0;
      }
      // Reset today's practice seconds if new day
      streak.todayPracticeSeconds = 0;
    }

    return streak;
  },

  recordPracticeTime(seconds: number): void {
    if (seconds <= 0) return;
    const streak = this.getStreakInfo();
    const today = new Date().toISOString().split('T')[0];

    if (streak.lastPracticeDate !== today) {
      streak.currentStreak += 1;
      streak.totalPracticeDays += 1;
      streak.todayPracticeSeconds = 0;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
      streak.lastPracticeDate = today;
    }

    streak.todayPracticeSeconds += Math.round(seconds);
    streak.totalPracticeSeconds += Math.round(seconds);
    safeSet(PRACTICE_STREAK_KEY, streak);
  },

  exportAllData(): string {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      keyStats: this.getKeyStatsMap(),
      speedTests: this.getSpeedTestResults(),
      lessonProgress: this.getLessonProgress(),
      streak: this.getStreakInfo(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (data.settings) safeSet(SETTINGS_KEY, data.settings);
      if (data.keyStats) safeSet(KEY_STATS_KEY, data.keyStats);
      if (data.speedTests) safeSet(SPEED_TESTS_KEY, data.speedTests);
      if (data.lessonProgress) safeSet(LESSON_PROGRESS_KEY, data.lessonProgress);
      if (data.streak) safeSet(PRACTICE_STREAK_KEY, data.streak);
      return true;
    } catch {
      return false;
    }
  },

  resetAllData(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(SETTINGS_KEY);
    window.localStorage.removeItem(KEY_STATS_KEY);
    window.localStorage.removeItem(SPEED_TESTS_KEY);
    window.localStorage.removeItem(LESSON_PROGRESS_KEY);
    window.localStorage.removeItem(PRACTICE_STREAK_KEY);
  },
};
