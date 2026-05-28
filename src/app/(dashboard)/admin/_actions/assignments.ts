"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getAssignments() {
  return prisma.student.findMany({
    where: { assignmentId: { not: null } },
    include: {
      user: { select: { name: true } },
      school: { select: { name: true, county: true } },
      assignment: {
        include: {
          lecturer: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function generateRandomAssignments() {
  // 1. Fetch all active lecturers
  const lecturers = await prisma.lecturer.findMany({
    include: { assignments: true },
  });

  if (lecturers.length === 0) {
    throw new Error("Cannot assign: No lecturers found in the system.");
  }

  // 2. Ensure every lecturer has exactly ONE active assignment record
  // (We use a single Assignment record per lecturer to group their students)
  const lecturerAssignmentIds: string[] = [];

  for (const lecturer of lecturers) {
    let assignment = lecturer.assignments.find((a) => !a.isLocked);
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: { lecturerId: lecturer.id },
      });
    }
    lecturerAssignmentIds.push(assignment.id);
  }

  // 3. Fetch all unassigned students
  const unassignedStudents = await prisma.student.findMany({
    where: { assignmentId: null },
    select: { id: true },
  });

  if (unassignedStudents.length === 0) {
    return { success: true, count: 0, message: "All students are already assigned." };
  }

  // 4. Randomly shuffle the unassigned students
  const shuffledStudents = shuffleArray(unassignedStudents);

  // 5. Round-robin distribution
  const updates = [];
  for (let i = 0; i < shuffledStudents.length; i++) {
    const student = shuffledStudents[i];
    const assignmentId = lecturerAssignmentIds[i % lecturerAssignmentIds.length];

    updates.push(
      prisma.student.update({
        where: { id: student.id },
        data: { assignmentId },
      })
    );
  }

  // Execute all updates in a transaction
  await prisma.$transaction(updates);

  revalidatePath("/admin/assignments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");

  return { 
    success: true, 
    count: shuffledStudents.length, 
    message: `Successfully assigned ${shuffledStudents.length} students across ${lecturers.length} lecturers.` 
  };
}

export async function resetAssignments() {
  // Clear the assignmentId for all students
  await prisma.student.updateMany({
    data: { assignmentId: null },
  });

  // Optional: delete unlocked assignment records (clean up)
  await prisma.assignment.deleteMany({
    where: { isLocked: false },
  });

  revalidatePath("/admin/assignments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");

  return { success: true, message: "All unlocked assignments have been reset." };
}

export async function getAssignmentStats() {
  const total = await prisma.student.count();
  const assigned = await prisma.student.count({ where: { assignmentId: { not: null } } });
  
  return {
    total,
    assigned,
    unassigned: total - assigned,
  };
}
