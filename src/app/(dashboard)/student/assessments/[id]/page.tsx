import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AssessmentDetailClient } from "../../../admin/assessments/[id]/assessment-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    notFound();
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) notFound();

  const assessment = await prisma.assessment.findUnique({
    where: { 
      id,
      studentId: student.id // Ensure they can only view their own assessments
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
  });

  if (!assessment) {
    notFound();
  }

  return <AssessmentDetailClient assessment={assessment} />;
}
