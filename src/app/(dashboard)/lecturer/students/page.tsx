import { getMyStudents } from "../_actions/lecturer";
import { LecturerStudentsClient } from "./students-client";

export default async function LecturerStudentsPage() {
  const students = await getMyStudents();

  const serialized = students.map((s: any) => {
    const allAssessments = s.assessments || [];
    const reviewed = allAssessments.filter((a: any) => a.status === "REVIEWED");
    const completedCount = reviewed.length;
    const avgScore = completedCount > 0 ? Math.round(reviewed.reduce((sum: number, a: any) => sum + (a.totalMarks || 0), 0) / completedCount) : 0;
    const latestGrade = completedCount > 0 ? reviewed[reviewed.length - 1].grade : null;

    let progressLabel = "Not Assessed";
    if (completedCount >= 4) progressLabel = "Fully Assessed";
    else if (completedCount > 0) progressLabel = "Partially Assessed";

    // Determine exact slots completed
    const s1 = s.subjects?.[0] || "Subject 1";
    const s2 = s.subjects?.[1] || "Subject 2";
    
    const completedSlots = {
      A1S1: !!reviewed.find((a: any) => a.assessmentNumber === 1 && a.subject === s1),
      A1S2: !!reviewed.find((a: any) => a.assessmentNumber === 1 && a.subject === s2),
      A2S1: !!reviewed.find((a: any) => a.assessmentNumber === 2 && a.subject === s1),
      A2S2: !!reviewed.find((a: any) => a.assessmentNumber === 2 && a.subject === s2),
    };

    return {
      id: s.id,
      name: s.user.name,
      admissionNumber: s.admissionNumber,
      course: s.course,
      email: s.user.email,
      phone: s.user.phone || "N/A",
      schoolName: s.school?.name || "Pending Placement",
      schoolCounty: s.school?.county || "N/A",
      completedCount,
      avgScore,
      latestGrade,
      progressLabel,
      completedSlots,
    };
  });

  return <LecturerStudentsClient students={serialized} />;
}
