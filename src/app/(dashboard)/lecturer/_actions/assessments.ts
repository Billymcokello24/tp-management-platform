"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStudentForAssessment(studentId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: session.user.id }
  });

  if (!lecturer) throw new Error("Lecturer not found");

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true, email: true } },
      school: { select: { name: true } },
    }
  });

  if (!student) throw new Error("Student not found");

  // Verify the student is actually assigned to this lecturer
  const assignment = await prisma.assignment.findFirst({
    where: {
      lecturerId: lecturer.id,
      students: { some: { id: studentId } }
    }
  });

  if (!assignment) {
    throw new Error("You are not authorized to assess this student.");
  }

  return { student, lecturerId: lecturer.id };
}

export async function submitAssessment(data: any) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  // Calculate total marks server-side as a safeguard
  const totalMarks = 
    data.schemeOfWorkMark + data.lessonPlanObjectives + data.lessonPlanActivities + data.lessonPlanSequence +
    data.introductionMark + data.logicalPresentation + data.contentRelevance + data.contentAdequacy +
    data.teachingStrategies + data.teachingSkills + data.contentMastery + data.communicationMark +
    data.chalkboardUse + data.resourceTiming + data.resourceAppropriateness + data.resourceInnovativeness +
    data.learnerControl + data.learnerParticipation + data.groupWork + data.teacherLearnerRapport +
    data.closureSkills + data.concludingActivities + data.assignmentMark +
    data.personalityMark + data.selfAppraisalMark;

  let grade = "E";
  let band = "Below Average";
  
  if (totalMarks >= 70) { grade = "A"; band = "Distinction"; }
  else if (totalMarks >= 60) { grade = "B"; band = "Credit"; }
  else if (totalMarks >= 50) { grade = "C"; band = "Pass"; }
  else if (totalMarks >= 40) { grade = "D"; band = "Pass"; }

  const assessment = await prisma.assessment.create({
    data: {
      studentId: data.studentId,
      lecturerId: data.lecturerId,
      status: "REVIEWED",
      totalMarks,
      grade,
      performanceBand: band,
      ...data.marks, // Spread the marks object if structured that way, or map them individually
      schemeOfWorkMark: data.schemeOfWorkMark,
      lessonPlanObjectives: data.lessonPlanObjectives,
      lessonPlanActivities: data.lessonPlanActivities,
      lessonPlanSequence: data.lessonPlanSequence,
      introductionMark: data.introductionMark,
      logicalPresentation: data.logicalPresentation,
      contentRelevance: data.contentRelevance,
      contentAdequacy: data.contentAdequacy,
      teachingStrategies: data.teachingStrategies,
      teachingSkills: data.teachingSkills,
      contentMastery: data.contentMastery,
      communicationMark: data.communicationMark,
      chalkboardUse: data.chalkboardUse,
      resourceTiming: data.resourceTiming,
      resourceAppropriateness: data.resourceAppropriateness,
      resourceInnovativeness: data.resourceInnovativeness,
      learnerControl: data.learnerControl,
      learnerParticipation: data.learnerParticipation,
      groupWork: data.groupWork,
      teacherLearnerRapport: data.teacherLearnerRapport,
      closureSkills: data.closureSkills,
      concludingActivities: data.concludingActivities,
      assignmentMark: data.assignmentMark,
      personalityMark: data.personalityMark,
      selfAppraisalMark: data.selfAppraisalMark,
      generalComments: data.generalComments,
      areasOfStrength: data.areasOfStrength,
      areasOfImprovement: data.areasOfImprovement,
    }
  });

  revalidatePath("/lecturer/students");
  revalidatePath("/lecturer/dashboard");
  revalidatePath("/lecturer/assessments");

  return { success: true, id: assessment.id };
}
