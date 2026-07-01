"use client";

import { ShieldCheck, Users, GraduationCap, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useClassroom } from "@/lib/classroom/ClassroomProvider";

export default function AdminPage() {
  const { profile } = useAuth();
  const { classes, students, assignments } = useClassroom();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="SpeedSkin workspace"
        subtitle="High-level account, classroom, and assignment visibility for product admins."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Classes"
          value={classes.length}
          icon={GraduationCap}
          tone="brand"
          detail="Across the workspace"
        />
        <StatCard
          label="Students"
          value={students.length}
          icon={Users}
          tone="info"
          detail="Visible through RLS"
        />
        <StatCard
          label="Assignments"
          value={assignments.length}
          icon={ClipboardList}
          tone="success"
          detail="Active classroom goals"
        />
        <StatCard
          label="Role"
          value={profile?.role ?? "admin"}
          icon={ShieldCheck}
          tone="neutral"
          detail="Authenticated profile"
        />
      </section>

      <Card className="warm-panel border-brand/15">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Admin data access
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          The Supabase migration grants admins access to all app data through
          RLS policies. This dashboard intentionally stays simple until the
          product needs account management tools.
        </p>
      </Card>
    </div>
  );
}
