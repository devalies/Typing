import React, { useState } from 'react';
import { BookOpen, Star, Play, CheckCircle2 } from 'lucide-react';
import { Lesson, LessonCategory, DifficultyLevel, LessonProgress, UserSettings } from '../types';
import { CURRICULUM_LESSONS } from '../data/lessons';

interface LessonListViewProps {
  settings: UserSettings;
  lessonProgressMap: Record<string, LessonProgress>;
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonListView: React.FC<LessonListViewProps> = ({
  settings,
  lessonProgressMap,
  onSelectLesson,
}) => {
  const isDark = settings.theme === 'dark';
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | DifficultyLevel>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | LessonCategory>('all');

  // Filter lessons
  const filteredLessons = CURRICULUM_LESSONS.filter((l) => {
    if (selectedDifficulty !== 'all' && l.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
    return true;
  });

  const categories: { key: 'all' | LessonCategory; label: string }[] = [
    { key: 'all', label: 'All Lessons' },
    { key: 'home-row', label: 'Home Row' },
    { key: 'top-row', label: 'Top Row' },
    { key: 'bottom-row', label: 'Bottom Row' },
    { key: 'shift-keys', label: 'Shift & Caps' },
    { key: 'numbers', label: 'Numbers' },
    { key: 'code', label: 'Code & Symbols' },
    { key: 'sentences', label: 'Sentences' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Structured Touch Typing Curriculum</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress systematically from basic tactile home row anchors to high-velocity sentences and developer syntax.
            </p>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/40 rounded-lg border border-slate-800">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY FILTER BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors border ${
              selectedCategory === cat.key
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                : isDark
                ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* LESSON CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => {
          const progress = lessonProgressMap[lesson.id];
          const isCompleted = !!progress;

          return (
            <div
              key={lesson.id}
              className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all hover:border-slate-600 ${
                isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="uppercase font-semibold tracking-wider text-cyan-400">{lesson.category}</span>
                    <span className="text-slate-500">·</span>
                    <span className="capitalize text-slate-400">{lesson.difficulty}</span>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          fill={star <= (progress?.stars || 1) ? 'currentColor' : 'none'}
                          className={star <= (progress?.stars || 1) ? 'text-amber-400' : 'text-slate-700'}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold tracking-tight">{lesson.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lesson.description}</p>

                {/* Focus Keys Badges */}
                <div className="flex flex-wrap items-center gap-1 mt-3">
                  <span className="text-[11px] text-slate-500 mr-1">Focus Keys:</span>
                  {lesson.focusKeys.slice(0, 8).map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[11px] font-mono font-semibold"
                    >
                      {k === ' ' ? 'Space' : k}
                    </kbd>
                  ))}
                  {lesson.focusKeys.length > 8 && (
                    <span className="text-[10px] text-slate-500">+{lesson.focusKeys.length - 8}</span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Best: <strong className="text-emerald-400 font-mono">{progress.netWpm} WPM</strong></span>
                    <span>·</span>
                    <span>{progress.accuracy}%</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">
                    Target: {lesson.targetWpm || 25} WPM
                  </div>
                )}

                <button
                  onClick={() => onSelectLesson(lesson)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors shadow-sm shadow-cyan-400/20"
                >
                  <Play size={12} fill="currentColor" />
                  <span>{isCompleted ? 'Practice Again' : 'Start Lesson'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
