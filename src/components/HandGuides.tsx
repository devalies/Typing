import React from 'react';
import { FingerName, HandName } from '../types';
import { FINGER_COLORS } from '../core/keyboardLayout';

interface HandGuidesProps {
  activeFinger: FingerName | null;
  activeHand?: HandName;
  theme?: 'dark' | 'light';
}

export const HandGuides: React.FC<HandGuidesProps> = ({
  activeFinger,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const isFingerActive = (finger: FingerName) => activeFinger === finger;

  return (
    <div className={`flex items-center justify-center gap-8 md:gap-14 py-3 px-4 rounded-xl border transition-colors ${
      isDark ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      {/* LEFT HAND */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Left Hand
        </span>
        <div className="flex items-end gap-1.5 h-16 px-2">
          {/* Left Pinky */}
          <FingerBar
            label="Pinky"
            height="h-10"
            isActive={isFingerActive('left-pinky')}
            colorClass={FINGER_COLORS['left-pinky'].bgDark}
            activeColorClass="bg-pink-500 shadow-lg shadow-pink-500/50 scale-105"
            dotColor={FINGER_COLORS['left-pinky'].dotColor}
          />
          {/* Left Ring */}
          <FingerBar
            label="Ring"
            height="h-13"
            isActive={isFingerActive('left-ring')}
            colorClass={FINGER_COLORS['left-ring'].bgDark}
            activeColorClass="bg-indigo-500 shadow-lg shadow-indigo-500/50 scale-105"
            dotColor={FINGER_COLORS['left-ring'].dotColor}
          />
          {/* Left Middle */}
          <FingerBar
            label="Middle"
            height="h-15"
            isActive={isFingerActive('left-middle')}
            colorClass={FINGER_COLORS['left-middle'].bgDark}
            activeColorClass="bg-sky-500 shadow-lg shadow-sky-500/50 scale-105"
            dotColor={FINGER_COLORS['left-middle'].dotColor}
          />
          {/* Left Index */}
          <FingerBar
            label="Index"
            height="h-13"
            isActive={isFingerActive('left-index')}
            colorClass={FINGER_COLORS['left-index'].bgDark}
            activeColorClass="bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-105"
            dotColor={FINGER_COLORS['left-index'].dotColor}
          />
          {/* Left Thumb */}
          <FingerBar
            label="Thumb"
            height="h-8 w-4"
            isActive={isFingerActive('thumb')}
            colorClass={FINGER_COLORS['thumb'].bgDark}
            activeColorClass="bg-purple-500 shadow-lg shadow-purple-500/50 scale-105"
            dotColor={FINGER_COLORS['thumb'].dotColor}
          />
        </div>
      </div>

      <div className={`h-12 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

      {/* RIGHT HAND */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Right Hand
        </span>
        <div className="flex items-end gap-1.5 h-16 px-2">
          {/* Right Thumb */}
          <FingerBar
            label="Thumb"
            height="h-8 w-4"
            isActive={isFingerActive('thumb')}
            colorClass={FINGER_COLORS['thumb'].bgDark}
            activeColorClass="bg-purple-500 shadow-lg shadow-purple-500/50 scale-105"
            dotColor={FINGER_COLORS['thumb'].dotColor}
          />
          {/* Right Index */}
          <FingerBar
            label="Index"
            height="h-13"
            isActive={isFingerActive('right-index')}
            colorClass={FINGER_COLORS['right-index'].bgDark}
            activeColorClass="bg-amber-500 shadow-lg shadow-amber-500/50 scale-105"
            dotColor={FINGER_COLORS['right-index'].dotColor}
          />
          {/* Right Middle */}
          <FingerBar
            label="Middle"
            height="h-15"
            isActive={isFingerActive('right-middle')}
            colorClass={FINGER_COLORS['right-middle'].bgDark}
            activeColorClass="bg-cyan-500 shadow-lg shadow-cyan-500/50 scale-105"
            dotColor={FINGER_COLORS['right-middle'].dotColor}
          />
          {/* Right Ring */}
          <FingerBar
            label="Ring"
            height="h-13"
            isActive={isFingerActive('right-ring')}
            colorClass={FINGER_COLORS['right-ring'].bgDark}
            activeColorClass="bg-teal-500 shadow-lg shadow-teal-500/50 scale-105"
            dotColor={FINGER_COLORS['right-ring'].dotColor}
          />
          {/* Right Pinky */}
          <FingerBar
            label="Pinky"
            height="h-10"
            isActive={isFingerActive('right-pinky')}
            colorClass={FINGER_COLORS['right-pinky'].bgDark}
            activeColorClass="bg-rose-500 shadow-lg shadow-rose-500/50 scale-105"
            dotColor={FINGER_COLORS['right-pinky'].dotColor}
          />
        </div>
      </div>
    </div>
  );
};

interface FingerBarProps {
  label: string;
  height: string;
  isActive: boolean;
  colorClass: string;
  activeColorClass: string;
  dotColor: string;
}

const FingerBar: React.FC<FingerBarProps> = ({
  label,
  height,
  isActive,
  activeColorClass,
  dotColor,
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        title={label}
        className={`w-3.5 rounded-full transition-all duration-150 ${height} ${
          isActive
            ? `${activeColorClass} ring-2 ring-white/80`
            : 'bg-slate-700/50 dark:bg-slate-800 hover:bg-slate-700'
        }`}
        style={isActive ? { backgroundColor: dotColor } : undefined}
      />
      <span className={`text-[9px] font-medium leading-none ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
        {label[0]}
      </span>
    </div>
  );
};
