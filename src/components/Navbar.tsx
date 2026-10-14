import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Settings } from 'lucide-react';
import { UserSettings } from '../types';

export type NavTab = 'dashboard' | 'practice' | 'test' | 'lessons' | 'weak-keys' | 'analytics' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  currentStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onUpdateSettings,
  currentStreak,
}) => {
  const isDark = settings.theme === 'dark';

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleTheme = () => {
    onUpdateSettings({ ...settings, theme: isDark ? 'light' : 'dark' });
  };

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between gap-8 px-4 md:px-8 py-3.5 border-b backdrop-blur-md transition-colors ${
      isDark
        ? 'bg-slate-950/80 border-slate-800/80 text-slate-100'
        : 'bg-white/80 border-slate-200 text-slate-900'
    }`}>
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className="flex items-center gap-2.5 text-lg md:text-xl font-bold tracking-tight whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
      >
        <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono text-sm shadow-sm">
          ⌨
        </span>
        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          KeyCraft
        </span>
      </button>

      {/* Zone 2: 5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onSelectTab('practice')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
            currentTab === 'practice'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Guided Practice
        </button>
        <button
          onClick={() => onSelectTab('test')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
            currentTab === 'test'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Speed Test
        </button>
        <button
          onClick={() => onSelectTab('lessons')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
            currentTab === 'lessons'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Curriculum
        </button>
        <button
          onClick={() => onSelectTab('weak-keys')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
            currentTab === 'weak-keys'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Weak Keys
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
            currentTab === 'analytics'
              ? 'border-cyan-400 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Analytics
        </button>
      </nav>

      {/* Zone 3: 1 primary action with subtle utility toggles */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Streak indicator */}
        {currentStreak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span>🔥</span>
            <span>{currentStreak}d Streak</span>
          </div>
        )}

        {/* Audio Mute Quick Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={settings.soundEnabled ? 'Mute Mechanical Sounds' : 'Unmute Mechanical Sounds'}
          className={`p-2 rounded-lg border transition-colors ${
            settings.soundEnabled
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25'
              : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg border border-slate-700/80 bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          title="App Settings"
          className={`p-2 rounded-lg border transition-colors ${
            currentTab === 'settings'
              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
              : 'border-slate-700/80 bg-slate-800/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={16} />
        </button>

        {/* Primary CTA Action */}
        <button
          type="button"
          onClick={() => onSelectTab(currentTab === 'test' ? 'practice' : 'test')}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-400/20"
        >
          {currentTab === 'test' ? 'Practice Drill' : 'Start Speed Test'}
        </button>
      </div>
    </header>
  );
};
