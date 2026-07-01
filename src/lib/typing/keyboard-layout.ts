/*
  QWERTY layout data for the on-screen keyboard. Each key knows which finger it
  belongs to (for color-coding) and the characters it produces with/without
  shift, so we can highlight the correct next key for any prompt character.
*/

export type Finger =
  | "l-pinky"
  | "l-ring"
  | "l-middle"
  | "l-index"
  | "r-index"
  | "r-middle"
  | "r-ring"
  | "r-pinky"
  | "thumb";

export interface KeyDef {
  id: string;
  label: string;
  /** Character produced without shift. */
  lower?: string;
  /** Character produced with shift. */
  upper?: string;
  finger: Finger;
  /** Flex weight for special wide keys (shift, space, backspace, enter). */
  width?: number;
  special?: "shift" | "space" | "backspace" | "enter";
}

function k(
  label: string,
  lower: string,
  upper: string,
  finger: Finger,
): KeyDef {
  return { id: lower, label, lower, upper, finger };
}

export const KEYBOARD_ROWS: KeyDef[][] = [
  [
    k("1", "1", "!", "l-pinky"),
    k("2", "2", "@", "l-ring"),
    k("3", "3", "#", "l-middle"),
    k("4", "4", "$", "l-index"),
    k("5", "5", "%", "l-index"),
    k("6", "6", "^", "r-index"),
    k("7", "7", "&", "r-index"),
    k("8", "8", "*", "r-middle"),
    k("9", "9", "(", "r-ring"),
    k("0", "0", ")", "r-pinky"),
    k("-", "-", "_", "r-pinky"),
    k("=", "=", "+", "r-pinky"),
    { id: "backspace", label: "⌫", finger: "r-pinky", width: 1.6, special: "backspace" },
  ],
  [
    k("Q", "q", "Q", "l-pinky"),
    k("W", "w", "W", "l-ring"),
    k("E", "e", "E", "l-middle"),
    k("R", "r", "R", "l-index"),
    k("T", "t", "T", "l-index"),
    k("Y", "y", "Y", "r-index"),
    k("U", "u", "U", "r-index"),
    k("I", "i", "I", "r-middle"),
    k("O", "o", "O", "r-ring"),
    k("P", "p", "P", "r-pinky"),
    k("[", "[", "{", "r-pinky"),
    k("]", "]", "}", "r-pinky"),
  ],
  [
    k("A", "a", "A", "l-pinky"),
    k("S", "s", "S", "l-ring"),
    k("D", "d", "D", "l-middle"),
    k("F", "f", "F", "l-index"),
    k("G", "g", "G", "l-index"),
    k("H", "h", "H", "r-index"),
    k("J", "j", "J", "r-index"),
    k("K", "k", "K", "r-middle"),
    k("L", "l", "L", "r-ring"),
    k(";", ";", ":", "r-pinky"),
    k("'", "'", '"', "r-pinky"),
  ],
  [
    { id: "shift", label: "⇧", finger: "l-pinky", width: 1.6, special: "shift" },
    k("Z", "z", "Z", "l-pinky"),
    k("X", "x", "X", "l-ring"),
    k("C", "c", "C", "l-middle"),
    k("V", "v", "V", "l-index"),
    k("B", "b", "B", "l-index"),
    k("N", "n", "N", "r-index"),
    k("M", "m", "M", "r-index"),
    k(",", ",", "<", "r-middle"),
    k(".", ".", ">", "r-ring"),
    k("/", "/", "?", "r-pinky"),
  ],
  [
    { id: "space", label: "space", lower: " ", finger: "thumb", width: 6, special: "space" },
    { id: "enter", label: "⏎", lower: "\n", finger: "r-pinky", width: 1.6, special: "enter" },
  ],
];

/** Light per-finger tint classes (kept static so Tailwind picks them up). */
export const FINGER_TINT: Record<Finger, string> = {
  "l-pinky": "bg-rose-50 text-rose-700",
  "l-ring": "bg-amber-50 text-amber-700",
  "l-middle": "bg-lime-50 text-lime-700",
  "l-index": "bg-emerald-50 text-emerald-700",
  "r-index": "bg-sky-50 text-sky-700",
  "r-middle": "bg-indigo-50 text-indigo-700",
  "r-ring": "bg-violet-50 text-violet-700",
  "r-pinky": "bg-fuchsia-50 text-fuchsia-700",
  thumb: "bg-stone-100 text-stone-600",
};

export const FINGER_LABEL: Record<Finger, string> = {
  "l-pinky": "left pinky",
  "l-ring": "left ring finger",
  "l-middle": "left middle finger",
  "l-index": "left index finger",
  "r-index": "right index finger",
  "r-middle": "right middle finger",
  "r-ring": "right ring finger",
  "r-pinky": "right pinky",
  thumb: "thumb",
};

export interface KeyMatch {
  keyId: string;
  finger: Finger;
  needsShift: boolean;
}

let cachedIndex: Map<string, KeyMatch> | null = null;

function buildIndex(): Map<string, KeyMatch> {
  const index = new Map<string, KeyMatch>();
  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.lower) {
        index.set(key.lower, {
          keyId: key.id,
          finger: key.finger,
          needsShift: false,
        });
      }
      if (key.upper && key.upper !== key.lower) {
        index.set(key.upper, {
          keyId: key.id,
          finger: key.finger,
          needsShift: true,
        });
      }
    }
  }
  return index;
}

/** Find which key (and whether shift is needed) produces `char`. */
export function findKeyForChar(char: string): KeyMatch | null {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex.get(char) ?? null;
}
