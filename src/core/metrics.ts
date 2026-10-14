/**
 * Pure calculation functions for typing speed, accuracy, and consistency.
 * Strictly guarded against divide-by-zero, negative numbers, NaN, and Infinity.
 */

/**
 * Gross Words Per Minute (Gross WPM)
 * Standard formula: (Total Characters Typed / 5) / Elapsed Minutes
 */
export function calculateGrossWpm(totalCharsTyped: number, elapsedSeconds: number): number {
  if (totalCharsTyped <= 0 || elapsedSeconds <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const rawWpm = (totalCharsTyped / 5) / elapsedMinutes;
  return isFinite(rawWpm) && rawWpm > 0 ? Math.round(rawWpm) : 0;
}

/**
 * Net Words Per Minute (Net WPM)
 * Standard formula: max(0, Gross WPM - (Uncorrected Errors / Elapsed Minutes))
 */
export function calculateNetWpm(
  totalCharsTyped: number,
  uncorrectedErrors: number,
  elapsedSeconds: number
): number {
  if (totalCharsTyped <= 0 || elapsedSeconds <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const gross = (totalCharsTyped / 5) / elapsedMinutes;
  const errorPenalty = Math.max(0, uncorrectedErrors) / elapsedMinutes;
  const net = gross - errorPenalty;
  return isFinite(net) && net > 0 ? Math.round(net) : 0;
}

/**
 * Guided Practice Accuracy
 * Formula: (Correct Key Attempts / Total Key Attempts) * 100
 */
export function calculateGuidedAccuracy(correctAttempts: number, totalAttempts: number): number {
  if (totalAttempts <= 0 || correctAttempts <= 0) return 100; // Zero mistakes made so far
  const ratio = (correctAttempts / totalAttempts) * 100;
  if (!isFinite(ratio)) return 0;
  return Math.min(100, Math.max(0, Math.round(ratio * 10) / 10));
}

/**
 * Passage-Based Speed Test Accuracy
 * Formula: (Correctly Matched Characters / Total Evaluated Characters) * 100
 */
export function calculatePassageAccuracy(
  correctChars: number,
  totalEvaluatedChars: number
): number {
  if (totalEvaluatedChars <= 0) return 100;
  if (correctChars <= 0) return 0;
  const ratio = (correctChars / totalEvaluatedChars) * 100;
  if (!isFinite(ratio)) return 0;
  return Math.min(100, Math.max(0, Math.round(ratio * 10) / 10));
}

/**
 * Characters Per Minute (CPM)
 */
export function calculateCpm(totalCharsTyped: number, elapsedSeconds: number): number {
  if (totalCharsTyped <= 0 || elapsedSeconds <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const cpm = totalCharsTyped / elapsedMinutes;
  return isFinite(cpm) && cpm > 0 ? Math.round(cpm) : 0;
}

/**
 * Consistency Score (0 - 100%)
 * Measures steady typing rhythm. Calculated from variance in inter-keystroke intervals (in milliseconds).
 */
export function calculateConsistency(intervalsMs: number[]): number {
  if (!intervalsMs || intervalsMs.length < 3) return 100; // Not enough intervals to measure variance

  // Filter out any extreme pauses (e.g. user taking a sip of water > 3s)
  const validIntervals = intervalsMs.filter((t) => t > 30 && t < 3000);
  if (validIntervals.length < 3) return 100;

  const mean = validIntervals.reduce((sum, v) => sum + v, 0) / validIntervals.length;
  if (mean <= 0) return 100;

  const variance =
    validIntervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    validIntervals.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation = stdDev / mean
  const cv = stdDev / mean;
  // CV of 0 is 100% consistent; CV >= 1.0 is very erratic (~0%)
  const rawConsistency = Math.max(0, Math.min(100, (1 - cv * 0.75) * 100));
  return Math.round(rawConsistency);
}

/**
 * Calculate per-key mastery score (0 to 100)
 * Weighted by error rate (60%), response latency vs baseline (30%), and volume (10%).
 */
export function calculateKeyMastery(
  correctAttempts: number,
  incorrectAttempts: number,
  avgResponseTimeMs: number
): { masteryScore: number; status: 'unpracticed' | 'weak' | 'average' | 'strong' } {
  const total = correctAttempts + incorrectAttempts;
  if (total < 5) {
    return { masteryScore: 0, status: 'unpracticed' };
  }

  const accuracy = correctAttempts / total; // 0 to 1
  const accuracyPoints = accuracy * 60; // Up to 60 points

  // Response time score: Ideal is 150-250ms. >= 800ms is slow.
  let speedPoints = 30;
  if (avgResponseTimeMs > 200) {
    const penalty = ((avgResponseTimeMs - 200) / 600) * 30;
    speedPoints = Math.max(0, 30 - penalty);
  }

  // Experience bonus up to 10 points for 20+ reps
  const volumePoints = Math.min(10, (total / 20) * 10);

  const score = Math.round(accuracyPoints + speedPoints + volumePoints);
  const clampedScore = Math.max(0, Math.min(100, score));

  let status: 'unpracticed' | 'weak' | 'average' | 'strong' = 'average';
  if (clampedScore >= 80 && accuracy >= 0.92) {
    status = 'strong';
  } else if (clampedScore < 60 || accuracy < 0.85) {
    status = 'weak';
  }

  return { masteryScore: clampedScore, status };
}
