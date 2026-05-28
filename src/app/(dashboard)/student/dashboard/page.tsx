import { getStudentDashboardData } from "../_actions/student";
import { StudentDashboardClient } from "./dashboard-client";

export default async function StudentDashboardPage() {
  const data = await getStudentDashboardData();
  
  const serializedLPs = data.recentLessonPlans.map(lp => ({
    id: lp.id,
    topic: lp.topic,
    subject: lp.subject,
    status: lp.status,
    date: lp.createdAt.toISOString()
  }));

  const serializedSchool = data.school ? {
    name: data.school.name,
    county: data.school.county,
    principal: data.school.principal || "N/A",
    phone: data.school.phone || "N/A",
  } : null;

  const serializedLecturer = data.lecturer ? {
    name: data.lecturer.user.name,
    department: data.lecturer.department,
    email: data.lecturer.user.email,
    phone: data.lecturer.user.phone || "N/A",
  } : null;

  return (
    <StudentDashboardClient 
      stats={data.stats} 
      recentLessonPlans={serializedLPs}
      school={serializedSchool}
      lecturer={serializedLecturer}
    />
  );
}
