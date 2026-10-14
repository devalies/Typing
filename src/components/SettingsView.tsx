import React from 'react';
import {
  Volume2,
  Sliders,
  Keyboard,
  Shield,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { UserSettings, SoundProfile } from '../types';
import { soundEngine } from '../core/soundEngine';
import { DEFAULT_SETTINGS } from '../core/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  const isDark = settings.theme === 'dark';

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);

    if (key === 'soundEnabled') soundEngine.setEnabled(value as boolean);
    if (key === 'soundVolume') soundEngine.setVolume(value as number);
    if (key === 'soundProfile') soundEngine.setProfile(value as SoundProfile);
  };

  const testAudio = () => {
    soundEngine.playKey(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Preferences & Engine Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize tactile audio synthesizers, strict validation rules, and visual ergonomic aids.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all settings to factory defaults?')) {
              onUpdateSettings(DEFAULT_SETTINGS);
              onResetDefaults();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* SECTION 1: AUDIO SYNTHESIZER */}
        <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Volume2 size={18} className="text-cyan-400" />
            <h3 className="font-bold text-sm tracking-tight">Mechanical Audio Feedback</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sound Enable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">Enable Audio Synthesis</div>
                <div className="text-[11px] text-slate-400">Low-latency Web Audio API mechanical switch simulation</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => update('soundEnabled', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Error Sound Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">Mistake Audio Cue</div>
                <div className="text-[11px] text-slate-400">Play subtle acoustic notification on incorrect keystrokes</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundOnMistake}
                onChange={(e) => update('soundOnMistake', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Switch Profile */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold">Switch Acoustic Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {(['mechanical', 'clicky', 'creamy', 'typewriter'] as SoundProfile[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      update('soundProfile', p);
                      soundEngine.setProfile(p);
                      soundEngine.playKey(false);
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs capitalize font-medium transition-colors ${
                      settings.soundProfile === p
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                        : 'border-slate-800 hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {p} Switch
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Synthesizer Volume</span>
                <span className="font-mono text-cyan-400">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.soundVolume}
                onChange={(e) => update('soundVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg"
              />
              <button
                onClick={testAudio}
                className="self-start text-[11px] text-cyan-400 hover:underline pt-1"
              >
                Click to preview audio click
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRACTICE ENGINE RULES */}
        <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield size={18} className="text-cyan-400" />
            <h3 className="font-bold text-sm tracking-tight">Validation & Strict Mode Engine</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strict Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">Strict Target-Key Lock</div>
                <div className="text-[11px] text-slate-400">
                  Target key remains locked until the exact correct key is struck (no silent character skipping).
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.strictMode}
                onChange={(e) => update('strictMode', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Backspace Allow */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">Allow Backspace Corrections</div>
                <div className="text-[11px] text-slate-400">
                  Permits learners to delete mistyped characters in relaxed and passage modes.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowBackspace}
                onChange={(e) => update('allowBackspace', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Default Test Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold">Default Speed Test Duration</label>
              <div className="flex items-center gap-2">
                {[15, 30, 60, 120].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => update('defaultTestDuration', dur)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                      settings.defaultTestDuration === dur
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: VISUAL ERGONOMIC AIDS */}
        <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye size={18} className="text-cyan-400" />
            <h3 className="font-bold text-sm tracking-tight">Ergonomic Visual Guidance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Finger zones */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">Color-Coded Finger Zones</div>
                <div className="text-[11px] text-slate-400">Show subtle color indicators on keycaps for finger touch allocation</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showFingerGuides}
                onChange={(e) => update('showFingerGuides', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Hand Guides */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">Anatomical Hand Diagram</div>
                <div className="text-[11px] text-slate-400">Display hands visualizer highlighting the exact finger to press</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showHands}
                onChange={(e) => update('showHands', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Heatmap Default */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold">Keyboard Heatmap Metric</label>
              <select
                value={settings.keyboardHeatmapMetric}
                onChange={(e) => update('keyboardHeatmapMetric', e.target.value as any)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
              >
                <option value="none">Disabled (Clean Keycaps)</option>
                <option value="mastery">Mastery Score (0 - 100)</option>
                <option value="errorRate">Error Rate Percentage</option>
                <option value="responseTime">Response Time Latency (ms)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
