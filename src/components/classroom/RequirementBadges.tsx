import {
  BarChart3,
  Clock3,
  Code2,
  Command,
  Gauge,
  Layers,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Assignment } from "@/lib/data/types";

interface RequirementBadge {
  label: string;
  Icon: LucideIcon;
}

/** Compact badges summarizing an assignment's requirements. */
export function RequirementBadges({ assignment }: { assignment: Assignment }) {
  const items: RequirementBadge[] = [];
  if (assignment.requiredLevel !== undefined)
    items.push({ label: `Level ${assignment.requiredLevel}+`, Icon: Layers });
  if (assignment.targetLabel)
    items.push({ label: assignment.targetLabel, Icon: Layers });
  if (assignment.lessonIds?.length)
    items.push({
      label: `${assignment.lessonIds.length} assigned lesson${assignment.lessonIds.length === 1 ? "" : "s"}`,
      Icon: Layers,
    });
  if (assignment.minWpm !== undefined)
    items.push({ label: `${assignment.minWpm}+ WPM`, Icon: Gauge });
  if (assignment.minAccuracy !== undefined)
    items.push({ label: `${assignment.minAccuracy}%+ accuracy`, Icon: Target });
  if (assignment.requiredMinutes !== undefined)
    items.push({ label: `${assignment.requiredMinutes} min`, Icon: Clock3 });
  if (assignment.minPythonLessons !== undefined)
    items.push({
      label: `${assignment.minPythonLessons} Python`,
      Icon: Code2,
    });
  if (assignment.minShortcutLessons !== undefined)
    items.push({
      label: `${assignment.minShortcutLessons} shortcut lessons`,
      Icon: Command,
    });
  if (assignment.minShortcutMasteryPct !== undefined)
    items.push({
      label: `${assignment.minShortcutMasteryPct}% shortcut mastery`,
      Icon: Command,
    });
  if (assignment.requiredTrack !== undefined)
    items.push({
      label: `${assignment.requiredTrack[0].toUpperCase()}${assignment.requiredTrack.slice(1)} track`,
      Icon: BarChart3,
    });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ label, Icon }) => (
        <Badge key={label} tone="neutral" icon={Icon}>
          {label}
        </Badge>
      ))}
    </div>
  );
}
