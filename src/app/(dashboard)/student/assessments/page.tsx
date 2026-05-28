import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StudentAssessmentsClient } from "./assessments-client";
import { notFound } from "next/navigation";

export default async function StudentAssessmentsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    notFound();
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) notFound();

  const assessments = await prisma.assessment.findMany({
    where: { studentId: student.id, status: "REVIEWED" },
    include: {
      lecturer: {
        include: { user: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const serialized = assessments.map(a => ({
    id: a.id,
    lecturerName: a.lecturer.user.name,
    status: a.status,
    totalMarks: a.totalMarks,
    grade: a.grade || "N/A",
    createdAt: a.createdAt.toISOString()
  }));

  return <StudentAssessmentsClient assessments={serialized} />;
}
