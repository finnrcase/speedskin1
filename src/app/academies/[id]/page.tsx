import { notFound } from "next/navigation";
import { AcademyDetail } from "@/components/academies/AcademyDetail";
import { ACADEMY_IDS, getAcademyById } from "@/lib/curriculum";
import type { AcademyId } from "@/lib/data/types";

export function generateStaticParams() {
  return ACADEMY_IDS.map((id) => ({ id }));
}

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ACADEMY_IDS.includes(id as AcademyId)) notFound();
  return <AcademyDetail academy={getAcademyById(id as AcademyId)} />;
}

