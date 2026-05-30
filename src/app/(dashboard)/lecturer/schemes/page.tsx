import { getMyStudentsWithSchemes } from "../_actions/lecturer";
import { LecturerSchemesClient } from "./schemes-client";

export default async function LecturerSchemesPage() {
  const students = await getMyStudentsWithSchemes();

  const serialized = students.map((s: any) => ({
    id: s.id,
    name: s.user.name,
    email: s.user.email,
    schoolName: s.school?.name || "Pending Placement",
    schoolCounty: s.school?.county || "N/A",
    schemes: s.schemesOfWork.map((sw: any) => ({
      id: sw.id,
      title: sw.title,
      subject: sw.subject,
      term: sw.term,
      status: sw.status,
      createdAt: sw.createdAt.toISOString(),
    })),
  }));

  return <LecturerSchemesClient students={serialized} />;
}
