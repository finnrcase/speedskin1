import {
  BookOpen,
  ClipboardCheck,
  ShieldCheck,
  GraduationCap,
  House,
  Settings,
  ChartNoAxesColumnIncreasing,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/data/types";

export interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", Icon: House, roles: ["student"] },
  { href: "/courses", label: "Learn", Icon: BookOpen, roles: ["student"] },
  {
    href: "/homework",
    label: "Homework",
    Icon: ClipboardCheck,
    roles: ["student"],
  },
  {
    href: "/achievements",
    label: "Progress",
    Icon: ChartNoAxesColumnIncreasing,
    roles: ["student"],
  },
  {
    href: "/teacher",
    label: "Dashboard",
    Icon: GraduationCap,
    roles: ["teacher"],
  },
  { href: "/admin", label: "Admin", Icon: ShieldCheck, roles: ["admin"] },
  { href: "/settings", label: "Profile", Icon: Settings },
];

/** Course paths roll up under the single "Courses" nav item. */
const COURSE_PREFIXES = ["/courses", "/lesson", "/shortcuts"];

/** Whether a nav item should be highlighted for the current pathname. */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/courses") {
    return COURSE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
