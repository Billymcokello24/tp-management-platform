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
    if (completedCount >= 3) progressLabel = "Fully Assessed";
    else if (completedCount > 0) progressLabel = "Partially Assessed";

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
    };
  });

  return <LecturerStudentsClient students={serialized} />;
}
