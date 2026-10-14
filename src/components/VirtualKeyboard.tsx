import React from 'react';
import { FingerName, KeyStats } from '../types';
import { KEYBOARD_ROWS, FINGER_COLORS, getKeyInfoForChar } from '../core/keyboardLayout';

interface VirtualKeyboardProps {
  targetChar?: string;
  lastPressedKey?: { code: string; isCorrect: boolean; timestamp: number } | null;
  activeFinger?: FingerName | null;
  heatmapMetric?: 'none' | 'mastery' | 'errorRate' | 'responseTime';
  statsMap?: Record<string, KeyStats>;
  showFingerZones?: boolean;
  theme?: 'dark' | 'light';
  onVirtualKeyPress?: (char: string) => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetChar = '',
  lastPressedKey,
  activeFinger,
  heatmapMetric = 'none',
  statsMap = {},
  showFingerZones = true,
  theme = 'dark',
  onVirtualKeyPress,
}) => {
  const isDark = theme === 'dark';
  const targetKeyInfo = targetChar ? getKeyInfoForChar(targetChar) : null;

  // Determine which shift key should be illuminated
  const requiresShift = targetKeyInfo?.requiresShift ?? false;
  const targetShiftCode = targetKeyInfo?.shiftKeyToUse;

  return (
    <div className={`w-full max-w-4xl mx-auto p-3 md:p-5 rounded-2xl border transition-colors select-none ${
      isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl shadow-black/60' : 'bg-slate-100/90 border-slate-300 shadow-xl'
    }`}>
      {/* KEYBOARD ROWS */}
      <div className="flex flex-col gap-1.5 md:gap-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 md:gap-1.5 w-full">
            {row.map((key) => {
              const isTargetKey = targetKeyInfo?.code === key.code;
              const isTargetShift = requiresShift && (key.code === targetShiftCode || (key.isSpecial && key.primaryChar === 'Shift' && !targetShiftCode));

              const isRecentlyPressed =
                lastPressedKey &&
                lastPressedKey.code === key.code &&
                Date.now() - lastPressedKey.timestamp < 300;

              const isCorrectPress = isRecentlyPressed && lastPressedKey?.isCorrect;
              const isIncorrectPress = isRecentlyPressed && !lastPressedKey?.isCorrect;

              // Finger zone color
              const fingerConfig = FINGER_COLORS[key.finger];

              // Key performance stat
              const keyStat = statsMap[key.primaryChar.toLowerCase()];

              // Heatmap calculation
              let heatmapBg = '';
              let heatmapBadge = '';

              if (heatmapMetric !== 'none' && keyStat && !key.isSpecial) {
                if (keyStat.totalAttempts < 5) {
                  heatmapBadge = 'unpracticed';
                } else if (heatmapMetric === 'mastery') {
                  if (keyStat.masteryScore >= 80) heatmapBg = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300';
                  else if (keyStat.masteryScore >= 60) heatmapBg = 'bg-amber-500/20 border-amber-500/60 text-amber-300';
                  else heatmapBg = 'bg-rose-500/25 border-rose-500/80 text-rose-300';
                  heatmapBadge = `${keyStat.masteryScore}%`;
                } else if (heatmapMetric === 'errorRate') {
                  const errPct = Math.round(keyStat.errorRate * 100);
                  if (errPct > 20) heatmapBg = 'bg-rose-500/30 border-rose-500 text-rose-300';
                  else if (errPct > 10) heatmapBg = 'bg-amber-500/20 border-amber-500 text-amber-300';
                  else heatmapBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                  heatmapBadge = `${errPct}%`;
                } else if (heatmapMetric === 'responseTime') {
                  heatmapBadge = `${keyStat.avgResponseTimeMs}ms`;
                  if (keyStat.avgResponseTimeMs > 400) heatmapBg = 'bg-rose-500/25 border-rose-500 text-rose-300';
                  else if (keyStat.avgResponseTimeMs > 250) heatmapBg = 'bg-amber-500/20 border-amber-500 text-amber-300';
                  else heatmapBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                }
              }

              return (
                <button
                  key={key.code}
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    if (onVirtualKeyPress && !key.isSpecial) {
                      onVirtualKeyPress(requiresShift && key.shiftChar ? key.shiftChar : key.primaryChar);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center font-mono rounded-lg transition-all duration-75
                    ${key.width || 'flex-1 min-w-[32px] md:min-w-[42px]'}
                    h-10 md:h-12 text-xs md:text-sm font-semibold border
                    ${isDark ? 'keycap-bevel' : 'keycap-bevel-light'}
                    ${
                      isTargetKey
                        ? 'ring-2 ring-cyan-400 bg-cyan-500/30 border-cyan-400 text-cyan-200 scale-105 z-10 animate-pulse'
                        : isTargetShift
                        ? 'ring-2 ring-purple-400 bg-purple-500/30 border-purple-400 text-purple-200 scale-102 z-10 animate-pulse'
                        : isCorrectPress
                        ? 'bg-emerald-500/40 border-emerald-400 text-emerald-200 scale-95 active-pressed'
                        : isIncorrectPress
                        ? 'bg-rose-500/50 border-rose-400 text-rose-200 scale-95 active-pressed'
                        : heatmapBg
                        ? heatmapBg
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700/80'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                    }
                  `}
                >
                  {/* Shift Character label (top-right or top) */}
                  {key.shiftChar && (
                    <span className="text-[10px] md:text-xs leading-none opacity-60">
                      {key.shiftChar}
                    </span>
                  )}

                  {/* Primary Character label */}
                  <span className={`${key.shiftChar ? 'text-xs md:text-sm font-bold' : 'text-xs md:text-sm'}`}>
                    {key.primaryChar}
                  </span>

                  {/* Heatmap Micro-Badge */}
                  {heatmapBadge && heatmapBadge !== 'unpracticed' && (
                    <span className="absolute bottom-0.5 right-1 text-[8px] opacity-80 font-mono">
                      {heatmapBadge}
                    </span>
                  )}

                  {/* Tactile bumps on F and J */}
                  {(key.code === 'KeyF' || key.code === 'KeyJ') && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 bg-current opacity-40 rounded-full" />
                  )}

                  {/* Finger Zone Dot */}
                  {showFingerZones && !key.isSpecial && (
                    <span
                      className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full opacity-60"
                      style={{ backgroundColor: fingerConfig.dotColor }}
                      title={fingerConfig.name}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* HEATMAP LEGEND / FINGER LEGEND BAR */}
      <div className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
        isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
      }`}>
        {heatmapMetric !== 'none' ? (
          <div className="flex items-center gap-3">
            <span className="font-medium text-[11px] uppercase tracking-wider">Heatmap ({heatmapMetric}):</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500 inline-block" />
              <span>Strong (Mastered)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500 inline-block" />
              <span>Average</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500 inline-block" />
              <span>Weak (Needs Practice)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="font-medium text-[11px] uppercase tracking-wider text-slate-400">Finger Zones:</span>
            {['left-pinky', 'left-ring', 'left-middle', 'left-index', 'thumb', 'right-index'].map((fName) => {
              const conf = FINGER_COLORS[fName as FingerName];
              return (
                <div key={fName} className="flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.dotColor }} />
                  <span>{conf.badge}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px]">
          {requiresShift && (
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
              Hold {targetShiftCode === 'ShiftLeft' ? 'Left Shift' : 'Right Shift'}
            </span>
          )}
          {targetChar && (
            <span className="text-slate-400">
              Target Key: <strong className="text-cyan-400 font-mono text-sm uppercase">{targetChar === ' ' ? 'Space' : targetChar}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
