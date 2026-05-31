import { getAllAssessments, getAssessmentStats } from "../_actions/assessments";
import { AssessmentsClient } from "./assessments-client";

export default async function AssessmentsPage() {
  const [assessments, stats] = await Promise.all([
    getAllAssessments(),
    getAssessmentStats(),
  ]);

  // Group assessments by studentId and build one row per student
  const studentMap = new Map<string, {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    course: string;
    schoolName: string;
    a1: { id: string; totalMarks: number; grade: string; status: string; lecturerName: string; createdAt: string } | null;
    a2: { id: string; totalMarks: number; grade: string; status: string; lecturerName: string; createdAt: string } | null;
    a3: { id: string; totalMarks: number; grade: string; status: string; lecturerName: string; createdAt: string } | null;
  }>();

  // Sort all assessments by student, then by date ascending so index = assessment number
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
        course: (a.student as any).course || "N/A",
        schoolName: (a.student as any).school?.name || "N/A",
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
      lecturerName: a.lecturer.user.name || "Unknown",
      createdAt: a.createdAt.toISOString(),
    };

    // Fill slots in order
    if (!entry.a1) entry.a1 = aData;
    else if (!entry.a2) entry.a2 = aData;
    else if (!entry.a3) entry.a3 = aData;
  }

  const grouped = Array.from(studentMap.values());

  return <AssessmentsClient students={grouped} stats={stats} />;
}
