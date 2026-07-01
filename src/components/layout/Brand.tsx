import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 no-select", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-card bg-brand text-base font-bold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
        S
      </span>
      <span className="text-lg font-bold leading-tight tracking-tight text-ink">
        SpeedSkin
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand">
          Typing Academy
        </span>
      </span>
    </Link>
  );
}
