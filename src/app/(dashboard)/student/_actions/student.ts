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

import { revalidatePath } from "next/cache";

export async function updateStudentSchool(data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  county: string;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) throw new Error("Student not found");

  // 1. Check if school already exists by name (case-insensitive approximation)
  // To keep it simple, we search for an exact match first.
  let school = await prisma.school.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
    },
  });

  // 2. If it doesn't exist, create it (it will be "Unzoned")
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        county: data.county,
        subCounty: "Unknown", // Can be updated by admin later
        geofenceRadius: 500,
      },
    });
  } else {
    // Optionally update GPS if it was missing
    if (!school.latitude || !school.longitude) {
      school = await prisma.school.update({
        where: { id: school.id },
        data: {
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
        },
      });
    }
  }

  // 3. Link student to this school
  await prisma.student.update({
    where: { id: student.id },
    data: { schoolId: school.id },
  });

  revalidatePath("/student/station");
  revalidatePath("/student/station");
  revalidatePath("/admin/stations"); // So admins see the newly added school
  
  return { success: true, school };
}

export async function assignExistingSchool(schoolId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) throw new Error("Student not found");

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) throw new Error("School not found");

  await prisma.student.update({
    where: { id: student.id },
    data: { schoolId: school.id },
  });

  revalidatePath("/student/station");
  return { success: true, school };
}
