"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface LogEntry {
  action: string;
  entity: string;
  entityId?: string;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(entry: LogEntry) {
  try {
    let ipAddress: string | undefined;
    let userRole: string | undefined;

    try {
      const headersList = await headers();
      ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;
    } catch {}

    // If userId is provided, fetch their role
    if (entry.userId) {
      try {
        const user = await prisma.user.findUnique({ where: { id: entry.userId }, select: { role: true } });
        userRole = user?.role;
      } catch {}
    }

    await prisma.auditLog.create({
      data: {
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId || null,
        message: entry.message,
        userId: entry.userId || null,
        userRole: userRole || null,
        metadata: entry.metadata ? (entry.metadata as any) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    // Silently fail — audit logging must never break the app
    console.error("Audit log creation failed:", error);
  }
}

/**
 * Log a user login event (call from auth callbacks or login page)
 */
export async function logUserLogin(userId: string) {
  await createAuditLog({
    action: "USER_LOGIN",
    entity: "User",
    entityId: userId,
    message: "User logged into the system",
    userId,
  });
}

/**
 * Log an assessment submission
 */
export async function logAssessmentSubmitted(assessmentId: string, lecturerId: string, studentId: string, subject: string, score: number) {
  await createAuditLog({
    action: "ASSESSMENT_SUBMITTED",
    entity: "Assessment",
    entityId: assessmentId,
    message: `Assessment submitted for ${subject} — score: ${score}/100`,
    userId: lecturerId,
    metadata: { assessmentId, studentId, subject, score },
  });
}

/**
 * Log a lesson plan submission
 */
export async function logLessonPlanSubmitted(planId: string, studentId: string, subject: string, topic: string) {
  await createAuditLog({
    action: "LESSON_PLAN_SUBMITTED",
    entity: "LessonPlan",
    entityId: planId,
    message: `Lesson plan "${topic}" submitted for ${subject}`,
    userId: studentId,
    metadata: { planId, subject, topic },
  });
}

/**
 * Log a student-lecturer assignment
 */
export async function logStudentAssigned(studentId: string, lecturerId: string, adminId: string) {
  await createAuditLog({
    action: "STUDENT_ASSIGNED",
    entity: "Assignment",
    message: `Student assigned to lecturer`,
    userId: adminId,
    metadata: { studentId, lecturerId },
  });
}
