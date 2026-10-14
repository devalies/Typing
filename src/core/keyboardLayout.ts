import { FingerName, HandName, KeyDefinition } from '../types';

/**
 * Standard US QWERTY physical keyboard matrix.
 * Accurately maps each keycap, finger zone assignment, and shift characters.
 */

export const KEYBOARD_ROWS: KeyDefinition[][] = [
  // Row 1: Numbers & Symbols
  [
    { code: 'Backquote', primaryChar: '`', shiftChar: '~', finger: 'left-pinky', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'Digit1', primaryChar: '1', shiftChar: '!', finger: 'left-pinky', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'Digit2', primaryChar: '2', shiftChar: '@', finger: 'left-ring', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'Digit3', primaryChar: '3', shiftChar: '#', finger: 'left-middle', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'Digit4', primaryChar: '4', shiftChar: '$', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'Digit5', primaryChar: '5', shiftChar: '%', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'Digit6', primaryChar: '6', shiftChar: '^', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Digit7', primaryChar: '7', shiftChar: '&', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Digit8', primaryChar: '8', shiftChar: '*', finger: 'right-middle', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Digit9', primaryChar: '9', shiftChar: '(', finger: 'right-ring', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Digit0', primaryChar: '0', shiftChar: ')', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Minus', primaryChar: '-', shiftChar: '_', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Equal', primaryChar: '=', shiftChar: '+', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Backspace', primaryChar: 'Backspace', finger: 'right-pinky', hand: 'right', width: 'w-16 md:w-20', isSpecial: true },
  ],
  // Row 2: Top Row (QWERTY)
  [
    { code: 'Tab', primaryChar: 'Tab', finger: 'left-pinky', hand: 'left', width: 'w-14 md:w-16', isSpecial: true },
    { code: 'KeyQ', primaryChar: 'q', shiftChar: 'Q', finger: 'left-pinky', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyW', primaryChar: 'w', shiftChar: 'W', finger: 'left-ring', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyE', primaryChar: 'e', shiftChar: 'E', finger: 'left-middle', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyR', primaryChar: 'r', shiftChar: 'R', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyT', primaryChar: 't', shiftChar: 'T', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyY', primaryChar: 'y', shiftChar: 'Y', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyU', primaryChar: 'u', shiftChar: 'U', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyI', primaryChar: 'i', shiftChar: 'I', finger: 'right-middle', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyO', primaryChar: 'o', shiftChar: 'O', finger: 'right-ring', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyP', primaryChar: 'p', shiftChar: 'P', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'BracketLeft', primaryChar: '[', shiftChar: '{', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'BracketRight', primaryChar: ']', shiftChar: '}', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Backslash', primaryChar: '\\', shiftChar: '|', finger: 'right-pinky', hand: 'right', width: 'w-12 md:w-16' },
  ],
  // Row 3: Home Row (ASDF...)
  [
    { code: 'CapsLock', primaryChar: 'Caps', finger: 'left-pinky', hand: 'left', width: 'w-16 md:w-20', isSpecial: true },
    { code: 'KeyA', primaryChar: 'a', shiftChar: 'A', finger: 'left-pinky', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyS', primaryChar: 's', shiftChar: 'S', finger: 'left-ring', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyD', primaryChar: 'd', shiftChar: 'D', finger: 'left-middle', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyF', primaryChar: 'f', shiftChar: 'F', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyG', primaryChar: 'g', shiftChar: 'G', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyH', primaryChar: 'h', shiftChar: 'H', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyJ', primaryChar: 'j', shiftChar: 'J', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyK', primaryChar: 'k', shiftChar: 'K', finger: 'right-middle', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyL', primaryChar: 'l', shiftChar: 'L', finger: 'right-ring', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Semicolon', primaryChar: ';', shiftChar: ':', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Quote', primaryChar: "'", shiftChar: '"', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Enter', primaryChar: 'Enter', finger: 'right-pinky', hand: 'right', width: 'w-18 md:w-24', isSpecial: true },
  ],
  // Row 4: Bottom Row (ZXCV...)
  [
    { code: 'ShiftLeft', primaryChar: 'Shift', finger: 'left-pinky', hand: 'left', width: 'w-20 md:w-24', isSpecial: true },
    { code: 'KeyZ', primaryChar: 'z', shiftChar: 'Z', finger: 'left-pinky', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyX', primaryChar: 'x', shiftChar: 'X', finger: 'left-ring', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyC', primaryChar: 'c', shiftChar: 'C', finger: 'left-middle', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyV', primaryChar: 'v', shiftChar: 'V', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyB', primaryChar: 'b', shiftChar: 'B', finger: 'left-index', hand: 'left', width: 'w-10 md:w-12' },
    { code: 'KeyN', primaryChar: 'n', shiftChar: 'N', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'KeyM', primaryChar: 'm', shiftChar: 'M', finger: 'right-index', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Comma', primaryChar: ',', shiftChar: '<', finger: 'right-middle', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Period', primaryChar: '.', shiftChar: '>', finger: 'right-ring', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'Slash', primaryChar: '/', shiftChar: '?', finger: 'right-pinky', hand: 'right', width: 'w-10 md:w-12' },
    { code: 'ShiftRight', primaryChar: 'Shift', finger: 'right-pinky', hand: 'right', width: 'w-22 md:w-28', isSpecial: true },
  ],
  // Row 5: Space & Modifiers
  [
    { code: 'ControlLeft', primaryChar: 'Ctrl', finger: 'left-pinky', hand: 'left', width: 'w-14 md:w-16', isSpecial: true },
    { code: 'AltLeft', primaryChar: 'Alt', finger: 'thumb', hand: 'left', width: 'w-12 md:w-14', isSpecial: true },
    { code: 'Space', primaryChar: ' ', finger: 'thumb', hand: 'both', width: 'flex-1 min-w-[200px]', isSpecial: true },
    { code: 'AltRight', primaryChar: 'Alt', finger: 'thumb', hand: 'right', width: 'w-12 md:w-14', isSpecial: true },
    { code: 'ControlRight', primaryChar: 'Ctrl', finger: 'right-pinky', hand: 'right', width: 'w-14 md:w-16', isSpecial: true },
  ],
];

/**
 * Finger color configurations (Tailwind classes)
 */
export const FINGER_COLORS: Record<FingerName, {
  name: string;
  badge: string;
  borderDark: string;
  borderLight: string;
  bgDark: string;
  bgLight: string;
  textDark: string;
  textLight: string;
  dotColor: string;
}> = {
  'left-pinky': {
    name: 'Left Pinky',
    badge: 'Pinky',
    borderDark: 'border-pink-500/40',
    borderLight: 'border-pink-300',
    bgDark: 'bg-pink-950/20 hover:bg-pink-900/30',
    bgLight: 'bg-pink-50 hover:bg-pink-100',
    textDark: 'text-pink-300',
    textLight: 'text-pink-700',
    dotColor: '#ec4899',
  },
  'left-ring': {
    name: 'Left Ring',
    badge: 'Ring',
    borderDark: 'border-indigo-500/40',
    borderLight: 'border-indigo-300',
    bgDark: 'bg-indigo-950/20 hover:bg-indigo-900/30',
    bgLight: 'bg-indigo-50 hover:bg-indigo-100',
    textDark: 'text-indigo-300',
    textLight: 'text-indigo-700',
    dotColor: '#6366f1',
  },
  'left-middle': {
    name: 'Left Middle',
    badge: 'Middle',
    borderDark: 'border-sky-500/40',
    borderLight: 'border-sky-300',
    bgDark: 'bg-sky-950/20 hover:bg-sky-900/30',
    bgLight: 'bg-sky-50 hover:bg-sky-100',
    textDark: 'text-sky-300',
    textLight: 'text-sky-700',
    dotColor: '#0ea5e9',
  },
  'left-index': {
    name: 'Left Index',
    badge: 'Index',
    borderDark: 'border-emerald-500/40',
    borderLight: 'border-emerald-300',
    bgDark: 'bg-emerald-950/20 hover:bg-emerald-900/30',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100',
    textDark: 'text-emerald-300',
    textLight: 'text-emerald-700',
    dotColor: '#10b981',
  },
  'thumb': {
    name: 'Thumbs',
    badge: 'Thumb',
    borderDark: 'border-purple-500/40',
    borderLight: 'border-purple-300',
    bgDark: 'bg-purple-950/20 hover:bg-purple-900/30',
    bgLight: 'bg-purple-50 hover:bg-purple-100',
    textDark: 'text-purple-300',
    textLight: 'text-purple-700',
    dotColor: '#a855f7',
  },
  'right-index': {
    name: 'Right Index',
    badge: 'Index',
    borderDark: 'border-amber-500/40',
    borderLight: 'border-amber-300',
    bgDark: 'bg-amber-950/20 hover:bg-amber-900/30',
    bgLight: 'bg-amber-50 hover:bg-amber-100',
    textDark: 'text-amber-300',
    textLight: 'text-amber-700',
    dotColor: '#f59e0b',
  },
  'right-middle': {
    name: 'Right Middle',
    badge: 'Middle',
    borderDark: 'border-cyan-500/40',
    borderLight: 'border-cyan-300',
    bgDark: 'bg-cyan-950/20 hover:bg-cyan-900/30',
    bgLight: 'bg-cyan-50 hover:bg-cyan-100',
    textDark: 'text-cyan-300',
    textLight: 'text-cyan-700',
    dotColor: '#06b6d4',
  },
  'right-ring': {
    name: 'Right Ring',
    badge: 'Ring',
    borderDark: 'border-teal-500/40',
    borderLight: 'border-teal-300',
    bgDark: 'bg-teal-950/20 hover:bg-teal-900/30',
    bgLight: 'bg-teal-50 hover:bg-teal-100',
    textDark: 'text-teal-300',
    textLight: 'text-teal-700',
    dotColor: '#14b8a6',
  },
  'right-pinky': {
    name: 'Right Pinky',
    badge: 'Pinky',
    borderDark: 'border-rose-500/40',
    borderLight: 'border-rose-300',
    bgDark: 'bg-rose-950/20 hover:bg-rose-900/30',
    bgLight: 'bg-rose-50 hover:bg-rose-100',
    textDark: 'text-rose-300',
    textLight: 'text-rose-700',
    dotColor: '#f43f5e',
  },
};

/**
 * Map character to key info
 */
export interface CharKeyInfo {
  code: string;
  requiresShift: boolean;
  shiftKeyToUse?: 'ShiftLeft' | 'ShiftRight';
  finger: FingerName;
  hand: HandName;
  displayChar: string;
}

const CHAR_TO_KEY_CACHE = new Map<string, CharKeyInfo>();

// Build fast lookup cache
for (const row of KEYBOARD_ROWS) {
  for (const key of row) {
    if (key.code === 'Space') {
      CHAR_TO_KEY_CACHE.set(' ', {
        code: 'Space',
        requiresShift: false,
        finger: 'thumb',
        hand: 'both',
        displayChar: 'Space',
      });
      continue;
    }

    if (key.primaryChar && !key.isSpecial) {
      CHAR_TO_KEY_CACHE.set(key.primaryChar.toLowerCase(), {
        code: key.code,
        requiresShift: false,
        finger: key.finger,
        hand: key.hand,
        displayChar: key.primaryChar,
      });

      // If uppercase variant exists
      if (key.shiftChar) {
        // Uppercase or shifted symbol
        // If typed by right hand, use left shift; if left hand, use right shift
        const shiftKey = key.hand === 'left' ? 'ShiftRight' : 'ShiftLeft';
        CHAR_TO_KEY_CACHE.set(key.shiftChar, {
          code: key.code,
          requiresShift: true,
          shiftKeyToUse: shiftKey,
          finger: key.finger,
          hand: key.hand,
          displayChar: key.shiftChar,
        });
      }
    }
  }
}

// Ensure Enter and Tab are accessible
CHAR_TO_KEY_CACHE.set('\n', {
  code: 'Enter',
  requiresShift: false,
  finger: 'right-pinky',
  hand: 'right',
  displayChar: '↵',
});

CHAR_TO_KEY_CACHE.set('\t', {
  code: 'Tab',
  requiresShift: false,
  finger: 'left-pinky',
  hand: 'left',
  displayChar: 'Tab',
});

/**
 * Lookup key info for a given character
 */
export function getKeyInfoForChar(char: string): CharKeyInfo | null {
  if (!char) return null;
  const direct = CHAR_TO_KEY_CACHE.get(char);
  if (direct) return direct;

  const lower = char.toLowerCase();
  const lowerInfo = CHAR_TO_KEY_CACHE.get(lower);
  if (lowerInfo) {
    const isUpper = char !== lower;
    return {
      ...lowerInfo,
      requiresShift: isUpper,
      shiftKeyToUse: lowerInfo.hand === 'left' ? 'ShiftRight' : 'ShiftLeft',
      displayChar: char,
    };
  }

  return null;
}
