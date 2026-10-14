# KeyCraft: Pro Typing Practice & Speed Test Suite

A comprehensive, production-grade typing tutor and speed test application designed to dramatically elevate typing speed, finger ergonomics, muscle memory, and keyboard mastery through strict/relaxed guided drills, timed sprints, passage tests, dynamic weak-key remediation, and mechanical sound feedback.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed and will guide the build:

- **Confirmed Aesthetic & Audio Style**: Modern mechanical aesthetic (deep slate/graphite chassis, subtle key shadows, tactile feedback styling) accompanied by subtle mechanical switch sound synthesis using the Web Audio API with an instant mute toggle.
- **Confirmed Keyboard Guidance**: Full US QWERTY virtual keyboard featuring color-coded finger zones (Index, Middle, Ring, Pinky, Thumb) and anatomical left/right hand position diagrams highlighting active fingers in real time.
- **Confirmed Test Content Balance**: Dual test selection supporting both timed rapid word sprints (15s, 30s, 60s, 120s with top 200/1000 common words) and real-world multi-paragraph articles (literature, technology essays, programming syntax, and punctuation drills).
- **Default Storage & Architecture**: Single-user client-side persistence using robust, schema-validated `localStorage` with automated migration, export/import JSON capability, and zero external backend credentials required.

---

## 1. Overview & Core Concept

### What It Does
KeyCraft is an end-to-end interactive typing platform featuring:
1. **Guided Typing Practice Engine**: An event-driven state machine (`idle`, `running`, `paused`, `completed`, `error-recovery`) validating character inputs against target sequences. Supports strict mode (incorrect keys block progress and flag errors) and relaxed mode, target key highlighting, finger placement guidance, backspace controls, and repetition defense.
2. **Interactive Virtual Keyboard & Heatmap**: A complete physical QWERTY representation with finger zones, live keypress animations, Shift combination handling, and a historical error/speed heatmap distinguishing strong, average, weak, and unpracticed keys.
3. **Typing Speed Test Engine**: Accurate timestamp-based timer resilient to background tab throttling, live gross/net WPM counters, character-level accuracy tracking, and error-recovery correction handling.
4. **Weak-Key Remediation & Recommendation System**: Continuous tracking of per-key error rates, attempts, and response latencies against baseline, automatically recommending targeted drills for underperforming keys.
5. **Multi-Lesson Curriculum**: Structured progression through Home Row, Top Row, Bottom Row, Number Row, Symbols, Alternating Hands, Common N-grams, Real Sentences, and Custom Passage builder.
6. **Analytics & Performance Dashboard**: Daily practice logs, streak calculations, gross vs. net WPM distributions, accuracy charts, and exportable history.

### Target Audience & Persona
- Learners developing proper touch-typing technique from scratch without looking down at the keyboard.
- Programmers, writers, and knowledge workers seeking to surpass 80–120+ WPM with high accuracy.
- Individuals targeting specific chronic typo keys (e.g., `b`, `p`, `q`, numbers, or punctuation).

### Key Value
Unlike basic typing tests that only score speed after the fact, KeyCraft actively diagnoses motor-control bottlenecks, enforces proper finger allocation, and generates targeted remediation exercises.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Guided Practice Flow**:
   - Learner selects a lesson (e.g., "Home Row Basics: F & J").
   - Target character `F` is highlighted with an active pulse; the Left Index finger indicator illuminates.
   - User strikes physical `F`: instant subtle click sound triggers, progress bar moves, next target character activates.
   - If user strikes incorrect key `J`: key flashes coral error, target stays on `F`, mistake count increments, and recovery guidance appears without skipping characters.
   - Upon sequence completion, summary card appears with accuracy, net speed, mistake breakdown, and a "Next Drill" recommendation.
2. **Speed Test Flow**:
   - User selects mode (15s, 30s, 60s, 120s, or Custom Duration; Word Sprint vs. Multi-Paragraph Article).
   - Typing viewport displays clean typography with clear cursor positioning.
   - Timer begins on the very first valid keypress (no premature countdown drift).
   - Live net WPM, gross WPM, and accuracy update smoothly.
   - On completion, results modal highlights Net WPM, Gross WPM, Accuracy, Corrected Mistakes, Uncorrected Errors, and Key-by-Key breakdown with Retry and Share/Export options.
3. **Weak-Key Practice Flow**:
   - Dashboard flags weak keys with low mastery score (e.g., `P` and `R`).
   - One-click "Practice Weak Keys" synthesizes a custom drill focusing on those specific characters interspersed with high-frequency vowels and anchors.

### Visual Identity & Theme
- **Aesthetic Direction**: Modern Mechanical & Utilitarian Precision. Tactile keycaps with subtle inset bevels, clean typography, zero AI-slop gradients or fake badges.
- **Color Palette (60-30-10 Rule)**:
  - *Canvas (60%)*: Dark slate (`#0B0F17`) / Light mode off-white (`#F8FAFC`).
  - *Structural Surfaces (30%)*: Deep mechanical slate (`#131B2E` / `#E2E8F0`), hairline keycap borders (`#1E293B` / `#CBD5E1`), subtle keycap shadows (`box-shadow: 0 3px 0 rgba(0,0,0,0.3)`).
  - *Finger Zone Accents (Subtle pastel tinting)*:
    - Pinky: Indigo (`#6366F1`)
    - Ring: Sky (`#0EA5E9`)
    - Middle: Emerald (`#10B981`)
    - Index: Amber (`#F59E0B`)
    - Thumb: Slate/Violet (`#8B5CF6`)
  - *Functional State Accents (10%)*:
    - Target Key: Vibrant Cyan / Electric Blue (`#38BDF8`)
    - Correct Keypress: Clean Emerald (`#22C55E`)
    - Incorrect Keypress: Coral Red (`#EF4444`)
- **Typography**:
  - Display & Headlines: `Plus Jakarta Sans` / `Outfit` (clean geometric weight).
  - Practice & Passage Viewport: High-legibility monospace with tabular figures (`JetBrains Mono`, `IBM Plex Mono`, `tabular-nums`) with generous letter-spacing (`tracking-wide`) and line-height.
  - Controls & Prose: `DM Sans` / `Plus Jakarta Sans`.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Target-Key Validation State Machine
- **Chosen Approach**: Pure deterministic finite-state machine (FSM) implemented in TypeScript (`idle` -> `running` -> `paused` -> `completed` / `error-recovery`).
- **Validation**: Strict mode requires the exact character match to advance index `pos -> pos + 1`. Wrong keypress updates per-key attempt stats and triggers visual error animation, but NEVER skips the character or double-increments.
- **Why**: Eliminates race conditions, duplicate event handling, and silent character skipping.

### Decision 2: Reliable Timer Source for Speed Tests
- **Chosen Approach**: Absolute timestamp delta (`performance.now()` / `Date.now()`) comparing elapsed time against target duration on animation frame intervals, rather than counting `setInterval` ticks.
- **Why**: `setInterval` drifts significantly when browser tabs lose focus or experience UI thread load. Timestamp deltas ensure accurate elapsed seconds and correct WPM even if tab throttling occurs.

### Decision 3: Documented Standard Metrics Calculations
- **Gross WPM**: `(Total Characters Typed / 5) / (Elapsed Time in Minutes)`
- **Net WPM**: `Math.max(0, Gross WPM - (Uncorrected Errors / Elapsed Time in Minutes))`
- **Accuracy**:
  - *Guided Practice*: `(Correct Keystrokes / Total Keystroke Attempts) * 100`
  - *Passage Test*: `(Correctly Typed Characters / Total Evaluated Characters) * 100`
- **Zero-Guard**: All divisions guard against `elapsedMinutes <= 0` or `totalAttempts === 0`, ensuring no `NaN`, `Infinity`, or negative values.

### Decision 4: Synthesized Mechanical Audio Engine
- **Chosen Approach**: Web Audio API oscillator/buffer synthesis providing realistic mechanical switch clicks (down-click and up-click release) without requiring heavy external MP3 audio asset downloads.
- **Why**: Zero external network dependencies, instantaneous latency (<5ms), works offline, and includes global mute toggle.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KeyCraft App Architecture                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     Guided Practice       │                   │     Speed Test Suite      │
│  - TypingEngine (FSM)     │                   │  - PassageEngine          │
│  - Target character check │                   │  - Timestamp Timer        │
│  - Finger zone mapping    │                   │  - Live WPM & Accuracy    │
└─────────────┬─────────────┘                   └─────────────┬─────────────┘
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        Virtual Keyboard Subsystem                         │
│  - Full QWERTY 5-Row Matrix (Numbers, Home, Top, Bottom, Modifiers)       │
│  - Finger zone color coding (Left/Right Hand guidance)                    │
│  - Dynamic heatmap overlays (Error rate, Response time, Mastery level)    │
│  - Shift / Symbol modifier detection & visual state sync                  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│   Weak-Key & Analytics    │                   │      Audio Synthesizer    │
│  - Per-key attempts & RT  │                   │  - Web Audio API clicks   │
│  - Mastery score formula  │                   │  - Mechanical profiles    │
│  - Custom drill generator │                   │  - Instant mute toggle    │
└─────────────┬─────────────┘                   └───────────────────────────┘
              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     Persistence Layer (LocalStorage)                      │
│  - User settings & preferences (theme, audio, strictness, layouts)        │
│  - Completed lesson records & test results history                        │
│  - Aggregate per-key matrix & streak tracking                             │
└───────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
- `src/App.tsx`: Navigation bar, top-level tab switcher (Dashboard, Guided Practice, Speed Test, Lessons, Weak Keys, Analytics, Settings), and theme provider.
- `src/components/Navbar.tsx`: Strict 3-zone Top Bar Contract (Wordmark, Nav Links, Sound/Theme toggles & Quick Action).
- `src/components/VirtualKeyboard.tsx`: Realistic mechanical keyboard component with finger zones, active key states, hands diagram, and heatmap view toggle.
- `src/components/HandGuides.tsx`: Anatomical visual guide showing Left and Right hands with the active finger highlighted.
- `src/components/GuidedPracticeView.tsx`: Character-by-character guided engine with target indicator, live stats, error recovery, and lesson controls.
- `src/components/SpeedTestView.tsx`: Timed passage test with rich text display, live WPM, backspace options, and completion results modal.
- `src/components/DashboardView.tsx`: Metric summary cards, weak/strong key matrix, practice streaks, and quick start recommendations.
- `src/components/LessonListView.tsx`: Structured curriculum grouped by skill tiers (Beginner to Advanced).
- `src/components/WeakKeyView.tsx`: In-depth key analyzer and adaptive drill generator.
- `src/components/AnalyticsView.tsx`: Detailed charts, history log, and CSV/JSON data export.
- `src/components/SettingsView.tsx`: Complete customization (strict mode, backspace rules, sounds, themes, keyboard visual hints).

### Key Modules & Pure Engines
- `src/core/typingEngine.ts`: FSM validation engine for guided practice.
- `src/core/metrics.ts`: Standardized Net WPM, Gross WPM, Accuracy, CPM calculations.
- `src/core/soundEngine.ts`: Web Audio API mechanical switch synthesizer.
- `src/core/storage.ts`: Resilient local storage with schema validation and fallback defaults.
- `src/core/keyboardLayout.ts`: Complete physical key definitions, finger zone assignments, and Shift symbol mappings.
- `src/core/recommendations.ts`: Data-driven weak-key detection and dynamic exercise sequence generator.
- `src/data/lessons.ts`: Curated lessons from Home Row basics to professional passages and code syntax.

---

## 5. Automated Verification & Test Plan

1. **Unit Tests (`src/tests/`)**:
   - `typingEngine.test.ts`: Verify FSM transitions, strict character matching, error resilience, repeated key behavior, and pause/resume logic.
   - `metrics.test.ts`: Verify Gross/Net WPM, accuracy, zero-time edge cases, uncorrected error penalties, and empty inputs.
   - `recommendations.test.ts`: Verify weak-key threshold logic, unpracticed key handling, and drill generation.
   - `storage.test.ts`: Verify corrupted record handling, migrations, and defaults.
2. **End-to-End Build & Compilation**:
   - `npm run build` / `compile_applet` to guarantee clean TypeScript types and zero production bundle issues.
