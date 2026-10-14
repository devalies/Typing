/**
 * KeyCraft: Touch Typing Tutor & Speed Test Suite
 * Production-quality interactive typing tutor with mechanical audio, virtual keyboard, and diagnostics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { GuidedPracticeView } from './components/GuidedPracticeView';
import { SpeedTestView } from './components/SpeedTestView';
import { LessonListView } from './components/LessonListView';
import { WeakKeyView } from './components/WeakKeyView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { Lesson, UserSettings, KeyStats, SpeedTestResult, LessonProgress } from './types';
import { storage, PracticeStreakInfo } from './core/storage';
import { soundEngine } from './core/soundEngine';
import { CURRICULUM_LESSONS } from './data/lessons';
import { generateWeakKeyLesson } from './core/recommendations';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [statsMap, setStatsMap] = useState<Record<string, KeyStats>>(() => storage.getKeyStatsMap());
  const [speedTests, setSpeedTests] = useState<SpeedTestResult[]>(() => storage.getSpeedTestResults());
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>(() => storage.getLessonProgress());
  const [streakInfo, setStreakInfo] = useState<PracticeStreakInfo>(() => storage.getStreakInfo());
  const [activePracticeLesson, setActivePracticeLesson] = useState<Lesson>(CURRICULUM_LESSONS[0]);

  // Sync sound engine with initial settings
  useEffect(() => {
    soundEngine.setEnabled(settings.soundEnabled);
    soundEngine.setVolume(settings.soundVolume);
    soundEngine.setProfile(settings.soundProfile);
  }, [settings]);

  // Theme application to root document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased font-sans';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased font-sans';
    }
  }, [settings.theme]);

  const refreshStorageData = useCallback(() => {
    setStatsMap(storage.getKeyStatsMap());
    setSpeedTests(storage.getSpeedTestResults());
    setLessonProgress(storage.getLessonProgress());
    setStreakInfo(storage.getStreakInfo());
  }, []);

  const handleKeyStatsUpdate = useCallback((newStats: Record<string, KeyStats>) => {
    setStatsMap(newStats);
    setStreakInfo(storage.getStreakInfo());
  }, []);

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActivePracticeLesson(lesson);
    setCurrentTab('practice');
  };

  const handleStartWeakDrill = (keys: string[]) => {
    const drillLesson = generateWeakKeyLesson(keys);
    setActivePracticeLesson(drillLesson);
    setCurrentTab('practice');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Strict Top Bar Contract Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          refreshStorageData();
          setCurrentTab(tab);
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        currentStreak={streakInfo.currentStreak}
      />

      {/* Main Interactive Workspace Area */}
      <main className="flex-1 pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            settings={settings}
            statsMap={statsMap}
            speedTests={speedTests}
            lessonProgress={lessonProgress}
            streakInfo={streakInfo}
            onNavigateToPractice={(lesson) => {
              if (lesson) setActivePracticeLesson(lesson);
              setCurrentTab('practice');
            }}
            onNavigateToSpeedTest={() => setCurrentTab('test')}
            onNavigateToWeakKeys={() => setCurrentTab('weak-keys')}
            onNavigateToLessons={() => setCurrentTab('lessons')}
          />
        )}

        {currentTab === 'practice' && (
          <GuidedPracticeView
            initialLesson={activePracticeLesson}
            settings={settings}
            statsMap={statsMap}
            onKeyStatsUpdate={handleKeyStatsUpdate}
            onNavigateToLessons={() => setCurrentTab('lessons')}
            onStartWeakDrill={handleStartWeakDrill}
          />
        )}

        {currentTab === 'test' && (
          <SpeedTestView
            settings={settings}
            onNavigateToWeakKeys={(keys) => handleStartWeakDrill(keys)}
            onNavigateToAnalytics={() => {
              refreshStorageData();
              setCurrentTab('analytics');
            }}
          />
        )}

        {currentTab === 'lessons' && (
          <LessonListView
            settings={settings}
            lessonProgressMap={lessonProgress}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentTab === 'weak-keys' && (
          <WeakKeyView
            settings={settings}
            statsMap={statsMap}
            onStartLesson={(lesson) => {
              setActivePracticeLesson(lesson);
              setCurrentTab('practice');
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            settings={settings}
            results={speedTests}
            streakInfo={streakInfo}
            onDataReset={() => {
              refreshStorageData();
            }}
            onDataImported={() => {
              setSettings(storage.getSettings());
              refreshStorageData();
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetDefaults={() => {
              handleUpdateSettings(storage.getSettings());
            }}
          />
        )}
      </main>

      {/* Quiet, Human Editorial Footer */}
      <footer className={`border-t py-6 px-4 text-center text-xs transition-colors ${
        settings.theme === 'dark' ? 'border-slate-850 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">KeyCraft</span>
            <span>·</span>
            <span>Touch Typing Tutor & Speed Test Suite</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Client-side persistent storage</span>
            <span>·</span>
            <span>Standard Gross & Net WPM</span>
            <span>·</span>
            <span>Web Audio synthesis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
