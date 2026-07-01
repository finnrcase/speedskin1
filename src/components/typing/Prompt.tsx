import { cn } from "@/lib/utils";
import type { CharState } from "@/lib/typing/metrics";

interface PromptProps {
  target: string;
  charStates: CharState[];
  size?: "compact" | "large";
}

const STATE_CLASS: Record<CharState, string> = {
  pending: "text-ink-faint",
  correct: "text-ink",
  current:
    "rounded bg-brand-light text-brand-dark underline decoration-brand decoration-2 underline-offset-4",
  incorrect: "rounded bg-danger-light text-danger",
};

/**
 * Renders the prompt character by character with per-character state. Uses
 * `whitespace-pre-wrap` so spaces and indentation are preserved (needed for
 * multi-line Python snippets); newlines render a faint return marker plus a real
 * line break.
 */
export function Prompt({ target, charStates, size = "large" }: PromptProps) {
  return (
    <p
      className={cn(
        "select-none whitespace-pre-wrap break-words font-mono leading-relaxed",
        size === "compact" ? "text-xl" : "text-2xl sm:text-3xl",
      )}
      aria-label="Typing prompt"
    >
      {Array.from(target).map((char, i) => {
        const state = charStates[i] ?? "pending";
        if (char === "\n") {
          return (
            <span key={i}>
              <span className={cn("rounded-sm opacity-70", STATE_CLASS[state])}>
                ↵
              </span>
              {"\n"}
            </span>
          );
        }
        return (
          <span key={i} className={cn("rounded-sm", STATE_CLASS[state])}>
            {char}
          </span>
        );
      })}
    </p>
  );
}
