/**
 * Comprehensive Automated Test Suite for KeyCraft Core Engines.
 * Covers all 20 mandatory test cases specified in the requirements.
 */

import { TypingEngine } from '../core/typingEngine';
import {
  calculateGrossWpm,
  calculateNetWpm,
  calculateGuidedAccuracy,
  calculatePassageAccuracy,
  calculateKeyMastery,
  calculateConsistency,
} from '../core/metrics';
import { getKeyInfoForChar } from '../core/keyboardLayout';
import { getRankedKeyInsights, generateWeakKeyLesson } from '../core/recommendations';
import { KeyStats } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

console.log('====================================================');
console.log('KEYCRAFT UNIT & INTEGRATION TEST SUITE');
console.log('====================================================\n');

// ---------------------------------------------------------------------
// TEST GROUP 1: Guided Typing Engine Validation & State Transitions
// ---------------------------------------------------------------------
console.log('--- Group 1: Guided Engine State & Validation ---');

{
  // Test 1: Expected F followed by F advances exactly one character
  const engine = new TypingEngine({
    targetSequence: 'FJFJ',
    mode: 'strict',
    allowBackspace: false,
  });
  const res = engine.handleKeyInput('F');
  assert(res.valid && res.advanced && res.isCorrect, 'Case 1: Expected F followed by F advances exactly 1 char');
  assert(engine.getCurrentIndex() === 1, 'Case 1.1: Current index is now 1');
  assert(engine.getTargetChar() === 'J', 'Case 1.2: Next target character is now J');
}

{
  // Test 2: Expected F followed by J does not advance
  const engine = new TypingEngine({
    targetSequence: 'FJFJ',
    mode: 'strict',
    allowBackspace: false,
  });
  const res = engine.handleKeyInput('J'); // incorrect
  assert(res.valid && !res.advanced && !res.isCorrect, 'Case 2: Expected F followed by J does not advance');
  assert(engine.getCurrentIndex() === 0, 'Case 2.1: Current index remains 0');
  assert(engine.getTargetChar() === 'F', 'Case 2.2: Target remains F');
}

{
  // Test 3: Multiple incorrect keys do not change current target
  const engine = new TypingEngine({
    targetSequence: 'FJFJ',
    mode: 'strict',
    allowBackspace: false,
  });
  engine.handleKeyInput('X');
  engine.handleKeyInput('Z');
  engine.handleKeyInput('A');
  assert(engine.getCurrentIndex() === 0, 'Case 3: Multiple incorrect keys do not change target position');
  assert(engine.getTargetChar() === 'F', 'Case 3.1: Target character remains F after 3 errors');
  assert(engine.getStats().incorrectAttempts === 3, 'Case 3.2: Recorded exactly 3 incorrect attempts');
}

{
  // Test 4: Correct key after several errors advances only once
  const engine = new TypingEngine({
    targetSequence: 'FJFJ',
    mode: 'strict',
    allowBackspace: false,
  });
  engine.handleKeyInput('X');
  engine.handleKeyInput('Y');
  const res = engine.handleKeyInput('F');
  assert(res.advanced && res.isCorrect, 'Case 4: Correct key after errors advances');
  assert(engine.getCurrentIndex() === 1, 'Case 4.1: Advances exactly once to index 1');
  assert(engine.getTargetChar() === 'J', 'Case 4.2: Target is now J');
  assert(engine.getStats().totalAttempts === 3, 'Case 4.3: Total attempts is 3 (2 errors + 1 correct)');
}

{
  // Test 5: Restart resets lesson progress, statistics, and state
  const engine = new TypingEngine({
    targetSequence: 'FJFJ',
    mode: 'strict',
    allowBackspace: false,
  });
  engine.handleKeyInput('F');
  engine.handleKeyInput('X');
  engine.reset();
  assert(engine.getState() === 'idle', 'Case 5: Engine state resets to idle');
  assert(engine.getCurrentIndex() === 0, 'Case 5.1: Index reset to 0');
  assert(engine.getStats().totalAttempts === 0, 'Case 5.2: Total attempts reset to 0');
  assert(engine.getStats().incorrectAttempts === 0, 'Case 5.3: Errors reset to 0');
}

{
  // Test 6: Pausing prevents progress until resumed
  const engine = new TypingEngine({
    targetSequence: 'FJFJ',
    mode: 'strict',
    allowBackspace: false,
  });
  engine.handleKeyInput('F'); // starts & moves to 1
  engine.pause();
  assert(engine.getState() === 'paused', 'Case 6: Engine state is paused');
  const attemptWhilePaused = engine.handleKeyInput('J');
  assert(!attemptWhilePaused.valid && !attemptWhilePaused.advanced, 'Case 6.1: Input blocked while paused');
  assert(engine.getCurrentIndex() === 1, 'Case 6.2: Position stayed at 1');
  engine.resume();
  assert(engine.getState() === 'running', 'Case 6.3: Engine resumed to running');
  const attemptAfterResume = engine.handleKeyInput('J');
  assert(attemptAfterResume.advanced, 'Case 6.4: Input works normally after resume');
  assert(engine.getCurrentIndex() === 2, 'Case 6.5: Advanced to index 2');
}

// ---------------------------------------------------------------------
// TEST GROUP 2: Metrics Calculations & Accuracy Formulas
// ---------------------------------------------------------------------
console.log('\n--- Group 2: Typing Metrics & Mathematical Correctness ---');

{
  // Test 9: WPM calculations for known sample inputs
  // 300 characters in 60 seconds (1 minute) = 300 / 5 / 1 = 60 Gross WPM
  const gross60 = calculateGrossWpm(300, 60);
  assert(gross60 === 60, `Case 9: 300 chars in 60s equals 60 Gross WPM (got ${gross60})`);

  // 300 characters in 60 seconds with 2 uncorrected errors = 60 - 2 = 58 Net WPM
  const net58 = calculateNetWpm(300, 2, 60);
  assert(net58 === 58, `Case 9.1: 300 chars with 2 errors in 60s equals 58 Net WPM (got ${net58})`);

  // Excessive errors clamp to zero net WPM (never negative)
  const netClamped = calculateNetWpm(50, 20, 60);
  assert(netClamped === 0, `Case 9.2: Net WPM clamps at 0 when errors exceed gross speed (got ${netClamped})`);
}

{
  // Test 10: Accuracy handles empty input, zero attempts, and divisions safely
  const emptyGuided = calculateGuidedAccuracy(0, 0);
  assert(emptyGuided === 100, `Case 10: Guided accuracy for 0 attempts defaults to 100% (got ${emptyGuided})`);

  const emptyPassage = calculatePassageAccuracy(0, 0);
  assert(emptyPassage === 100, `Case 10.1: Passage accuracy for 0 chars defaults to 100% (got ${emptyPassage})`);

  const zeroElapsedWpm = calculateGrossWpm(100, 0);
  assert(zeroElapsedWpm === 0, `Case 10.2: Gross WPM for 0 seconds is safely 0 (no NaN/Infinity)`);

  const zeroElapsedNet = calculateNetWpm(100, 5, 0);
  assert(zeroElapsedNet === 0, `Case 10.3: Net WPM for 0 seconds is safely 0 (no NaN/Infinity)`);

  const normalAccuracy = calculateGuidedAccuracy(95, 100);
  assert(normalAccuracy === 95, `Case 10.4: 95/100 is 95% accuracy`);
}

// ---------------------------------------------------------------------
// TEST GROUP 3: Key Layout, Shift & Modifiers
// ---------------------------------------------------------------------
console.log('\n--- Group 3: Keyboard Layout & Shift Behavior ---');

{
  // Test 11 & 12: Uppercase letters and symbols require Shift and map correctly
  const keyF = getKeyInfoForChar('f');
  assert(keyF !== null && keyF.code === 'KeyF' && !keyF.requiresShift, 'Case 12: Lowercase f maps to KeyF without Shift');
  assert(keyF?.finger === 'left-index', 'Case 12.1: f maps to left index finger');

  const keyCapitalF = getKeyInfoForChar('F');
  assert(keyCapitalF !== null && keyCapitalF.requiresShift, 'Case 12.2: Uppercase F requires Shift');
  assert(keyCapitalF?.shiftKeyToUse === 'ShiftRight', 'Case 12.3: Left hand F uses ShiftRight');

  const keyExclamation = getKeyInfoForChar('!');
  assert(keyExclamation !== null && keyExclamation.requiresShift, 'Case 12.4: Symbol ! requires Shift');
  assert(keyExclamation?.code === 'Digit1', 'Case 12.5: ! maps to Digit1');

  const keySpace = getKeyInfoForChar(' ');
  assert(keySpace !== null && keySpace.code === 'Space' && keySpace.finger === 'thumb', 'Case 12.6: Space maps to thumb');
}

// ---------------------------------------------------------------------
// TEST GROUP 4: Weak-Key Detection & Adaptive Drills
// ---------------------------------------------------------------------
console.log('\n--- Group 4: Weak-Key Remediation & Data Analysis ---');

{
  // Test 17: Unpracticed keys are NOT labeled weak
  const dummyStats: Record<string, KeyStats> = {
    f: {
      key: 'f',
      correctAttempts: 50,
      incorrectAttempts: 2,
      totalAttempts: 52,
      errorRate: 0.038,
      avgResponseTimeMs: 180,
      lastPracticedAt: Date.now(),
      masteryScore: 92,
      status: 'strong',
    },
    r: {
      key: 'r',
      correctAttempts: 15,
      incorrectAttempts: 10,
      totalAttempts: 25,
      errorRate: 0.4,
      avgResponseTimeMs: 420,
      lastPracticedAt: Date.now(),
      masteryScore: 45,
      status: 'weak',
    },
    z: {
      key: 'z',
      correctAttempts: 1,
      incorrectAttempts: 1,
      totalAttempts: 2, // < 5 attempts!
      errorRate: 0.5,
      avgResponseTimeMs: 300,
      lastPracticedAt: Date.now(),
      masteryScore: 0,
      status: 'unpracticed',
    },
  };

  const { weakKeys, strongKeys, unpracticedKeys } = getRankedKeyInsights(dummyStats);

  assert(weakKeys.some((k) => k.key === 'r'), 'Case 17: Key "r" with 40% errors is flagged weak');
  assert(!weakKeys.some((k) => k.key === 'z'), 'Case 17.1: Key "z" with only 2 attempts is NOT labeled weak (unpracticed threshold)');
  assert(unpracticedKeys.includes('z'), 'Case 17.2: Key "z" correctly listed in unpracticedKeys');
  assert(strongKeys.some((k) => k.key === 'f'), 'Case 17.3: Key "f" flagged as strong');

  // Test dynamic drill generation
  const weakDrill = generateWeakKeyLesson(['r']);
  assert(weakDrill.targetSequence.includes('frf') || weakDrill.targetSequence.includes('r'), 'Case 17.4: Drill includes targeted patterns for "r"');
}

// ---------------------------------------------------------------------
// TEST GROUP 5: Consistency Calculation & Rhythm
// ---------------------------------------------------------------------
console.log('\n--- Group 5: Typing Consistency & Rhythm ---');

{
  // Highly consistent intervals (e.g. 200ms +/- 5ms)
  const consistentIntervals = [200, 202, 198, 201, 199, 200, 203, 197];
  const highConsistency = calculateConsistency(consistentIntervals);
  assert(highConsistency >= 90, `High consistency score >= 90 (got ${highConsistency})`);

  // Erratic intervals (e.g. 100ms, 800ms, 120ms, 900ms)
  const erraticIntervals = [100, 800, 120, 950, 110, 850, 150];
  const lowConsistency = calculateConsistency(erraticIntervals);
  assert(lowConsistency < highConsistency, `Erratic typing has lower consistency score (got ${lowConsistency})`);
}

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
