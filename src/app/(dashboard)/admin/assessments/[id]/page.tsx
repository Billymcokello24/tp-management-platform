import { notFound } from "next/navigation";
import { getAssessmentsByStudentId } from "../../_actions/assessments";
import { AssessmentDetailClient } from "./assessment-detail-client";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // First, check if the ID passed is actually an Assessment ID (for backward compatibility with old links)
  let targetStudentId = id;
  const possibleAssessment = await prisma.assessment.findUnique({
    where: { id },
    select: { studentId: true }
  });
  
  if (possibleAssessment) {
    targetStudentId = possibleAssessment.studentId;
  }
  
  // Now fetch all assessments for the resolved studentId
  const assessments = await getAssessmentsByStudentId(targetStudentId);

  if (!assessments || assessments.length === 0) {
    notFound();
  }

  return <AssessmentDetailClient assessments={assessments} />;
}
