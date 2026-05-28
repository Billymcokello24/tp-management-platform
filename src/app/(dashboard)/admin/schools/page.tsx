import { getSchools } from "../_actions/crud";
import { SchoolsClient } from "./schools-client";

export default async function SchoolsPage() {
  const schools = await getSchools();

  const serialized = schools.map((s) => ({
    id: s.id,
    name: s.name,
    county: s.county,
    subCounty: s.subCounty,
    principal: s.principal,
    phone: s.phone,
    email: s.email,
    studentsAssigned: s.students.length,
  }));

  return <SchoolsClient schools={serialized} />;
}
