import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { LecturerAssessmentsClient } from "./assessments-client";
import { notFound } from "next/navigation";

export default async function LecturerAssessmentsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    notFound();
  }

  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: session.user.id }
  });

  if (!lecturer) notFound();

  const assessments = await prisma.assessment.findMany({
    where: { lecturerId: lecturer.id },
    include: {
      student: {
        include: { user: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const serialized = assessments.map(a => ({
    id: a.id,
    studentName: a.student.user.name,
    admissionNumber: a.student.admissionNumber,
    status: a.status,
    totalMarks: a.totalMarks,
    grade: a.grade || "N/A",
    createdAt: a.createdAt.toISOString()
  }));

  return <LecturerAssessmentsClient assessments={serialized} />;
}
