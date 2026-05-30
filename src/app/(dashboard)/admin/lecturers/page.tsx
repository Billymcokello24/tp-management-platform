import { getLecturers, getZones } from "../_actions/crud";
import { LecturersClient } from "./lecturers-client";

export default async function LecturersPage() {
  const lecturers = await getLecturers();
  const zones = await getZones();

  const serialized = lecturers.map((l) => ({
    id: l.id,
    name: l.user.name,
    email: l.user.email,
    phone: l.user.phone,
    department: l.department,
    zone: l.zoneRef?.name || l.zone || "Unassigned", // Prefer new zone relation, fallback to old string
    zoneId: l.zoneId,
    county: l.county,
    assignedStudents: l.assignments.reduce((sum, a) => sum + a.students.length, 0),
    assessmentsDone: l.assessments.filter((a) => a.status === "REVIEWED").length,
    assessmentsPending: l.assessments.filter((a) => a.status !== "REVIEWED").length,
  }));

  const serializedZones = zones.map(z => ({
    id: z.id,
    name: z.name
  }));

  return <LecturersClient lecturers={serialized} zones={serializedZones} />;
}
