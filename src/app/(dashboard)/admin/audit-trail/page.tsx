import { prisma } from "@/lib/prisma";
import { AuditTrailClient } from "./audit-trail-client";

export const dynamic = "force-dynamic";

export default async function AuditTrailPage() {
  // Fetch all audit logs
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Also fetch recent activity from core models to supplement
  const [recentUsers, recentAssessments, recentLessonPlans, recentAssignments] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, studentId: true, lecturerId: true, subject: true, totalMarks: true, status: true, createdAt: true, student: { select: { user: { select: { name: true } } } }, lecturer: { select: { user: { select: { name: true } } } } },
    }),
    prisma.lessonPlan.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, studentId: true, subject: true, topic: true, status: true, createdAt: true, student: { select: { user: { select: { name: true } } } } },
    }),
    prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, lecturerId: true, createdAt: true, lecturer: { select: { user: { select: { name: true } } } }, students: { select: { id: true, user: { select: { name: true } } } } },
    }),
  ]);

  // Serialize dates for the client
  const serialized = {
    auditLogs: JSON.parse(JSON.stringify(auditLogs)),
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    recentAssessments: JSON.parse(JSON.stringify(recentAssessments)),
    recentLessonPlans: JSON.parse(JSON.stringify(recentLessonPlans)),
    recentAssignments: JSON.parse(JSON.stringify(recentAssignments)),
  };

  return <AuditTrailClient data={serialized} />;
}
