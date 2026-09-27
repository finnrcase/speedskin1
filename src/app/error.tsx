"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("SpeedSkin route rendering failed.", error);
    }
  }, [error]);

  return (
    <Card className="mx-auto max-w-xl space-y-4 text-center" role="alert">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand-dark">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          This page couldnâ€™t load
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Your SpeedSkin workspace is still available. Try loading this page
          again.
        </p>
      </div>
      <Button type="button" onClick={retry}>
        Retry
      </Button>
    </Card>
  );
}
