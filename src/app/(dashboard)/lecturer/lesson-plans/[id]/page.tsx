import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLessonPlanById } from "../../../student/_actions/lesson-plans";
import { LecturerLessonPlanApprovalClient } from "./lesson-plan-approval-client";

export default async function LecturerLessonPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    notFound();
  }

  try {
    const plan = await getLessonPlanById(id);
    return <LecturerLessonPlanApprovalClient plan={plan} />;
  } catch (error) {
    notFound();
  }
}
