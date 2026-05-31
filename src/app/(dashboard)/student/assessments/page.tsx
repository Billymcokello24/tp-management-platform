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
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } }
  });

  if (!student) notFound();

  const assessments = await prisma.assessment.findMany({
    where: { studentId: student.id, status: "REVIEWED" },
    include: {
      lecturer: {
        include: { user: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  // Group assessments for this student
  const studentMap = new Map<string, {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    a1: { id: string; totalMarks: number; grade: string; status: string; lecturerName: string; createdAt: string } | null;
    a2: { id: string; totalMarks: number; grade: string; status: string; lecturerName: string; createdAt: string } | null;
    a3: { id: string; totalMarks: number; grade: string; status: string; lecturerName: string; createdAt: string } | null;
  }>();

  // Initialize the single student entry
  studentMap.set(student.id, {
    studentId: student.id,
    studentName: student.user.name || "Unknown",
    admissionNumber: student.admissionNumber,
    a1: null,
    a2: null,
    a3: null,
  });

  const entry = studentMap.get(student.id)!;

  for (const a of assessments) {
    const aData = {
      id: a.id,
      totalMarks: a.totalMarks,
      grade: a.grade || "N/A",
      status: a.status,
      lecturerName: a.lecturer.user.name || "Unknown",
      createdAt: a.createdAt.toISOString(),
    };

    if (!entry.a1) entry.a1 = aData;
    else if (!entry.a2) entry.a2 = aData;
    else if (!entry.a3) entry.a3 = aData;
  }

  const grouped = Array.from(studentMap.values());

  return <StudentAssessmentsClient students={grouped} />;
}
