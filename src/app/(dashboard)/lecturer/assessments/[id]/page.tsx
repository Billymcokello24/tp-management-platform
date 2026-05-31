import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AssessmentDetailClient } from "../../../admin/assessments/[id]/assessment-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LecturerAssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    notFound();
  }

  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: session.user.id }
  });

  if (!lecturer) notFound();

  // First, check if the ID passed is actually an Assessment ID (for backward compatibility)
  let targetStudentId = id;
  const possibleAssessment = await prisma.assessment.findUnique({
    where: { id },
    select: { studentId: true }
  });
  
  if (possibleAssessment) {
    targetStudentId = possibleAssessment.studentId;
  }

  // Now fetch all assessments for this student conducted by this lecturer
  const assessments = await prisma.assessment.findMany({
    where: { 
      studentId: targetStudentId,
      lecturerId: lecturer.id
    },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
          school: { select: { name: true, county: true } },
        },
      },
      lecturer: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!assessments || assessments.length === 0) {
    notFound();
  }

  return <AssessmentDetailClient assessments={assessments} />;
}
