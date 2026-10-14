import React, { useState, useRef } from 'react';
import {
  Trophy,
  Activity,
  Calendar,
  Clock,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { SpeedTestResult, UserSettings } from '../types';
import { storage, PracticeStreakInfo } from '../core/storage';

interface AnalyticsViewProps {
  settings: UserSettings;
  results: SpeedTestResult[];
  streakInfo: PracticeStreakInfo;
  onDataReset: () => void;
  onDataImported: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  settings,
  results,
  streakInfo,
  onDataReset,
  onDataImported,
}) => {
  const isDark = settings.theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Compute aggregate stats
  const bestWpm = results.length > 0 ? Math.max(...results.map((r) => r.netWpm)) : 0;
  const avgWpm =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.netWpm, 0) / results.length)
      : 0;
  const avgAccuracy =
    results.length > 0
      ? Math.round((results.reduce((sum, r) => sum + r.accuracy, 0) / results.length) * 10) / 10
      : 100;

  const totalPracticeMinutes = Math.round(streakInfo.totalPracticeSeconds / 60);

  const handleExport = () => {
    const json = storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keycraft-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importData(content);
        if (success) {
          setImportStatus('Data imported successfully!');
          onDataImported();
        } else {
          setImportStatus('Failed to import: invalid JSON format.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all typing statistics, history, and streaks? This cannot be undone.')) {
      storage.resetAllData();
      onDataReset();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Performance & Speed Analytics</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive historical records, WPM progression, accuracy consistency, and data portability.
            </p>
          </div>
        </div>

        {/* Data Portability Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleReset}
            title="Reset All Records"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/60 hover:bg-rose-950/40 text-rose-400 text-xs font-semibold transition-colors"
          >
            <Trash2 size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
          importStatus.includes('success')
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {importStatus.includes('success') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{importStatus}</span>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Best Speed</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {bestWpm} <span className="text-xs font-normal text-slate-500 font-sans">WPM</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Average Speed</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {avgWpm} <span className="text-xs font-normal text-slate-500 font-sans">WPM</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Average Accuracy</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {avgAccuracy}%
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Practice</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {totalPracticeMinutes} <span className="text-xs font-normal text-slate-500 font-sans">mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* STREAK & CALENDAR INFO */}
      <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Practice Streaks & Consistency</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Build automatic muscle memory with daily deliberate training sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Current Streak</span>
            <span className="text-lg font-bold text-amber-400">{streakInfo.currentStreak} Days</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Longest Streak</span>
            <span className="text-lg font-bold text-slate-200">{streakInfo.longestStreak} Days</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Total Active Days</span>
            <span className="text-lg font-bold text-slate-200">{streakInfo.totalPracticeDays}</span>
          </div>
        </div>
      </div>

      {/* TEST HISTORY TABLE */}
      <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight">Recent Speed Test Logs ({results.length})</h3>
          <span className="text-xs text-slate-400">Stored safely in client-side storage</span>
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
            No speed tests taken yet. Start your first timed test to view comprehensive velocity and accuracy progression.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 font-semibold">Date & Time</th>
                  <th className="py-2.5 font-semibold">Mode</th>
                  <th className="py-2.5 font-semibold">Net WPM</th>
                  <th className="py-2.5 font-semibold">Gross WPM</th>
                  <th className="py-2.5 font-semibold">Accuracy</th>
                  <th className="py-2.5 font-semibold">Consistency</th>
                  <th className="py-2.5 font-semibold">Duration</th>
                  <th className="py-2.5 font-semibold">Mistakes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.slice(0, 25).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-400">
                      {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 capitalize font-sans text-slate-300">{r.mode}</td>
                    <td className="py-2.5 font-bold text-cyan-400">{r.netWpm}</td>
                    <td className="py-2.5 text-slate-300">{r.grossWpm}</td>
                    <td className="py-2.5 font-medium text-emerald-400">{r.accuracy}%</td>
                    <td className="py-2.5 text-indigo-400">{r.consistency}%</td>
                    <td className="py-2.5 text-slate-400">{r.elapsedSeconds}s</td>
                    <td className="py-2.5 text-rose-400">{r.uncorrectedErrors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
