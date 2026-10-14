import { EngineState, PracticeMode } from '../types';
import { calculateGuidedAccuracy, calculateNetWpm, calculateGrossWpm } from './metrics';

export interface TypingEngineConfig {
  targetSequence: string;
  mode: PracticeMode;
  allowBackspace: boolean;
  onKeyAttempt?: (char: string, isCorrect: boolean, responseTimeMs: number) => void;
  onStateChange?: (state: EngineState) => void;
  onComplete?: (summary: PracticeEngineResult) => void;
}

export interface PracticeEngineResult {
  targetSequence: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  elapsedSeconds: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  mistakesByTarget: Record<string, number>;
  interKeyIntervalsMs: number[];
}

export class TypingEngine {
  private targetSequence: string = '';
  private mode: PracticeMode = 'strict';
  private allowBackspace: boolean = true;
  private state: EngineState = 'idle';

  private currentIndex: number = 0;
  private totalAttempts: number = 0;
  private correctAttempts: number = 0;
  private incorrectAttempts: number = 0;

  private startTime: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  private lastKeyTimestamp: number = 0;

  private mistakesByTarget: Record<string, number> = {};
  private interKeyIntervalsMs: number[] = [];

  // Track relaxed mode typed characters if needed
  private relaxedTypedChars: string[] = [];

  private onKeyAttempt?: (char: string, isCorrect: boolean, responseTimeMs: number) => void;
  private onStateChange?: (state: EngineState) => void;
  private onComplete?: (summary: PracticeEngineResult) => void;

  constructor(config: TypingEngineConfig) {
    this.init(config);
  }

  public init(config: TypingEngineConfig) {
    this.targetSequence = config.targetSequence || '';
    this.mode = config.mode || 'strict';
    this.allowBackspace = config.allowBackspace !== undefined ? config.allowBackspace : true;
    this.onKeyAttempt = config.onKeyAttempt;
    this.onStateChange = config.onStateChange;
    this.onComplete = config.onComplete;
    this.reset();
  }

  public reset() {
    this.state = 'idle';
    this.currentIndex = 0;
    this.totalAttempts = 0;
    this.correctAttempts = 0;
    this.incorrectAttempts = 0;
    this.startTime = 0;
    this.pausedTime = 0;
    this.totalPausedDuration = 0;
    this.lastKeyTimestamp = 0;
    this.mistakesByTarget = {};
    this.interKeyIntervalsMs = [];
    this.relaxedTypedChars = [];
    this.notifyState();
  }

  public pause() {
    if (this.state === 'running' || this.state === 'error-recovery') {
      this.state = 'paused';
      this.pausedTime = Date.now();
      this.notifyState();
    }
  }

  public resume() {
    if (this.state === 'paused') {
      if (this.pausedTime > 0) {
        this.totalPausedDuration += Date.now() - this.pausedTime;
        this.pausedTime = 0;
      }
      this.state = 'running';
      this.lastKeyTimestamp = Date.now();
      this.notifyState();
    }
  }

  public getState(): EngineState {
    return this.state;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTargetChar(): string {
    if (this.currentIndex >= this.targetSequence.length) return '';
    return this.targetSequence[this.currentIndex];
  }

  public getTargetSequence(): string {
    return this.targetSequence;
  }

  public getProgressPercent(): number {
    if (!this.targetSequence || this.targetSequence.length === 0) return 0;
    return Math.min(100, Math.round((this.currentIndex / this.targetSequence.length) * 100));
  }

  public getElapsedSeconds(): number {
    if (this.startTime === 0) return 0;
    const now = this.state === 'paused' ? this.pausedTime : Date.now();
    const elapsedMs = Math.max(0, now - this.startTime - this.totalPausedDuration);
    return Math.max(0, elapsedMs / 1000);
  }

  public getStats() {
    const elapsed = this.getElapsedSeconds();
    const accuracy = calculateGuidedAccuracy(this.correctAttempts, this.totalAttempts);
    const grossWpm = calculateGrossWpm(this.correctAttempts, elapsed);
    const netWpm = calculateNetWpm(this.correctAttempts, this.incorrectAttempts, elapsed);

    return {
      currentIndex: this.currentIndex,
      targetChar: this.getTargetChar(),
      progressPercent: this.getProgressPercent(),
      totalAttempts: this.totalAttempts,
      correctAttempts: this.correctAttempts,
      incorrectAttempts: this.incorrectAttempts,
      elapsedSeconds: elapsed,
      accuracy,
      grossWpm,
      netWpm,
    };
  }

  /**
   * Process a keystroke input.
   * Returns: { valid: boolean, advanced: boolean, isCorrect: boolean, charEntered: string }
   */
  public handleKeyInput(key: string, isRepeat: boolean = false): {
    valid: boolean;
    advanced: boolean;
    isCorrect: boolean;
    targetChar: string;
  } {
    // Cannot type when paused or already completed
    if (this.state === 'paused' || this.state === 'completed') {
      return { valid: false, advanced: false, isCorrect: false, targetChar: this.getTargetChar() };
    }

    // Ignore non-character keys like Shift, Control, Alt, Meta, CapsLock, Arrow keys, etc.
    if (
      key.length > 1 &&
      key !== 'Backspace' &&
      key !== 'Enter' &&
      key !== 'Tab'
    ) {
      return { valid: false, advanced: false, isCorrect: false, targetChar: this.getTargetChar() };
    }

    // Handle Backspace in relaxed mode or allowed mode
    if (key === 'Backspace') {
      if (this.allowBackspace && this.currentIndex > 0) {
        if (this.mode === 'relaxed') {
          this.currentIndex -= 1;
          this.relaxedTypedChars.pop();
          return { valid: true, advanced: false, isCorrect: true, targetChar: this.getTargetChar() };
        }
      }
      return { valid: false, advanced: false, isCorrect: false, targetChar: this.getTargetChar() };
    }

    // Normalize Enter or Tab
    let normalizedChar = key;
    if (key === 'Enter') normalizedChar = '\n';
    if (key === 'Tab') normalizedChar = '\t';

    // Start timer on first valid character attempt
    const now = Date.now();
    if (this.state === 'idle') {
      this.state = 'running';
      this.startTime = now;
      this.lastKeyTimestamp = now;
      this.notifyState();
    }

    const expectedChar = this.getTargetChar();
    if (!expectedChar) {
      return { valid: false, advanced: false, isCorrect: false, targetChar: '' };
    }

    // Calculate response time
    const responseTime = this.lastKeyTimestamp > 0 ? Math.max(10, now - this.lastKeyTimestamp) : 150;
    this.lastKeyTimestamp = now;
    if (this.interKeyIntervalsMs.length < 500) {
      this.interKeyIntervalsMs.push(responseTime);
    }

    // Check match
    const isCorrect = normalizedChar === expectedChar;
    this.totalAttempts += 1;

    if (isCorrect) {
      this.correctAttempts += 1;
      this.currentIndex += 1;
      this.state = 'running';

      if (this.mode === 'relaxed') {
        this.relaxedTypedChars.push(normalizedChar);
      }

      this.onKeyAttempt?.(expectedChar, true, responseTime);

      // Check if finished
      if (this.currentIndex >= this.targetSequence.length) {
        this.state = 'completed';
        this.notifyState();
        this.handleCompletion();
      }

      return { valid: true, advanced: true, isCorrect: true, targetChar: expectedChar };
    } else {
      // Mistake!
      this.incorrectAttempts += 1;
      this.mistakesByTarget[expectedChar] = (this.mistakesByTarget[expectedChar] || 0) + 1;
      this.state = 'error-recovery';

      this.onKeyAttempt?.(expectedChar, false, responseTime);

      if (this.mode === 'relaxed') {
        // In relaxed mode, advance despite error
        this.relaxedTypedChars.push(normalizedChar);
        this.currentIndex += 1;

        if (this.currentIndex >= this.targetSequence.length) {
          this.state = 'completed';
          this.notifyState();
          this.handleCompletion();
        }

        return { valid: true, advanced: true, isCorrect: false, targetChar: expectedChar };
      }

      // In strict mode: DO NOT ADVANCE! Target remains expectedChar.
      this.notifyState();
      return { valid: true, advanced: false, isCorrect: false, targetChar: expectedChar };
    }
  }

  private handleCompletion() {
    const elapsed = this.getElapsedSeconds();
    const result: PracticeEngineResult = {
      targetSequence: this.targetSequence,
      totalAttempts: this.totalAttempts,
      correctAttempts: this.correctAttempts,
      incorrectAttempts: this.incorrectAttempts,
      elapsedSeconds: elapsed,
      grossWpm: calculateGrossWpm(this.correctAttempts, elapsed),
      netWpm: calculateNetWpm(this.correctAttempts, this.incorrectAttempts, elapsed),
      accuracy: calculateGuidedAccuracy(this.correctAttempts, this.totalAttempts),
      mistakesByTarget: { ...this.mistakesByTarget },
      interKeyIntervalsMs: [...this.interKeyIntervalsMs],
    };

    this.onComplete?.(result);
  }

  private notifyState() {
    this.onStateChange?.(this.state);
  }
}
