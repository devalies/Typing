import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Settings2,
  FileText,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { SpeedTestConfig, SpeedTestResult, UserSettings } from '../types';
import {
  calculateGrossWpm,
  calculateNetWpm,
  calculatePassageAccuracy,
  calculateCpm,
  calculateConsistency,
} from '../core/metrics';
import { soundEngine } from '../core/soundEngine';
import { storage } from '../core/storage';
import { SPEED_TEST_PASSAGES } from '../data/lessons';

interface SpeedTestViewProps {
  settings: UserSettings;
  onNavigateToWeakKeys: (keys: string[]) => void;
  onNavigateToAnalytics: () => void;
}

export const SpeedTestView: React.FC<SpeedTestViewProps> = ({
  settings,
  onNavigateToWeakKeys,
  onNavigateToAnalytics,
}) => {
  const isDark = settings.theme === 'dark';

  const [config, setConfig] = useState<SpeedTestConfig>({
    mode: 'time',
    durationSeconds: settings.defaultTestDuration || 60,
    includePunctuation: true,
    includeNumbers: false,
    allowBackspace: settings.allowBackspace,
  });

  const [passage, setPassage] = useState<string>('');
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');

  const [remainingSeconds, setRemainingSeconds] = useState<number>(config.durationSeconds);
  const [liveGrossWpm, setLiveGrossWpm] = useState<number>(0);
  const [liveNetWpm, setLiveNetWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  const [completedResult, setCompletedResult] = useState<SpeedTestResult | null>(null);
  const [customTextModalOpen, setCustomTextModalOpen] = useState(false);
  const [customTextInput, setCustomTextInput] = useState('');

  const startTimeRef = useRef<number>(0);
  const timerFrameRef = useRef<number | null>(null);
  const mistakesByKeyRef = useRef<Record<string, number>>({});
  const correctedMistakesRef = useRef<number>(0);
  const keystrokeTimestampsRef = useRef<number[]>([]);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Generate passage based on selected options
  const generatePassage = useCallback(() => {
    let text = '';
    if (config.mode === 'quote') {
      const articles = SPEED_TEST_PASSAGES.articles;
      text = articles[Math.floor(Math.random() * articles.length)];
    } else if (config.mode === 'code') {
      const snippets = SPEED_TEST_PASSAGES.codeSnippets;
      text = snippets[Math.floor(Math.random() * snippets.length)];
    } else if (config.mode === 'custom' && config.customText) {
      text = config.customText;
    } else {
      // Standard timed word sprint
      const words = SPEED_TEST_PASSAGES.shortWords;
      const pool = words.join(' ').split(' ');
      // Pick random 80 words
      const selected: string[] = [];
      for (let i = 0; i < 90; i++) {
        selected.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      text = selected.join(' ');
    }

    setPassage(text.trim());
    setTypedChars([]);
    setTestState('idle');
    setRemainingSeconds(config.durationSeconds);
    setLiveGrossWpm(0);
    setLiveNetWpm(0);
    setLiveAccuracy(100);
    setCompletedResult(null);
    startTimeRef.current = 0;
    mistakesByKeyRef.current = {};
    correctedMistakesRef.current = 0;
    keystrokeTimestampsRef.current = [];
  }, [config]);

  useEffect(() => {
    generatePassage();
  }, [generatePassage]);

  // Clean timer cleanup
  const stopTimer = useCallback(() => {
    if (timerFrameRef.current) {
      window.cancelAnimationFrame(timerFrameRef.current);
      timerFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Finish test and calculate finalized metrics
  const finishTest = useCallback(() => {
    stopTimer();
    setTestState('completed');

    const totalDuration = (Date.now() - startTimeRef.current) / 1000;
    const finalElapsed = Math.min(config.durationSeconds, Math.max(1, totalDuration));

    let correctCount = 0;
    let uncorrectedErrors = 0;

    typedChars.forEach((ch, idx) => {
      if (idx < passage.length) {
        if (ch === passage[idx]) {
          correctCount++;
        } else {
          uncorrectedErrors++;
        }
      }
    });

    const totalTyped = typedChars.length;
    const gross = calculateGrossWpm(totalTyped, finalElapsed);
    const net = calculateNetWpm(totalTyped, uncorrectedErrors, finalElapsed);
    const accuracy = calculatePassageAccuracy(correctCount, totalTyped);
    const cpm = calculateCpm(totalTyped, finalElapsed);

    // Consistency from intervals
    const timestamps = keystrokeTimestampsRef.current;
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    const consistency = calculateConsistency(intervals);

    const result: SpeedTestResult = {
      id: `test-${Date.now()}`,
      timestamp: Date.now(),
      mode: config.mode,
      durationSeconds: config.durationSeconds,
      elapsedSeconds: Math.round(finalElapsed),
      grossWpm: gross,
      netWpm: net,
      accuracy,
      cpm,
      totalCharactersTyped: totalTyped,
      correctCharacters: correctCount,
      incorrectCharacters: uncorrectedErrors,
      correctedMistakes: correctedMistakesRef.current,
      uncorrectedErrors,
      consistency,
      mistakesByKey: { ...mistakesByKeyRef.current },
    };

    setCompletedResult(result);
    storage.saveSpeedTestResult(result);

    // Audio & celebratory confetti
    if (settings.soundEnabled) soundEngine.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
  }, [config.durationSeconds, config.mode, passage, typedChars, settings.soundEnabled, stopTimer]);

  // Main countdown timer animation loop using timestamp deltas (drift-free)
  const updateTimer = useCallback(() => {
    if (startTimeRef.current === 0) return;

    const now = Date.now();
    const elapsedSec = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, config.durationSeconds - elapsedSec);

    setRemainingSeconds(Math.ceil(remaining));

    // Calculate live metrics
    let correct = 0;
    let errors = 0;
    typedChars.forEach((ch, idx) => {
      if (idx < passage.length) {
        if (ch === passage[idx]) correct++;
        else errors++;
      }
    });

    if (elapsedSec > 0.5) {
      setLiveGrossWpm(calculateGrossWpm(typedChars.length, elapsedSec));
      setLiveNetWpm(calculateNetWpm(typedChars.length, errors, elapsedSec));
      setLiveAccuracy(calculatePassageAccuracy(correct, typedChars.length));
    }

    if (remaining <= 0) {
      finishTest();
      return;
    }

    timerFrameRef.current = window.requestAnimationFrame(updateTimer);
  }, [config.durationSeconds, passage, typedChars, finishTest]);

  // Handle typing input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (testState === 'completed') return;

    // Start timer strictly on first valid typing keypress
    if (testState === 'idle') {
      if (e.key.length === 1 || e.key === 'Backspace') {
        setTestState('running');
        startTimeRef.current = Date.now();
        keystrokeTimestampsRef.current = [Date.now()];
        timerFrameRef.current = window.requestAnimationFrame(updateTimer);
      }
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (config.allowBackspace && typedChars.length > 0) {
        const lastIdx = typedChars.length - 1;
        const expected = passage[lastIdx];
        const actual = typedChars[lastIdx];

        if (actual !== expected) {
          correctedMistakesRef.current += 1;
        }

        setTypedChars((prev) => prev.slice(0, -1));
        if (settings.soundEnabled) soundEngine.playKey(false);
      }
      return;
    }

    // Ignore modifiers
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
      return;
    }

    if (e.key.length === 1) {
      const char = e.key;
      const currentIdx = typedChars.length;

      // Check if finished passage early
      if (currentIdx >= passage.length) {
        finishTest();
        return;
      }

      const expected = passage[currentIdx];
      const isCorrect = char === expected;

      if (!isCorrect) {
        mistakesByKeyRef.current[expected] = (mistakesByKeyRef.current[expected] || 0) + 1;
        // Also update per-key stats
        storage.updateKeyStat(expected, false, 250);
        if (settings.soundEnabled && settings.soundOnMistake) {
          soundEngine.playError();
        }
      } else {
        storage.updateKeyStat(expected, true, 200);
        if (settings.soundEnabled) {
          soundEngine.playKey(char === ' ');
        }
      }

      keystrokeTimestampsRef.current.push(Date.now());
      const newTyped = [...typedChars, char];
      setTypedChars(newTyped);

      // If user typed the entire passage, finish
      if (newTyped.length >= passage.length) {
        finishTest();
      }
    }
  };

  const focusInput = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-5">
      {/* TEST CONFIGURATION BAR */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Durations */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/40 dark:bg-black/30 rounded-lg border border-slate-800/80">
          {[15, 30, 60, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setConfig({ ...config, durationSeconds: sec });
                setRemainingSeconds(sec);
              }}
              disabled={testState === 'running'}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                config.durationSeconds === sec
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Content Modes */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/40 dark:bg-black/30 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setConfig({ ...config, mode: 'time' })}
            disabled={testState === 'running'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              config.mode === 'time'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Word Sprint
          </button>
          <button
            onClick={() => setConfig({ ...config, mode: 'quote' })}
            disabled={testState === 'running'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              config.mode === 'quote'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Real Articles
          </button>
          <button
            onClick={() => setConfig({ ...config, mode: 'code' })}
            disabled={testState === 'running'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              config.mode === 'code'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Code Syntax
          </button>
          <button
            onClick={() => setCustomTextModalOpen(true)}
            disabled={testState === 'running'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              config.mode === 'custom'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Text
          </button>
        </div>

        {/* Quick Restart Action */}
        <button
          onClick={generatePassage}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-colors"
        >
          <RotateCcw size={14} />
          <span>New Test</span>
        </button>
      </div>

      {/* LIVE STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Time Left</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
              {remainingSeconds}s
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Live Net WPM</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {liveNetWpm}
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Target size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Live Accuracy</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-indigo-400">
              {liveAccuracy}%
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Typed Characters</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-200">
              {typedChars.length} / {passage.length}
            </div>
          </div>
        </div>
      </div>

      {/* TYPING PASSAGE CANVAS */}
      <div
        onClick={focusInput}
        className={`relative min-h-[220px] p-6 md:p-8 rounded-2xl border cursor-text transition-all select-none ${
          isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl' : 'bg-white border-slate-300 shadow-lg'
        }`}
      >
        {/* Hidden capturing input */}
        <input
          ref={hiddenInputRef}
          type="text"
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          onKeyDown={handleKeyDown}
          autoFocus
          value=""
          onChange={() => {}}
        />

        {/* Start typing banner if idle */}
        {testState === 'idle' && (
          <div className="mb-4 text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>Click here and start typing to begin the timer</span>
          </div>
        )}

        {/* Text characters viewport */}
        <div className="font-mono text-lg md:text-xl leading-relaxed tracking-wide break-words">
          {passage.split('').map((char, index) => {
            const hasBeenTyped = index < typedChars.length;
            const isCurrent = index === typedChars.length;
            const typedChar = hasBeenTyped ? typedChars[index] : null;
            const isCorrect = typedChar === char;

            let charClass = 'text-slate-500';
            if (hasBeenTyped) {
              charClass = isCorrect
                ? 'text-emerald-400 font-medium'
                : 'bg-rose-500/30 text-rose-300 rounded px-0.5 underline decoration-rose-500';
            }

            return (
              <span key={index} className={`relative ${charClass}`}>
                {isCurrent && (
                  <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
                )}
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* RESULTS MODAL */}
      {completedResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-xl p-6 md:p-8 rounded-2xl border shadow-2xl flex flex-col gap-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-2xl font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Test Complete!</h3>
                  <div className="text-xs text-slate-400 capitalize">{completedResult.mode} Test · {completedResult.durationSeconds}s Duration</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
                  {completedResult.netWpm}
                </div>
                <div className="text-xs text-slate-400 font-medium">Net WPM</div>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Gross WPM</div>
                <div className="text-xl font-bold font-mono text-slate-200">{completedResult.grossWpm}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Accuracy</div>
                <div className="text-xl font-bold font-mono text-emerald-400">{completedResult.accuracy}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Consistency</div>
                <div className="text-xl font-bold font-mono text-indigo-400">{completedResult.consistency}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="text-xs text-slate-400">Total Chars</div>
                <div className="text-xl font-bold font-mono text-slate-200">{completedResult.totalCharactersTyped}</div>
              </div>
            </div>

            {/* Error Analysis & Corrections */}
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/30 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Corrected Mistakes:</span>
                <span className="font-semibold text-slate-200">{completedResult.correctedMistakes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Uncorrected Errors:</span>
                <span className="font-semibold text-rose-400">{completedResult.uncorrectedErrors}</span>
              </div>
              {Object.keys(completedResult.mistakesByKey).length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 mr-1">Frequent Mistake Keys:</span>
                  {Object.entries(completedResult.mistakesByKey).slice(0, 5).map(([key, count]) => (
                    <span key={key} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-semibold">
                      '{key === ' ' ? 'Space' : key}': {count}x
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={generatePassage}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Test Again</span>
              </button>

              {Object.keys(completedResult.mistakesByKey).length > 0 && (
                <button
                  onClick={() => onNavigateToWeakKeys(Object.keys(completedResult.mistakesByKey))}
                  className="flex-1 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  <span>Fix Mistake Keys</span>
                </button>
              )}

              <button
                onClick={onNavigateToAnalytics}
                className="flex-1 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-400/20"
              >
                <span>View Analytics</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TEXT MODAL */}
      {customTextModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl flex flex-col gap-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            <h3 className="text-lg font-bold">Custom Typing Passage</h3>
            <p className="text-xs text-slate-400">
              Paste any custom article, quote, or programming code to practice:
            </p>
            <textarea
              rows={5}
              value={customTextInput}
              onChange={(e) => setCustomTextInput(e.target.value)}
              placeholder="Paste text here..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomTextModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customTextInput.trim()) {
                    setConfig({
                      ...config,
                      mode: 'custom',
                      customText: customTextInput.trim(),
                    });
                    setCustomTextModalOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition-colors"
              >
                Load Text & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
