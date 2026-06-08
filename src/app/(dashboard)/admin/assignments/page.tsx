import { getAssignments, getAssignmentStats } from "../_actions/assignments";
import { getLecturers } from "../_actions/crud";
import { AssignmentsClient } from "./assignments-client";

export default async function AssignmentsPage() {
  const [assignments, stats, lecturers] = await Promise.all([
    getAssignments(),
    getAssignmentStats(),
    getLecturers(),
  ]);

  const serialized = assignments.map((s) => ({
    studentId: s.id,
    studentName: s.user.name,
    admissionNumber: s.admissionNumber,
    course: s.course,
    schoolName: s.school?.name || "Unassigned",
    schoolCounty: s.school?.county || "N/A",
    schoolZone: s.school?.zone?.name || null,
    lecturerName: s.assignment?.lecturer?.user?.name || "Unknown",
    lecturerZone: s.assignment?.lecturer?.zoneRef?.name || null,
    assignmentLocked: s.assignment?.isLocked || false,
  }));

  const lecturerOptions = lecturers.map((l) => ({
    id: l.id,
    name: l.user.name,
    zone: l.zoneRef?.name || "Unzoned",
  }));

  return <AssignmentsClient assignments={serialized} stats={stats} lecturers={lecturerOptions} />;
}
