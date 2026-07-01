interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl text-sm text-ink-soft">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
