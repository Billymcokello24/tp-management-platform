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
  
  // TP completion based on 15 LPs and 6 Assessments
  const lpProgress = Math.min((completedLessonPlans.length / 15) * 50, 50);
  const assessmentProgress = Math.min((student.assessments.length / 6) * 50, 50);
  const totalProgress = Math.round(lpProgress + assessmentProgress);

  // Organize assessments into A1S1, A1S2, A2S1, A2S2, A3S1, A3S2 slots
  const s1 = student.subjects?.[0] || "Subject 1";
  const s2 = student.subjects?.[1] || "Subject 2";

  type SlotData = { id: string; subject: string } | null;

  const assessmentSlots: Record<string, SlotData> = {
    a1s1: null, a1s2: null,
    a2s1: null, a2s2: null,
    a3s1: null, a3s2: null,
  };

  for (const a of student.assessments) {
    const slotData = { id: a.id, subject: a.subject || "N/A" };
    if (a.assessmentNumber === 1 && a.subject === s1) assessmentSlots.a1s1 = slotData;
    else if (a.assessmentNumber === 1 && a.subject === s2) assessmentSlots.a1s2 = slotData;
    else if (a.assessmentNumber === 2 && a.subject === s1) assessmentSlots.a2s1 = slotData;
    else if (a.assessmentNumber === 2 && a.subject === s2) assessmentSlots.a2s2 = slotData;
    else if (a.assessmentNumber === 3 && a.subject === s1) assessmentSlots.a3s1 = slotData;
    else if (a.assessmentNumber === 3 && a.subject === s2) assessmentSlots.a3s2 = slotData;
  }

  const completionPercentage = Math.round((student.assessments.length / 6) * 100);

  return {
    studentId: student.id,
    school: student.school,
    lecturer: student.assignment?.lecturer,
    stats: {
      completedLessonPlans: completedLessonPlans.length,
      pendingLessonPlans: pendingLessonPlans.length,
      completedAssessments: student.assessments.length,
      currentScore: 0,
      progressPercentage: totalProgress,
    },
    assessmentSlots,
    overallSummary: {
      s1Name: s1,
      s2Name: s2,
      s1Average: 0,
      s2Average: 0,
      assessmentAverage: 0,
      finalTPAverage: 0,
      finalGrade: "N/A",
      completionPercentage,
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
