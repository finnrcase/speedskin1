import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  padded?: boolean;
}

export function Card({
  as: Tag = "div",
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  // Tailwind orders utilities independent of class-string order, so a default
  // `bg-surface` can beat a `bg-*` passed in className. Only apply the default
  // background when the caller hasn't provided one.
  const hasBackground = className?.includes("bg-");
  return (
    <Tag
      className={cn(
        "rounded-card border border-line shadow-[0_1px_2px_rgba(88,64,38,0.05)]",
        "transition-[border-color,box-shadow,transform,background-color] duration-200",
        !hasBackground && "bg-surface",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
