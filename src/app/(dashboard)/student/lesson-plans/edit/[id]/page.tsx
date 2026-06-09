import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLessonPlanById } from "../../../_actions/lesson-plans";
import { BuilderClient } from "../../new/builder-client";

export default async function EditLessonPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    redirect("/login");
  }

  try {
    const plan = await getLessonPlanById(id);
    
    // Only allow editing if it's a DRAFT
    if (plan.status !== "DRAFT") {
      redirect("/student/lesson-plans");
    }

    return <BuilderClient initialData={plan} />;
  } catch (error) {
    notFound();
  }
}
