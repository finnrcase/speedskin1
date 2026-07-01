import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarsProps {
  count: number;
  total?: number;
  className?: string;
}

export function Stars({ count, total = 3, className }: StarsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${count} of ${total} stars`}
    >
      {Array.from({ length: total }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < count ? "text-brand" : "text-ink-faint/40",
          )}
          strokeWidth={1.8}
          aria-hidden
        />
      ))}
    </span>
  );
}
