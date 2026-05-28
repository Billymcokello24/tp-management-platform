"use server";

import { prisma } from "@/lib/prisma";

export async function getAllAssessments() {
  return prisma.assessment.findMany({
    include: {
      student: {
        include: {
          user: { select: { name: true } },
        },
      },
      lecturer: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAssessmentStats() {
  const [total, draft, submitted, reviewed] = await Promise.all([
    prisma.assessment.count(),
    prisma.assessment.count({ where: { status: "DRAFT" } }),
    prisma.assessment.count({ where: { status: "SUBMITTED" } }),
    prisma.assessment.count({ where: { status: "REVIEWED" } }),
  ]);

  const reviewedAssessments = await prisma.assessment.findMany({
    where: { status: "REVIEWED" },
    select: { totalMarks: true },
  });

  const avgScore = reviewedAssessments.length > 0 
    ? Math.round(reviewedAssessments.reduce((sum, a) => sum + a.totalMarks, 0) / reviewedAssessments.length)
    : 0;

  return { total, draft, submitted, reviewed, avgScore };
}

export async function getAssessmentById(id: string) {
  return prisma.assessment.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
          school: { select: { name: true, county: true } },
        },
      },
      lecturer: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
}

