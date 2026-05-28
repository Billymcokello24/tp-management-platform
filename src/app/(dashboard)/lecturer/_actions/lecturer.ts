"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getLecturerDashboardData() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  // Find the Lecturer profile linked to this User
  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        include: {
          students: {
            include: { user: { select: { name: true } }, school: true }
          }
        }
      },
      assessments: {
        include: {
          student: { include: { user: { select: { name: true } } } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!lecturer) {
    throw new Error("Lecturer profile not found");
  }

  const assignedStudents = lecturer.assignments.reduce((acc, assignment) => [...acc, ...assignment.students], [] as any[]);
  const completedAssessments = lecturer.assessments.filter(a => a.status === "REVIEWED");
  const pendingAssessments = lecturer.assessments.filter(a => a.status !== "REVIEWED");
  
  // Recent activity: assessments
  const recentAssessments = lecturer.assessments.slice(0, 5);

  return {
    lecturerId: lecturer.id,
    stats: {
      totalAssigned: assignedStudents.length,
      completedAssessments: completedAssessments.length,
      pendingAssessments: pendingAssessments.length,
    },
    recentAssessments,
  };
}

export async function getMyStudents() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        include: {
          students: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
              school: { select: { name: true, county: true } },
              assessments: { where: { status: "REVIEWED" } }
            }
          }
        }
      }
    }
  });

  if (!lecturer) return [];

  const students = lecturer.assignments.reduce((acc, assignment) => [...acc, ...assignment.students], [] as any[]);
  return students;
}
