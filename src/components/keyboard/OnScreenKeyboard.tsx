"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  KEYBOARD_ROWS,
  findKeyForChar,
  type KeyDef,
} from "@/lib/typing/keyboard-layout";

interface OnScreenKeyboardProps {
  /** The character the learner should type next. */
  expectedChar: string | null;
  onKey: (char: string) => void;
  onBackspace: () => void;
  size?: "compact" | "large";
  disabled?: boolean;
  /**
   * Blank mode (STEP 2 default): keys show no letters so learners type from
   * memory. The correct key's letter fades in only when `reveal` is true.
   */
  blank?: boolean;
  /** Reveal the correct key (driven by the 4-second stuck timer). */
  reveal?: boolean;
}

export function OnScreenKeyboard({
  expectedChar,
  onKey,
  onBackspace,
  size = "large",
  disabled = false,
  blank = true,
  reveal = false,
}: OnScreenKeyboardProps) {
  const [shift, setShift] = useState(false);
  const match = expectedChar ? findKeyForChar(expectedChar) : null;

  const handle = (key: KeyDef) => {
    if (disabled) return;
    if (key.special === "backspace") {
      onBackspace();
      return;
    }
    if (key.special === "shift") {
      setShift((s) => !s);
      return;
    }
    if (key.special === "space") {
      onKey(" ");
      setShift(false);
      return;
    }
    if (key.special === "enter") {
      onKey("\n");
      setShift(false);
      return;
    }
    const char = shift ? key.upper : key.lower;
    if (char) {
      onKey(char);
      setShift(false);
    }
  };

  const keyHeight = size === "compact" ? "h-10" : "h-12 sm:h-14";
  const keyText = size === "compact" ? "text-sm" : "text-base sm:text-lg";

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl select-none space-y-1.5 rounded-card border border-line bg-surface-muted p-2 sm:p-3",
        disabled && "opacity-50",
      )}
      aria-label="On-screen keyboard"
    >
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((key) => {
            const isExpected = match?.keyId === key.id;
            const revealLetter = isExpected && reveal;
            const shiftHint =
              key.special === "shift" && match?.needsShift && reveal && !shift;
            const shiftActive = key.special === "shift" && shift;
            const highlight = revealLetter || shiftHint;

            // In blank mode a normal key shows its letter only when revealed.
            const showLabel = key.special ? true : !blank || revealLetter;

            return (
              <button
                key={key.id}
                type="button"
                disabled={disabled}
                onClick={() => handle(key)}
                style={{ flexGrow: key.width ?? 1, flexBasis: 0 }}
                aria-label={key.label}
                className={cn(
                  "flex items-center justify-center rounded-lg border font-semibold transition-colors",
                  keyHeight,
                  keyText,
                  highlight
                    ? "border-brand bg-brand text-white shadow-[0_6px_16px_rgba(249,115,22,0.18)] ring-2 ring-brand/25"
                    : shiftActive
                      ? "border-brand bg-brand-light text-brand-dark"
                      : "border-line bg-surface text-ink-soft",
                )}
              >
                {showLabel && (
                  <span
                    className={cn(revealLetter && "animate-fade-in")}
                    aria-hidden={!key.special && blank && !revealLetter}
                  >
                    {key.special === "space" ? "" : key.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
