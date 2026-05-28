"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getStudentDashboardData() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      school: true,
      assignment: {
        include: {
          lecturer: {
            include: { user: { select: { name: true, email: true, phone: true } } }
          }
        }
      },
      lessonPlans: {
        orderBy: { createdAt: "desc" }
      },
      assessments: {
        where: { status: "REVIEWED" }
      }
    }
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  const completedLessonPlans = student.lessonPlans.filter(lp => lp.status === "SUBMITTED" || lp.status === "APPROVED");
  const pendingLessonPlans = student.lessonPlans.filter(lp => lp.status === "DRAFT" || lp.status === "REJECTED");
  
  // Quick calculation for TP completion (mock logic based on 15 LPs and 3 Assessments)
  const lpProgress = Math.min((completedLessonPlans.length / 15) * 50, 50);
  const assessmentProgress = Math.min((student.assessments.length / 3) * 50, 50);
  const totalProgress = Math.round(lpProgress + assessmentProgress);

  const avgScore = student.assessments.length > 0 
    ? Math.round(student.assessments.reduce((sum, a) => sum + a.totalMarks, 0) / student.assessments.length)
    : 0;

  return {
    studentId: student.id,
    school: student.school,
    lecturer: student.assignment?.lecturer,
    stats: {
      completedLessonPlans: completedLessonPlans.length,
      pendingLessonPlans: pendingLessonPlans.length,
      completedAssessments: student.assessments.length,
      currentScore: avgScore,
      progressPercentage: totalProgress,
    },
    recentLessonPlans: student.lessonPlans.slice(0, 5),
  };
}

export async function getStudentSchoolData() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      school: true,
    }
  });

  return student?.school;
}
