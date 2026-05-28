import { getMyStudents } from "../_actions/lecturer";
import { LecturerStudentsClient } from "./students-client";

export default async function LecturerStudentsPage() {
  const students = await getMyStudents();

  // Serialize the data for the client component
  const serialized = students.map((s: any) => ({
    id: s.id,
    name: s.user.name,
    admissionNumber: s.admissionNumber,
    course: s.course,
    email: s.user.email,
    phone: s.user.phone || "N/A",
    schoolName: s.school?.name || "Pending Placement",
    schoolCounty: s.school?.county || "N/A",
    // Find if there's a completed assessment
    assessmentStatus: s.assessments?.length > 0 ? "Completed" : "Pending",
  }));

  return <LecturerStudentsClient students={serialized} />;
}
