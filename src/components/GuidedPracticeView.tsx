import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Pause,
  Play,
  ArrowRight,
  ShieldAlert,
  Zap,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Lesson, KeyStats, UserSettings, FingerName } from '../types';
import { TypingEngine, PracticeEngineResult } from '../core/typingEngine';
import { VirtualKeyboard } from './VirtualKeyboard';
import { HandGuides } from './HandGuides';
import { getKeyInfoForChar } from '../core/keyboardLayout';
import { soundEngine } from '../core/soundEngine';
import { storage } from '../core/storage';
import { CURRICULUM_LESSONS } from '../data/lessons';

interface GuidedPracticeViewProps {
  initialLesson?: Lesson;
  settings: UserSettings;
  statsMap: Record<string, KeyStats>;
  onKeyStatsUpdate: (statsMap: Record<string, KeyStats>) => void;
  onNavigateToLessons: () => void;
  onStartWeakDrill?: (keys: string[]) => void;
}

export const GuidedPracticeView: React.FC<GuidedPracticeViewProps> = ({
  initialLesson = CURRICULUM_LESSONS[0],
  settings,
  statsMap,
  onKeyStatsUpdate,
  onNavigateToLessons,
  onStartWeakDrill,
}) => {
  const isDark = settings.theme === 'dark';
  const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);

  const [engineState, setEngineState] = useState<'idle' | 'running' | 'paused' | 'completed' | 'error-recovery'>('idle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [stats, setStats] = useState({
    accuracy: 100,
    grossWpm: 0,
    netWpm: 0,
    elapsedSeconds: 0,
    incorrectAttempts: 0,
    correctAttempts: 0,
    totalAttempts: 0,
  });

  const [lastPressed, setLastPressed] = useState<{ code: string; isCorrect: boolean; timestamp: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<PracticeEngineResult | null>(null);

  const engineRef = useRef<TypingEngine | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize or reconfigure engine when lesson or settings change
  const setupEngine = useCallback((lessonToUse: Lesson) => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const engine = new TypingEngine({
      targetSequence: lessonToUse.targetSequence,
      mode: settings.strictMode ? 'strict' : 'relaxed',
      allowBackspace: settings.allowBackspace,
      onKeyAttempt: (char, isCorrect, rt) => {
        // Record per-key stats into persistent storage
        storage.updateKeyStat(char, isCorrect, rt);
        onKeyStatsUpdate(storage.getKeyStatsMap());
      },
      onStateChange: (state) => {
        setEngineState(state);
      },
      onComplete: (res) => {
        setCompletedResult(res);
        // Play success chime
        if (settings.soundEnabled) soundEngine.playSuccess();
        // Fire confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        // Save progress to storage
        let stars = 1;
        if (res.accuracy >= 95 && res.netWpm >= (lessonToUse.targetWpm || 25)) stars = 3;
        else if (res.accuracy >= 90) stars = 2;

        storage.saveLessonProgress({
          lessonId: lessonToUse.id,
          completedAt: Date.now(),
          netWpm: res.netWpm,
          grossWpm: res.grossWpm,
          accuracy: res.accuracy,
          mistakeCount: res.incorrectAttempts,
          timeSpentSeconds: res.elapsedSeconds,
          stars,
        });
      },
    });

    engineRef.current = engine;
    setCurrentIndex(0);
    setStats({
      accuracy: 100,
      grossWpm: 0,
      netWpm: 0,
      elapsedSeconds: 0,
      incorrectAttempts: 0,
      correctAttempts: 0,
      totalAttempts: 0,
    });
    setCompletedResult(null);
    setErrorMessage(null);
  }, [settings.strictMode, settings.allowBackspace, settings.soundEnabled, onKeyStatsUpdate]);

  useEffect(() => {
    setupEngine(currentLesson);
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentLesson, setupEngine]);

  // Periodic stats updater while running
  useEffect(() => {
    if (engineState === 'running') {
      timerIntervalRef.current = window.setInterval(() => {
        if (engineRef.current) {
          const s = engineRef.current.getStats();
          setStats({
            accuracy: s.accuracy,
            grossWpm: s.grossWpm,
            netWpm: s.netWpm,
            elapsedSeconds: Math.round(s.elapsedSeconds),
            incorrectAttempts: s.incorrectAttempts,
            correctAttempts: s.correctAttempts,
            totalAttempts: s.totalAttempts,
          });
        }
      }, 250);
    } else {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [engineState]);

  // Global keyboard input listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (engineState === 'completed') return;

      // Handle pause/resume with Escape
      if (e.key === 'Escape') {
        if (engineState === 'paused') {
          engineRef.current.resume();
        } else if (engineState === 'running') {
          engineRef.current.pause();
        }
        return;
      }

      // Handle restart with Tab+Enter or Alt+R
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setupEngine(currentLesson);
        return;
      }

      // Prevent scrolling on Space
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
      }

      // Ignore bare modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
        return;
      }

      // Do not intercept browser shortcuts like Ctrl+R, Cmd+C, etc.
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      // If user presses a key while paused, resume automatically
      if (engineState === 'paused') {
        engineRef.current.resume();
      }

      const inputChar = e.key;
      const res = engineRef.current.handleKeyInput(inputChar, e.repeat);

      // Audio feedback
      if (res.valid) {
        if (settings.soundEnabled) {
          if (res.isCorrect) {
            soundEngine.playKey(inputChar === ' ');
          } else if (settings.soundOnMistake) {
            soundEngine.playError();
          }
        }

        // Animate virtual keyboard key
        const info = getKeyInfoForChar(inputChar);
        if (info) {
          setLastPressed({
            code: info.code,
            isCorrect: res.isCorrect,
            timestamp: Date.now(),
          });
        }

        setCurrentIndex(engineRef.current.getCurrentIndex());
        const updatedStats = engineRef.current.getStats();
        setStats({
          accuracy: updatedStats.accuracy,
          grossWpm: updatedStats.grossWpm,
          netWpm: updatedStats.netWpm,
          elapsedSeconds: Math.round(updatedStats.elapsedSeconds),
          incorrectAttempts: updatedStats.incorrectAttempts,
          correctAttempts: updatedStats.correctAttempts,
          totalAttempts: updatedStats.totalAttempts,
        });

        if (!res.isCorrect) {
          setErrorMessage(`Expected '${res.targetChar === ' ' ? 'Space' : res.targetChar}', but pressed '${inputChar}'`);
        } else {
          setErrorMessage(null);
        }
      }
    },
    [engineState, settings.soundEnabled, settings.soundOnMistake, currentLesson, setupEngine]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const targetChar = engineRef.current ? engineRef.current.getTargetChar() : '';
  const targetKeyInfo = targetChar ? getKeyInfoForChar(targetChar) : null;
  const activeFinger: FingerName | null = targetKeyInfo?.finger || null;

  // Next lesson finding
  const currentIdxInCurriculum = CURRICULUM_LESSONS.findIndex((l) => l.id === currentLesson.id);
  const nextLesson = currentIdxInCurriculum >= 0 && currentIdxInCurriculum < CURRICULUM_LESSONS.length - 1
    ? CURRICULUM_LESSONS[currentIdxInCurriculum + 1]
    : null;

  const handleNextLesson = () => {
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    } else {
      onNavigateToLessons();
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-5">
      {/* HEADER / LESSON TITLE BAR */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold text-cyan-400">{currentLesson.category}</span>
            <span>·</span>
            <span>Difficulty: {currentLesson.difficulty}</span>
            {currentLesson.targetWpm && (
              <>
                <span>·</span>
                <span>Target: {currentLesson.targetWpm} WPM</span>
              </>
            )}
          </div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight mt-0.5">
            {currentLesson.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentLesson.description}</p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {engineState === 'running' ? (
            <button
              onClick={() => engineRef.current?.pause()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
          ) : engineState === 'paused' ? (
            <button
              onClick={() => engineRef.current?.resume()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
            >
              <Play size={14} />
              <span>Resume</span>
            </button>
          ) : null}

          <button
            onClick={() => setupEngine(currentLesson)}
            title="Restart Lesson (Alt+R)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>

          <button
            onClick={onNavigateToLessons}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            All Lessons
          </button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Net Speed</div>
            <div className="text-xl font-bold font-mono tabular-nums">{stats.netWpm} <span className="text-xs font-sans font-normal text-slate-500">WPM</span></div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Target size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Accuracy</div>
            <div className="text-xl font-bold font-mono tabular-nums">{stats.accuracy}%</div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Time Elapsed</div>
            <div className="text-xl font-bold font-mono tabular-nums">{stats.elapsedSeconds}s</div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Mistakes</div>
            <div className="text-xl font-bold font-mono tabular-nums">{stats.incorrectAttempts}</div>
          </div>
        </div>
      </div>

      {/* TYPING WORKSPACE VIEWPORT */}
      <div className={`relative p-6 md:p-8 rounded-2xl border flex flex-col items-center justify-center transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-300 shadow-md'
      }`}>
        {/* Progress bar line */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-150"
            style={{ width: `${engineRef.current?.getProgressPercent() || 0}%` }}
          />
        </div>

        {/* Character stream viewport */}
        <div className="w-full max-w-3xl flex items-center justify-center py-6 px-4 bg-slate-950/40 dark:bg-black/40 rounded-xl border border-slate-800/80 overflow-hidden font-mono text-2xl md:text-3xl tracking-wider select-none">
          <div className="flex items-center gap-1 flex-wrap justify-center leading-relaxed">
            {currentLesson.targetSequence.split('').map((char, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <span
                  key={idx}
                  className={`relative px-1 py-0.5 rounded transition-colors ${
                    isCurrent
                      ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/50 scale-110 z-10'
                      : isPast
                      ? 'text-emerald-400/70 font-normal'
                      : 'text-slate-500 font-normal'
                  }`}
                >
                  {char === ' ' ? (
                    <span className={`inline-block min-w-[12px] opacity-60 ${isCurrent ? 'underline underline-offset-4 decoration-cyan-400' : ''}`}>
                      ␣
                    </span>
                  ) : (
                    char
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Active Target Guidance Banner */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          {targetChar ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Target:</span>
              <kbd className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-mono font-bold text-base">
                {targetChar === ' ' ? 'Space Bar' : targetChar}
              </kbd>
              {targetKeyInfo && (
                <span className="text-xs text-slate-300">
                  Press with <strong>{targetKeyInfo.finger.replace('-', ' ')}</strong>
                </span>
              )}
            </div>
          ) : (
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Sparkles size={16} />
              <span>Lesson Complete!</span>
            </div>
          )}

          {/* Error Message Indicator */}
          {errorMessage && (
            <div className="text-rose-400 text-xs font-medium flex items-center gap-1 animate-bounce">
              <ShieldAlert size={14} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Paused Overlay */}
        {engineState === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-30">
            <div className="text-xl font-bold text-slate-200">Session Paused</div>
            <p className="text-xs text-slate-400">Press any key or click below to resume typing</p>
            <button
              onClick={() => engineRef.current?.resume()}
              className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-colors"
            >
              Resume Typing
            </button>
          </div>
        )}
      </div>

      {/* HANDS ANATOMICAL GUIDE */}
      {settings.showHands && (
        <HandGuides activeFinger={activeFinger} theme={settings.theme} />
      )}

      {/* VIRTUAL KEYBOARD */}
      <VirtualKeyboard
        targetChar={targetChar}
        lastPressedKey={lastPressed}
        activeFinger={activeFinger}
        heatmapMetric={settings.keyboardHeatmapMetric}
        statsMap={statsMap}
        showFingerZones={settings.showFingerGuides}
        theme={settings.theme}
        onVirtualKeyPress={(char) => {
          handleKeyDown(new KeyboardEvent('keydown', { key: char }));
        }}
      />

      {/* LESSON COMPLETED MODAL */}
      {completedResult && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl flex flex-col items-center gap-5 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
              🏆
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold">Drill Completed!</h3>
              <p className="text-xs text-slate-400 mt-1">{currentLesson.title}</p>
            </div>

            {/* Score Grid */}
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Net Speed</div>
                <div className="text-2xl font-bold font-mono text-cyan-400">{completedResult.netWpm} <span className="text-xs text-slate-500 font-sans">WPM</span></div>
                <div className="text-[10px] text-slate-500">Gross: {completedResult.grossWpm} WPM</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Accuracy</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">{completedResult.accuracy}%</div>
                <div className="text-[10px] text-slate-500">{completedResult.incorrectAttempts} mistakes</div>
              </div>
            </div>

            {/* Mistake feedback if any */}
            {Object.keys(completedResult.mistakesByTarget).length > 0 && (
              <div className="w-full p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs">
                <div className="font-semibold text-rose-300 mb-1">Mistakes to review:</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(completedResult.mistakesByTarget).map(([char, count]) => (
                    <span key={char} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                      '{char === ' ' ? 'Space' : char}': {count}x
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex items-center gap-3 pt-2">
              <button
                onClick={() => setupEngine(currentLesson)}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                Retry Drill
              </button>
              <button
                onClick={handleNextLesson}
                className="flex-1 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-400/20"
              >
                <span>Next Lesson</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
