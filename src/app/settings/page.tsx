"use client";

import { CheckCircle2, LogOut } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useDevice } from "@/lib/device/DeviceProvider";
import { DEVICE_LIST } from "@/lib/device/devices";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SettingsPage() {
  const { device, info, setDevice, ready } = useDevice();
  const { profile, signOut } = useAuth();
  const CurrentDeviceIcon = info.Icon;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Choose your device"
        subtitle="We tune the typing lessons to match how you type. You can change this anytime — it’s saved on this device."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEVICE_LIST.map((d) => {
          const selected = ready && d.id === device;
          const DeviceIcon = d.Icon;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setDevice(d.id)}
              aria-pressed={selected}
              className={cn(
                "rounded-card border bg-surface p-6 text-left transition-all no-select",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                selected
                  ? "border-brand/35 bg-brand-tint shadow-[0_12px_30px_rgba(88,64,38,0.09)] ring-2 ring-brand/10"
                  : "border-line hover:-translate-y-0.5 hover:border-brand/25 hover:bg-cream hover:shadow-[0_10px_24px_rgba(88,64,38,0.07)]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-ink-soft shadow-[0_1px_2px_rgba(88,64,38,0.06)]" aria-hidden>
                  <DeviceIcon className="size-6" strokeWidth={1.8} />
                </span>
                {selected && (
                  <Badge tone="brand" icon={CheckCircle2}>
                    Selected
                  </Badge>
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
                {d.label}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">{d.blurb}</p>
            </button>
          );
        })}
      </div>

      <Card className="warm-panel flex gap-4 border-brand/15">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-dark shadow-[0_8px_18px_rgba(88,64,38,0.08)]" aria-hidden>
          <CurrentDeviceIcon className="size-6" strokeWidth={1.8} />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            How {info.label} lessons work
          </h2>
          <p className="text-sm text-ink-soft">
            {info.showsOnScreenKeyboard
              ? `A ${info.keyboardSize === "compact" ? "compact" : "large"} blank on-screen keyboard appears with no letters, so you learn to type from memory. If you get stuck on a key for a few seconds, the correct key fades in to help.`
              : "Use your physical keyboard for practice — no on-screen keyboard is shown. If you get stuck on a key for a few seconds, we’ll show you which key to press next."}
          </p>
        </div>
      </Card>

      {profile && (
        <Card className="flex flex-col gap-4 border-line bg-white/82 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-ink">{profile.fullName}</p>
            <p className="text-xs capitalize text-ink-faint">
              {profile.email} · {profile.role}
            </p>
          </div>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" strokeWidth={1.8} aria-hidden />
            Log out
          </Button>
        </Card>
      )}
    </div>
  );
}
