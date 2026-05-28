import { getLecturerDashboardData } from "../_actions/lecturer";
import { LecturerDashboardClient } from "./dashboard-client";

export default async function LecturerDashboardPage() {
  const data = await getLecturerDashboardData();

  const serializedActivity = data.recentAssessments.map(a => ({
    id: a.id,
    studentName: a.student.user.name,
    status: a.status,
    totalMarks: a.totalMarks,
    date: a.createdAt.toISOString(),
  }));

  return <LecturerDashboardClient stats={data.stats} recentActivity={serializedActivity} />;
}
