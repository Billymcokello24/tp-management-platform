import { getLessonPlanById } from "../../_actions/lesson-plans";
import { LessonPlanDetailClient } from "./lesson-plan-detail-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPlanViewPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    const plan = await getLessonPlanById(id);
    return <LessonPlanDetailClient plan={plan} />;
  } catch (error) {
    notFound();
  }
}
