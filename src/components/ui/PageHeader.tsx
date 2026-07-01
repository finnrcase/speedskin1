interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && (
          <p className="inline-flex rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-base text-ink-soft">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
