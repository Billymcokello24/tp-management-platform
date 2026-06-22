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

  // Group assessments for this student — only pass progress data, no marks
  const studentMap = new Map<string, {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    a1s1: { id: string; subject: string } | null;
    a1s2: { id: string; subject: string } | null;
    a2s1: { id: string; subject: string } | null;
    a2s2: { id: string; subject: string } | null;
    a3s1: { id: string; subject: string } | null;
    a3s2: { id: string; subject: string } | null;
  }>();

  // Initialize the single student entry
  studentMap.set(student.id, {
    studentId: student.id,
    studentName: student.user.name || "Unknown",
    admissionNumber: student.admissionNumber,
    a1s1: null,
    a1s2: null,
    a2s1: null,
    a2s2: null,
    a3s1: null,
    a3s2: null,
  });

  const entry = studentMap.get(student.id)!;

  for (const a of assessments) {
    const slotData = { id: a.id, subject: a.subject || "N/A" };

    const s1 = student.subjects?.[0] || "Subject 1";
    const s2 = student.subjects?.[1] || "Subject 2";

    if (a.assessmentNumber === 1 && a.subject === s1) entry.a1s1 = slotData;
    else if (a.assessmentNumber === 1 && a.subject === s2) entry.a1s2 = slotData;
    else if (a.assessmentNumber === 2 && a.subject === s1) entry.a2s1 = slotData;
    else if (a.assessmentNumber === 2 && a.subject === s2) entry.a2s2 = slotData;
    else if (a.assessmentNumber === 3 && a.subject === s1) entry.a3s1 = slotData;
    else if (a.assessmentNumber === 3 && a.subject === s2) entry.a3s2 = slotData;
  }

  const grouped = Array.from(studentMap.values());

  return <StudentAssessmentsClient students={grouped} />;
}
