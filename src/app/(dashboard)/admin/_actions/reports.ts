"use server";

import { prisma } from "@/lib/prisma";

export async function getReportsData() {
  const [totalStudents, totalLecturers, assessments] = await Promise.all([
    prisma.student.count(),
    prisma.lecturer.count(),
    prisma.assessment.findMany({
      where: { status: "REVIEWED" },
      select: { totalMarks: true, performanceBand: true, student: { select: { course: true } } },
    }),
  ]);

  const grades = {
    "Distinction (70-100)": 0,
    "Credit (60-69)": 0,
    "Pass (50-59)": 0,
    "Fail (0-49)": 0,
  };

  const courseScores: Record<string, { total: number; count: number }> = {};

  assessments.forEach((a) => {
    // Grade distribution
    if (a.totalMarks >= 70) grades["Distinction (70-100)"]++;
    else if (a.totalMarks >= 60) grades["Credit (60-69)"]++;
    else if (a.totalMarks >= 50) grades["Pass (50-59)"]++;
    else grades["Fail (0-49)"]++;

    // Course averages
    const course = a.student.course || "Unknown";
    if (!courseScores[course]) courseScores[course] = { total: 0, count: 0 };
    courseScores[course].total += a.totalMarks;
    courseScores[course].count++;
  });

  const gradeDistribution = Object.entries(grades).map(([name, value]) => ({ name, value }));
  const averageByCourse = Object.entries(courseScores).map(([name, data]) => ({
    name: name.substring(0, 15) + (name.length > 15 ? "..." : ""),
    average: Math.round(data.total / data.count),
  }));

  const avgScore = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.totalMarks, 0) / assessments.length)
    : 0;

  return {
    totalStudents,
    totalLecturers,
    completedAssessments: assessments.length,
    avgScore,
    gradeDistribution,
    averageByCourse,
  };
}
