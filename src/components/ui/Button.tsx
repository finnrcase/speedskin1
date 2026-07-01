import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-[0_8px_18px_rgba(249,115,22,0.20)] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 active:bg-brand-dark",
  secondary:
    "border border-brand/20 bg-brand-tint text-brand-dark hover:-translate-y-0.5 hover:bg-brand-light/40",
  outline:
    "border border-line bg-surface text-ink shadow-[0_1px_2px_rgba(88,64,38,0.05)] hover:-translate-y-0.5 hover:bg-cream",
  ghost: "text-ink-soft hover:bg-brand-tint hover:text-brand-dark",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

/** Shared classes so links can be styled identically to buttons. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-semibold",
    "transition-[background-color,color,box-shadow,transform,border-color] focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:cursor-not-allowed disabled:opacity-50 no-select",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
