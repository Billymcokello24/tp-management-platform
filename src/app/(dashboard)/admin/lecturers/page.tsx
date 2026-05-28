import { getLecturers } from "../_actions/crud";
import { LecturersClient } from "./lecturers-client";

export default async function LecturersPage() {
  const lecturers = await getLecturers();

  const serialized = lecturers.map((l) => ({
    id: l.id,
    name: l.user.name,
    email: l.user.email,
    phone: l.user.phone,
    department: l.department,
    zone: l.zone,
    county: l.county,
    assignedStudents: l.assignments.reduce((sum, a) => sum + a.students.length, 0),
    assessmentsDone: l.assessments.filter((a) => a.status === "REVIEWED").length,
    assessmentsPending: l.assessments.filter((a) => a.status !== "REVIEWED").length,
  }));

  return <LecturersClient lecturers={serialized} />;
}
