import React from 'react';
import {
  Trophy,
  Activity,
  Flame,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  Sparkles,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { KeyStats, LessonProgress, SpeedTestResult, UserSettings, Lesson } from '../types';
import { PracticeStreakInfo } from '../core/storage';
import { getRankedKeyInsights, generateWeakKeyLesson } from '../core/recommendations';
import { CURRICULUM_LESSONS } from '../data/lessons';
import { VirtualKeyboard } from './VirtualKeyboard';

interface DashboardViewProps {
  settings: UserSettings;
  statsMap: Record<string, KeyStats>;
  speedTests: SpeedTestResult[];
  lessonProgress: Record<string, LessonProgress>;
  streakInfo: PracticeStreakInfo;
  onNavigateToPractice: (lesson?: Lesson) => void;
  onNavigateToSpeedTest: () => void;
  onNavigateToWeakKeys: () => void;
  onNavigateToLessons: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  statsMap,
  speedTests,
  lessonProgress,
  streakInfo,
  onNavigateToPractice,
  onNavigateToSpeedTest,
  onNavigateToWeakKeys,
  onNavigateToLessons,
}) => {
  const isDark = settings.theme === 'dark';
  const { weakKeys, strongKeys } = getRankedKeyInsights(statsMap);

  // Compute metrics
  const bestWpm = speedTests.length > 0 ? Math.max(...speedTests.map((t) => t.netWpm)) : 0;
  const avgWpm =
    speedTests.length > 0
      ? Math.round(speedTests.reduce((sum, t) => sum + t.netWpm, 0) / speedTests.length)
      : 0;
  const latestAccuracy =
    speedTests.length > 0 ? speedTests[0].accuracy : 100;

  const completedLessonsCount = Object.keys(lessonProgress).length;

  // Next recommended lesson: find first uncompleted lesson or weak-key drill
  const uncompletedLesson = CURRICULUM_LESSONS.find((l) => !lessonProgress[l.id]);
  const recommendedLesson = weakKeys.length > 0
    ? generateWeakKeyLesson(weakKeys.slice(0, 3).map((k) => k.key))
    : uncompletedLesson || CURRICULUM_LESSONS[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
      {/* HERO BANNER & PRIMARY WORKSPACE ACTIONS */}
      <div className={`p-6 md:p-8 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden ${
        isDark ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 shadow-xl' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col gap-2 max-w-xl z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <span>🔥 {streakInfo.currentStreak} Day Practice Streak</span>
            <span>·</span>
            <span>{streakInfo.todayPracticeSeconds > 0 ? `${Math.round(streakInfo.todayPracticeSeconds / 60)}m practiced today` : 'Ready to start'}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Elevate Your Touch Typing Velocity & Accuracy
          </h1>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Practice guided ergonomics with real-time target feedback, eliminate chronic typos with adaptive weak-key remediation, and measure your speed under true test conditions.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigateToPractice(recommendedLesson)}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm shadow-cyan-400/20"
            >
              <span>{weakKeys.length > 0 ? 'Start Weak-Key Drill' : 'Resume Guided Practice'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={onNavigateToSpeedTest}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Take Speed Test</span>
            </button>
          </div>
        </div>

        {/* Quick Recommendation Card */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 w-full md:w-64 shrink-0 ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles size={13} />
            <span>Recommended Next</span>
          </div>
          <div className="text-sm font-bold truncate">{recommendedLesson.title}</div>
          <p className="text-[11px] text-slate-400 line-clamp-2">{recommendedLesson.description}</p>
          <button
            onClick={() => onNavigateToPractice(recommendedLesson)}
            className="mt-2 text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Start this drill</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Personal Best</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {bestWpm} <span className="text-xs font-normal text-slate-500 font-sans">WPM</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Average Velocity</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {avgWpm} <span className="text-xs font-normal text-slate-500 font-sans">WPM</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Target size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Latest Accuracy</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {latestAccuracy}%
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Lessons Mastered</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {completedLessonsCount} / {CURRICULUM_LESSONS.length}
            </div>
          </div>
        </div>
      </div>

      {/* WEAK & STRONG KEY HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weak Keys */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-rose-400" />
              <h3 className="font-bold text-sm tracking-tight">Weakest Keys</h3>
            </div>
            <button
              onClick={onNavigateToWeakKeys}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View Analysis</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {weakKeys.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              No weak keys detected yet! Complete guided lessons to identify high-error keystrokes.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakKeys.slice(0, 5).map((k) => (
                <div
                  key={k.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono text-xs font-semibold"
                >
                  <span className="uppercase text-sm">{k.key}</span>
                  <span className="text-[10px] text-rose-400">({k.errorRatePercent}% err)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strong Keys */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm tracking-tight">Strong Keys</h3>
            </div>
            <button
              onClick={onNavigateToLessons}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Curriculum</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {strongKeys.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              Practice more sessions to build verified muscle memory scores above 80%.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strongKeys.slice(0, 6).map((k) => (
                <div
                  key={k.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-semibold"
                >
                  <span className="uppercase text-sm">{k.key}</span>
                  <span className="text-[10px] text-emerald-400">({k.masteryScore}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KEYBOARD HEATMAP SUMMARY PREVIEW */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Keyboard Mastery Heatmap
          </span>
          <button
            onClick={onNavigateToWeakKeys}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Full Heatmap Explorer</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <VirtualKeyboard
          heatmapMetric="mastery"
          statsMap={statsMap}
          showFingerZones={settings.showFingerGuides}
          theme={settings.theme}
        />
      </div>
    </div>
  );
};
