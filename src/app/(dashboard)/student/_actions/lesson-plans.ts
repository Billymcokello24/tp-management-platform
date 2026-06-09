"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMyLessonPlans() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) throw new Error("Student not found");

  const plans = await prisma.lessonPlan.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" }
  });

  return plans;
}

export async function saveLessonPlan(data: any) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) throw new Error("Student not found");

  const plan = await prisma.lessonPlan.create({
    data: {
      studentId: student.id,
      subject: data.subject,
      classForm: data.classForm,
      stream: data.stream,
      topic: data.topic,
      subTopic: data.subTopic,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      objectives: data.objectives,
      introduction: data.introduction,
      developmentSteps: data.developmentSteps, // JSON
      methods: data.methods || [],
      resources: data.resources,
      assessment: data.assessment,
      conclusion: data.conclusion,
      assignment: data.assignment,
      reflection: data.reflection,
      status: data.status || "DRAFT", // DRAFT or SUBMITTED
    }
  });

  revalidatePath("/student/lesson-plans");
  revalidatePath("/student/dashboard");

  return { success: true, id: plan.id };
}

export async function getLessonPlanById(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const plan = await prisma.lessonPlan.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { name: true } },
          school: true
        }
      }
    }
  });

  if (!plan) throw new Error("Not found");
  return plan;
}

export async function updateLessonPlan(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const plan = await prisma.lessonPlan.update({
    where: { id, student: { userId: session.user.id } },
    data: {
      subject: data.subject,
      classForm: data.classForm,
      stream: data.stream,
      topic: data.topic,
      subTopic: data.subTopic,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      objectives: data.objectives,
      introduction: data.introduction,
      developmentSteps: data.developmentSteps,
      methods: data.methods || [],
      resources: data.resources,
      assessment: data.assessment,
      conclusion: data.conclusion,
      assignment: data.assignment,
      reflection: data.reflection,
      status: data.status,
    }
  });

  revalidatePath("/student/lesson-plans");
  revalidatePath("/student/dashboard");

  return { success: true, id: plan.id };
}

export async function deleteLessonPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  // Only allow deleting drafts
  const existing = await prisma.lessonPlan.findUnique({
    where: { id, student: { userId: session.user.id } }
  });

  if (!existing) throw new Error("Not found");
  if (existing.status !== "DRAFT") throw new Error("Only draft lesson plans can be deleted.");

  await prisma.lessonPlan.delete({ where: { id } });

  revalidatePath("/student/lesson-plans");
  revalidatePath("/student/dashboard");

  return { success: true };
}

export async function submitLessonPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.lessonPlan.findUnique({
    where: { id, student: { userId: session.user.id } }
  });

  if (!existing) throw new Error("Not found");
  if (existing.status !== "DRAFT") throw new Error("Only drafts can be submitted.");

  await prisma.lessonPlan.update({
    where: { id },
    data: { status: "SUBMITTED" }
  });

  revalidatePath("/student/lesson-plans");
  revalidatePath("/student/dashboard");

  return { success: true };
}
