import { getSchools, getZones } from "../_actions/crud";
import { SchoolsClient } from "./schools-client";

export default async function SchoolsPage() {
  const schools = await getSchools();
  const zones = await getZones();

  const serialized = schools.map((s) => ({
    id: s.id,
    name: s.name,
    county: s.county,
    subCounty: s.subCounty,
    principal: s.principal,
    phone: s.phone,
    email: s.email,
    address: s.address,
    latitude: s.latitude,
    longitude: s.longitude,
    geofenceRadius: s.geofenceRadius,
    subjects: s.subjects,
    zoneId: s.zoneId,
    zoneName: s.zone?.name || null,
    studentsAssigned: s.students.length,
  }));

  const serializedZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
  }));

  return <SchoolsClient schools={serialized} zones={serializedZones} />;
}
