import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./dashboard-client";

async function getStats() {
  const [
    totalStudents,
    totalLecturers,
    totalSchools,
    assignedStudents,
    completedAssessments,
    pendingAssessments,
    allAssessments,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.lecturer.count(),
    prisma.school.count(),
    prisma.student.count({ where: { assignmentId: { not: null } } }),
    prisma.assessment.count({ where: { status: "REVIEWED" } }),
    prisma.assessment.count({ where: { status: { in: ["DRAFT", "SUBMITTED"] } } }),
    prisma.assessment.findMany({
      select: { totalMarks: true },
      where: { status: "REVIEWED" },
    }),
  ]);

  const avgScore = allAssessments.length > 0
    ? Math.round(allAssessments.reduce((sum, a) => sum + a.totalMarks, 0) / allAssessments.length)
    : 0;

  const pendingAssignments = totalStudents - assignedStudents;

  return {
    totalStudents,
    totalLecturers,
    totalSchools,
    assignedStudents,
    pendingAssignments,
    completedAssessments,
    pendingAssessments,
    avgScore,
  };
}

async function getChartData() {
  // Assessments per lecturer
  const lecturers = await prisma.lecturer.findMany({
    include: {
      user: { select: { name: true } },
      assessments: { where: { status: "REVIEWED" } },
    },
  });

  const assessmentsPerLecturer = lecturers.map((l) => ({
    name: l.user.name.split(" ").slice(-1)[0], // Last name
    assessments: l.assessments.length,
  }));

  // Students per county
  const schools = await prisma.school.findMany({
    include: { students: true },
  });
  const countyMap: Record<string, number> = {};
  schools.forEach((s) => {
    countyMap[s.county] = (countyMap[s.county] || 0) + s.students.length;
  });
  const studentsPerCounty = Object.entries(countyMap).map(([county, count]) => ({
    name: county,
    students: count,
  }));

  // Assignment completion
  const totalStudents = await prisma.student.count();
  const assigned = await prisma.student.count({ where: { assignmentId: { not: null } } });
  const unassigned = totalStudents - assigned;
  const assignmentCompletion = [
    { name: "Assigned", value: assigned },
    { name: "Unassigned", value: unassigned },
  ];

  return { assessmentsPerLecturer, studentsPerCounty, assignmentCompletion };
}

async function getRecentActivity() {
  const [recentAssessments, recentLessonPlans] = await Promise.all([
    prisma.assessment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: { include: { user: { select: { name: true } } } },
        lecturer: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.lessonPlan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  return { recentAssessments, recentLessonPlans };
}

export default async function AdminDashboardPage() {
  const [stats, chartData, activity] = await Promise.all([
    getStats(),
    getChartData(),
    getRecentActivity(),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      chartData={chartData}
      activity={activity}
    />
  );
}
