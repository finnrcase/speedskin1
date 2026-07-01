"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDevice } from "@/lib/device/DeviceProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Brand } from "./Brand";
import { NAV_ITEMS, isActive } from "./nav-items";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { info } = useDevice();
  const { profile, signOut } = useAuth();
  const DeviceIcon = info.Icon;
  const navItems = NAV_ITEMS.filter(
    (item) => !item.roles || (profile?.role && item.roles.includes(profile.role)),
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile/tablet top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft no-select"
        >
          <DeviceIcon className="size-4" strokeWidth={1.8} aria-hidden />
          {info.label}
        </Link>
      </header>

      {/* Desktop / Chromebook sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Brand className="px-2" />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-button px-3 py-3 text-sm font-semibold transition-colors no-select",
                  active
                    ? "bg-brand-tint text-brand-dark"
                    : "text-ink-soft hover:bg-cream hover:text-ink",
                )}
              >
                <item.Icon className="size-5" strokeWidth={1.8} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {profile && (
          <div className="rounded-button border border-line bg-white px-3 py-3 text-sm">
            <p className="truncate font-semibold text-ink">{profile.fullName}</p>
            <p className="mt-0.5 text-xs capitalize text-ink-faint">
              {profile.role}
            </p>
          </div>
        )}
        <Link
          href="/settings"
          className="mt-4 flex items-center gap-3 rounded-button border border-line bg-white px-3 py-3 text-sm no-select"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-surface-muted text-ink-soft" aria-hidden>
            <DeviceIcon className="size-[18px]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-ink">{info.label}</span>
            <span className="block truncate text-xs text-ink-faint">Device</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-2 flex items-center gap-3 rounded-button px-3 py-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-cream hover:text-ink no-select"
        >
          <LogOut className="size-5" strokeWidth={1.8} aria-hidden />
          Log out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile/tablet bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold no-select",
                active ? "text-brand" : "text-ink-faint",
              )}
            >
              <item.Icon className="size-5" strokeWidth={1.8} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
