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
        subtitle="Classes, students, and assignments."
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

      <Card className="border-brand/15 bg-white">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Data access
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Admins can view workspace data through Supabase RLS.
        </p>
      </Card>
    </div>
  );
}
