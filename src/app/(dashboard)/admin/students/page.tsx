import { getStudents, getSchools, getLecturers } from "../_actions/crud";
import { StudentsClient } from "./students-client";

export default async function StudentsPage() {
  const [students, schools, lecturers] = await Promise.all([
    getStudents(),
    getSchools(),
    getLecturers(),
  ]);

  const serialized = students.map((s) => ({
    id: s.id,
    name: s.user.name,
    email: s.user.email,
    phone: s.user.phone,
    admissionNumber: s.admissionNumber,
    course: s.course,
    subjects: s.subjects,
    tpStatus: s.tpStatus,
    schoolId: s.schoolId,
    schoolName: s.school?.name || "Unassigned",
    schoolCounty: s.school?.county || "-",
    lecturerName: s.assignment?.lecturer?.user?.name || "Unassigned",
    assignmentId: s.assignmentId,
  }));

  const schoolOptions = schools.map((s) => ({
    id: s.id,
    name: s.name,
    county: s.county,
  }));

  const lecturerOptions = lecturers.map((l) => ({
    id: l.id,
    name: l.user.name,
    zone: l.zoneRef?.name || "Unzoned",
  }));

  return <StudentsClient students={serialized} schools={schoolOptions} lecturers={lecturerOptions} />;
}
