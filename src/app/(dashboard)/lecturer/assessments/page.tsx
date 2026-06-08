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
    a1s1: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
    a1s2: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
    a2s1: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
    a2s2: { id: string; totalMarks: number; grade: string; status: string; createdAt: string } | null;
  }>();

  for (const a of assessments) {
    if (!studentMap.has(a.studentId)) {
      studentMap.set(a.studentId, {
        studentId: a.studentId,
        studentName: a.student.user.name || "Unknown",
        admissionNumber: a.student.admissionNumber,
        a1s1: null,
        a1s2: null,
        a2s1: null,
        a2s2: null,
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

    const s1 = a.student.subjects?.[0] || "Subject 1";
    const s2 = a.student.subjects?.[1] || "Subject 2";

    if (a.assessmentNumber === 1 && a.subject === s1) entry.a1s1 = aData;
    else if (a.assessmentNumber === 1 && a.subject === s2) entry.a1s2 = aData;
    else if (a.assessmentNumber === 2 && a.subject === s1) entry.a2s1 = aData;
    else if (a.assessmentNumber === 2 && a.subject === s2) entry.a2s2 = aData;
  }

  const grouped = Array.from(studentMap.values());

  return <LecturerAssessmentsClient students={grouped} />;
}
