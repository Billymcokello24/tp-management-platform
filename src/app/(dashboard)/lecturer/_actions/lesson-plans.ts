"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function reviewLessonPlan(id: string, status: "APPROVED" | "REJECTED", reviewComment: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  await prisma.lessonPlan.update({
    where: { id },
    data: {
      status,
      reviewComment
    }
  });

  revalidatePath("/lecturer/lesson-plans");
  revalidatePath(`/lecturer/lesson-plans/${id}`);
  
  return { success: true };
}
