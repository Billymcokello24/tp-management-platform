import { getAssignments, getAssignmentStats } from "../_actions/assignments";
import { AssignmentsClient } from "./assignments-client";

export default async function AssignmentsPage() {
  const [assignments, stats] = await Promise.all([
    getAssignments(),
    getAssignmentStats(),
  ]);

  const serialized = assignments.map((s) => ({
    studentId: s.id,
    studentName: s.user.name,
    admissionNumber: s.admissionNumber,
    course: s.course,
    schoolName: s.school?.name || "Unassigned",
    schoolCounty: s.school?.county || "N/A",
    lecturerName: s.assignment?.lecturer?.user?.name || "Unknown",
    assignmentLocked: s.assignment?.isLocked || false,
  }));

  return <AssignmentsClient assignments={serialized} stats={stats} />;
}
