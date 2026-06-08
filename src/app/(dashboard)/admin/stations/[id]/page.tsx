import { notFound } from "next/navigation";
import { getSchoolProfile } from "../../_actions/crud";
import { SchoolProfileClient as StationProfileClient } from "./station-profile-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolProfilePage({ params }: PageProps) {
  const { id } = await params;
  
  const school = await getSchoolProfile(id);

  if (!school) {
    notFound();
  }

  // Serialize and prepare data for the client
  let fullyAssessed = 0;
  let inProgress = 0;
  
  const assignedStudents = school.students.map(student => {
    const completedCount = student.assessments?.length || 0;
    if (completedCount >= 3) fullyAssessed++;
    else if (completedCount > 0) inProgress++;

    const lecturers = student.assignment ? [{
      name: student.assignment.lecturer.user.name,
      email: student.assignment.lecturer.user.email
    }] : [];

    return {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      admissionNumber: student.admissionNumber,
      completedAssessments: completedCount,
      lecturers
    };
  });

  const serializedSchool = {
    id: school.id,
    name: school.name,
    county: school.county,
    subCounty: school.subCounty,
    principal: school.principal,
    phone: school.phone,
    email: school.email,
    address: school.address,
    latitude: school.latitude,
    longitude: school.longitude,
    geofenceRadius: school.geofenceRadius,
    subjects: school.subjects,
    zoneName: school.zone?.name || null,
    studentsAssigned: school.students.length,
    fullyAssessed,
    inProgress,
  };

  return <StationProfileClient school={serializedSchool} students={assignedStudents} />;
}
