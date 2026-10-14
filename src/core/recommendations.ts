import { KeyStats, Lesson } from '../types';

/**
 * Recommendation and adaptive practice drill generator.
 */

export interface KeyInsight {
  key: string;
  errorRatePercent: number;
  totalAttempts: number;
  avgResponseTimeMs: number;
  masteryScore: number;
  status: 'weak' | 'average' | 'strong' | 'unpracticed';
}

export function getRankedKeyInsights(statsMap: Record<string, KeyStats>): {
  weakKeys: KeyInsight[];
  strongKeys: KeyInsight[];
  unpracticedKeys: string[];
} {
  const allAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const weakKeys: KeyInsight[] = [];
  const strongKeys: KeyInsight[] = [];
  const unpracticedKeys: string[] = [];

  for (const char of allAlphabet) {
    const stat = statsMap[char];
    if (!stat || stat.totalAttempts < 5) {
      unpracticedKeys.push(char);
      continue;
    }

    const insight: KeyInsight = {
      key: char,
      errorRatePercent: Math.round(stat.errorRate * 100),
      totalAttempts: stat.totalAttempts,
      avgResponseTimeMs: stat.avgResponseTimeMs,
      masteryScore: stat.masteryScore,
      status: stat.status,
    };

    if (stat.status === 'weak' || stat.errorRate >= 0.12) {
      weakKeys.push(insight);
    } else if (stat.status === 'strong') {
      strongKeys.push(insight);
    }
  }

  // Sort weak keys by highest error rate first, then lowest mastery
  weakKeys.sort((a, b) => b.errorRatePercent - a.errorRatePercent || a.masteryScore - b.masteryScore);
  // Sort strong keys by highest mastery first
  strongKeys.sort((a, b) => b.masteryScore - a.masteryScore);

  return { weakKeys, strongKeys, unpracticedKeys };
}

/**
 * Dictionary of word stems and words for each English letter
 */
const LETTER_WORD_MAP: Record<string, string[]> = {
  a: ['all', 'and', 'are', 'ask', 'act', 'away', 'able', 'area', 'auto'],
  b: ['be', 'but', 'by', 'back', 'been', 'best', 'both', 'build', 'blue'],
  c: ['can', 'call', 'come', 'could', 'case', 'city', 'care', 'code', 'cool'],
  d: ['do', 'day', 'down', 'did', 'done', 'deep', 'data', 'dark', 'door'],
  e: ['each', 'even', 'eye', 'end', 'ever', 'easy', 'edge', 'echo', 'else'],
  f: ['for', 'from', 'first', 'find', 'few', 'fast', 'free', 'fact', 'four'],
  g: ['get', 'go', 'good', 'give', 'great', 'game', 'grow', 'glow', 'gold'],
  h: ['have', 'he', 'his', 'how', 'here', 'high', 'home', 'hold', 'help'],
  i: ['in', 'is', 'it', 'into', 'its', 'item', 'idea', 'icon', 'iron'],
  j: ['just', 'jump', 'join', 'job', 'joy', 'judge', 'juice', 'jazz'],
  k: ['know', 'keep', 'kind', 'key', 'king', 'keen', 'knee', 'knot'],
  l: ['like', 'look', 'long', 'last', 'life', 'line', 'live', 'learn', 'left'],
  m: ['make', 'more', 'man', 'may', 'most', 'move', 'mind', 'much', 'mean'],
  n: ['new', 'no', 'not', 'now', 'name', 'next', 'need', 'near', 'note'],
  o: ['of', 'on', 'one', 'out', 'other', 'only', 'over', 'open', 'once'],
  p: ['part', 'people', 'place', 'point', 'put', 'page', 'play', 'pure', 'plan'],
  q: ['quick', 'quite', 'quote', 'queen', 'quiet', 'quiz', 'query', 'quest'],
  r: ['right', 'run', 'read', 'real', 'room', 'rest', 'road', 'rule', 'ring'],
  s: ['so', 'see', 'some', 'say', 'same', 'such', 'set', 'show', 'side'],
  t: ['to', 'the', 'that', 'this', 'time', 'two', 'take', 'than', 'tell'],
  u: ['up', 'use', 'under', 'upon', 'until', 'unit', 'user', 'urge'],
  v: ['very', 'view', 'value', 'voice', 'vast', 'vivid', 'vote', 'visit'],
  w: ['we', 'with', 'what', 'which', 'will', 'way', 'word', 'work', 'well'],
  x: ['box', 'fox', 'six', 'next', 'exam', 'axis', 'pixel', 'exact', 'extra'],
  y: ['you', 'year', 'your', 'yes', 'yet', 'yield', 'young', 'yellow'],
  z: ['zone', 'zero', 'zoom', 'size', 'maze', 'lazy', 'prize', 'blaze'],
};

/**
 * Dynamically synthesizes a targeted practice drill focusing on the user's weak keys.
 */
export function generateWeakKeyLesson(targetWeakKeys: string[]): Lesson {
  if (targetWeakKeys.length === 0) {
    // If no weak keys, offer a high-frequency speed builder
    return {
      id: 'dynamic-weak-keys',
      title: 'Adaptive Speed & Rhythm Drill',
      category: 'weak-keys',
      difficulty: 'intermediate',
      description: 'Dynamic drill combining alternating hands and common English n-grams.',
      focusKeys: ['e', 't', 'a', 'o', 'i', 'n', 's'],
      targetSequence: 'the and that have for not with you this but his from they say one would what so up out',
    };
  }

  const keys = targetWeakKeys.slice(0, 3).map((k) => k.toLowerCase());
  const wordsSet: string[] = [];

  // 1. Isolated anchor reps: e.g. for 'r': "frf jrf rfr"
  const isolatedDrills: string[] = [];
  for (const k of keys) {
    isolatedDrills.push(`f${k}f j${k}j ${k}${k} ${k}e${k} a${k}a`);
  }

  // 2. Focused words containing the weak keys
  for (const k of keys) {
    const list = LETTER_WORD_MAP[k] || [];
    wordsSet.push(...list.slice(0, 4));
  }

  // 3. Mixed pairs if 2 or more keys
  if (keys.length >= 2) {
    const [k1, k2] = keys;
    isolatedDrills.push(`${k1}${k2} ${k2}${k1} ${k1}e${k2} ${k2}a${k1}`);
  }

  // Assemble full exercise
  const sequence = `${isolatedDrills.join(' ')} ${wordsSet.join(' ')}`;

  return {
    id: `adaptive-weak-${keys.join('-')}`,
    title: `Remediation Drill: Focus on [${keys.map((k) => k.toUpperCase()).join(', ')}]`,
    category: 'weak-keys',
    difficulty: 'intermediate',
    description: `Targeted motor-memory retraining to eliminate typos on ${keys.map((k) => k.toUpperCase()).join(', ')}.`,
    focusKeys: keys,
    targetSequence: sequence,
    targetAccuracy: 95,
  };
}
