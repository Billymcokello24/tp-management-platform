import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AssessmentDetailClient } from "../../../admin/assessments/[id]/assessment-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAssessmentDetailPage({ params }: PageProps) {
  const { id } = await params; // This is technically the student ID, which should match their own ID
  
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    notFound();
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  // First, check if the ID passed is actually an Assessment ID
  let targetStudentId = id;
  const possibleAssessment = await prisma.assessment.findUnique({
    where: { id },
    select: { studentId: true }
  });
  
  if (possibleAssessment) {
    targetStudentId = possibleAssessment.studentId;
  }

  if (!student || student.id !== targetStudentId) {
    notFound(); // Security: Ensure student is only viewing their own assessments
  }

  const assessments = await prisma.assessment.findMany({
    where: { 
      studentId: targetStudentId,
      status: "REVIEWED"
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
