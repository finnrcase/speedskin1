import {
  BookOpenText,
  CalendarCheck,
  CircleDollarSign,
  Keyboard,
  Laptop,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AcademyId } from "@/lib/data/types";

const ICONS: Record<AcademyId, LucideIcon> = {
  keyboard: Keyboard,
  language: BookOpenText,
  chromebook: Laptop,
  digital: ShieldCheck,
  communication: MessageSquareText,
  people: UsersRound,
  money: CircleDollarSign,
  life: CalendarCheck,
};

export function AcademyIcon({ academy, className = "size-6" }: { academy: AcademyId; className?: string }) {
  const Icon = ICONS[academy];
  return <Icon className={className} strokeWidth={1.8} aria-hidden />;
}

