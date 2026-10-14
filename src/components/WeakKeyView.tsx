import React, { useState } from 'react';
import {
  AlertTriangle,
  Zap,
  Target,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { KeyStats, UserSettings, Lesson } from '../types';
import { getRankedKeyInsights, generateWeakKeyLesson } from '../core/recommendations';
import { VirtualKeyboard } from './VirtualKeyboard';

interface WeakKeyViewProps {
  settings: UserSettings;
  statsMap: Record<string, KeyStats>;
  onStartLesson: (lesson: Lesson) => void;
}

export const WeakKeyView: React.FC<WeakKeyViewProps> = ({
  settings,
  statsMap,
  onStartLesson,
}) => {
  const isDark = settings.theme === 'dark';
  const { weakKeys, strongKeys, unpracticedKeys } = getRankedKeyInsights(statsMap);

  const [heatmapMode, setHeatmapMode] = useState<'mastery' | 'errorRate' | 'responseTime'>('mastery');
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    weakKeys.length > 0 ? weakKeys.slice(0, 3).map((k) => k.key) : []
  );

  const toggleSelectKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleStartTargetedDrill = () => {
    const keysToUse = selectedKeys.length > 0 ? selectedKeys : weakKeys.map((k) => k.key);
    const lesson = generateWeakKeyLesson(keysToUse);
    onStartLesson(lesson);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
      {/* HEADER CARD */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-bold">
            🎯
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Weak-Key Analysis & Targeted Remediation</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies motor-control bottlenecks using error rates, response latencies, and minimum attempt thresholds.
            </p>
          </div>
        </div>

        <button
          onClick={handleStartTargetedDrill}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm shadow-cyan-400/20 whitespace-nowrap"
        >
          <Sparkles size={16} />
          <span>Launch Adaptive Drill ({selectedKeys.length > 0 ? selectedKeys.map((k) => k.toUpperCase()).join(', ') : 'All Weak'})</span>
        </button>
      </div>

      {/* HEATMAP METRIC TOGGLES & VIRTUAL KEYBOARD */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers size={14} />
            <span>Interactive Keyboard Heatmap</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950/40 rounded-lg border border-slate-800">
            <button
              onClick={() => setHeatmapMode('mastery')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                heatmapMode === 'mastery'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mastery Score
            </button>
            <button
              onClick={() => setHeatmapMode('errorRate')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                heatmapMode === 'errorRate'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Error Rate %
            </button>
            <button
              onClick={() => setHeatmapMode('responseTime')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                heatmapMode === 'responseTime'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Latency (ms)
            </button>
          </div>
        </div>

        <VirtualKeyboard
          heatmapMetric={heatmapMode}
          statsMap={statsMap}
          showFingerZones={true}
          theme={settings.theme}
        />
      </div>

      {/* WEAK KEYS LIST & ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WEAK KEYS SECTION */}
        <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-rose-400" />
              <h3 className="font-bold text-sm tracking-tight">Keys Requiring Practice ({weakKeys.length})</h3>
            </div>
            <span className="text-xs text-slate-400">Click to select for drill</span>
          </div>

          {weakKeys.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
              No weak keys detected yet! Complete more guided lessons or speed tests (at least 5 attempts per key) to unlock accurate diagnostics.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {weakKeys.map((item) => {
                const isSelected = selectedKeys.includes(item.key);
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleSelectKey(item.key)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/60 ring-1 ring-rose-500/40'
                        : isDark
                        ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <kbd className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold text-base flex items-center justify-center">
                        {item.key.toUpperCase()}
                      </kbd>
                      <div>
                        <div className="font-semibold text-xs">Key '{item.key}'</div>
                        <div className="text-[11px] text-slate-400">{item.totalAttempts} total attempts</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <div className="font-bold text-rose-400">{item.errorRatePercent}% errors</div>
                        <div className="text-[10px] text-slate-500">{item.avgResponseTimeMs}ms avg</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-rose-500 border-rose-400 text-white text-[10px]' : 'border-slate-600'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STRONG & UNPRACTICED KEYS */}
        <div className="flex flex-col gap-5">
          {/* Strong Keys */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm tracking-tight">Strong Keys ({strongKeys.length})</h3>
            </div>

            {strongKeys.length === 0 ? (
              <div className="text-xs text-slate-400">Complete more lessons with ≥92% accuracy to log strong keys.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {strongKeys.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold"
                  >
                    <span>{item.key.toUpperCase()}</span>
                    <span className="text-[10px] opacity-70">({item.masteryScore}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unpracticed Keys */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-slate-400" />
              <h3 className="font-bold text-sm tracking-tight">Unpracticed Keys ({unpracticedKeys.length})</h3>
            </div>
            <p className="text-xs text-slate-400">
              Keys with under 5 keystroke attempts are held neutral to prevent premature diagnostic labeling:
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs text-slate-400">
              {unpracticedKeys.map((k) => (
                <span key={k} className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 uppercase">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
