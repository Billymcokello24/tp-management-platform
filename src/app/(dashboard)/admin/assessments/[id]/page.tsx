import { notFound } from "next/navigation";
import { getAssessmentById } from "../../_actions/assessments";
import { AssessmentDetailClient } from "./assessment-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const assessment = await getAssessmentById(id);

  if (!assessment) {
    notFound();
  }

  return <AssessmentDetailClient assessment={assessment} />;
}
