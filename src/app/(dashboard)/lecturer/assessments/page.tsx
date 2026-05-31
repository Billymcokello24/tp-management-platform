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

  // Group assessments by studentId
  const studentMap = new Map<string, {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    a1: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
    a2: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
    a3: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
  }>();

  const sorted = [...assessments].sort((a, b) => {
    if (a.studentId !== b.studentId) return a.studentId.localeCompare(b.studentId);
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  for (const a of sorted) {
    if (!studentMap.has(a.studentId)) {
      studentMap.set(a.studentId, {
        studentId: a.studentId,
        studentName: a.student.user.name || "Unknown",
        admissionNumber: a.student.admissionNumber,
        a1: null,
        a2: null,
        a3: null,
      });
    }

    const entry = studentMap.get(a.studentId)!;
    const aData = {
      id: a.id,
      totalMarks: a.totalMarks,
      grade: a.grade || "N/A",
      status: a.status,
      createdAt: a.createdAt.toISOString(),
    };

    if (!entry.a1) entry.a1 = aData;
    else if (!entry.a2) entry.a2 = aData;
    else if (!entry.a3) entry.a3 = aData;
  }

  const grouped = Array.from(studentMap.values());

  return <LecturerAssessmentsClient students={grouped} />;
}
