"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSchemesOfWork() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) throw new Error("Student not found");

  return prisma.schemeOfWork.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" }
  });
}

export async function saveSchemeOfWork(data: {
  title: string;
  subject: string;
  term: string;
  content: any[];
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) throw new Error("Student not found");

  const scheme = await prisma.schemeOfWork.create({
    data: {
      studentId: student.id,
      title: data.title,
      subject: data.subject,
      term: data.term,
      content: data.content,
      status: "SUBMITTED"
    }
  });

  revalidatePath("/student/schemes");
  revalidatePath("/student/dashboard");

  return { success: true, id: scheme.id };
}

export async function deleteSchemeOfWork(id: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) throw new Error("Student not found");

  await prisma.schemeOfWork.delete({
    where: { 
      id,
      studentId: student.id // Ensure they can only delete their own
    }
  });

  revalidatePath("/student/schemes");
  return { success: true };
}
