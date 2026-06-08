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
      school: { select: { name: true, latitude: true, longitude: true, geofenceRadius: true } },
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

  const assessments = await prisma.assessment.findMany({
    where: { studentId, lecturerId: lecturer.id },
    orderBy: { createdAt: 'asc' }
  });

  return { student, lecturerId: lecturer.id, assessments };
}

export async function submitAssessment(data: any) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  const status = data.status || "REVIEWED";

  // Calculate total marks server-side as a safeguard
  const totalMarks = 
    (data.schemeOfWorkMark || 0) + (data.lessonPlanObjectives || 0) + (data.lessonPlanActivities || 0) + (data.lessonPlanSequence || 0) +
    (data.introductionMark || 0) + (data.logicalPresentation || 0) + (data.contentRelevance || 0) + (data.contentAdequacy || 0) +
    (data.teachingStrategies || 0) + (data.teachingSkills || 0) + (data.contentMastery || 0) + (data.communicationMark || 0) +
    (data.chalkboardUse || 0) + (data.resourceTiming || 0) + (data.resourceAppropriateness || 0) + (data.resourceInnovativeness || 0) +
    (data.learnerControl || 0) + (data.learnerParticipation || 0) + (data.groupWork || 0) + (data.teacherLearnerRapport || 0) +
    (data.closureSkills || 0) + (data.concludingActivities || 0) + (data.assignmentMark || 0) +
    (data.personalityMark || 0) + (data.selfAppraisalMark || 0);

  let grade = "E";
  let band = "Below Average";
  
  if (totalMarks >= 70) { grade = "A"; band = "Distinction"; }
  else if (totalMarks >= 60) { grade = "B"; band = "Credit"; }
  else if (totalMarks >= 50) { grade = "C"; band = "Pass"; }
  else if (totalMarks >= 40) { grade = "D"; band = "Pass"; }

  const payload = {
    studentId: data.studentId,
    lecturerId: data.lecturerId,
    status: status,
    assessmentNumber: data.assessmentNumber || 1,
    subject: data.subject || null,
    totalMarks,
    grade,
    performanceBand: band,
    schemeOfWorkMark: data.schemeOfWorkMark || 0,
    lessonPlanObjectives: data.lessonPlanObjectives || 0,
    lessonPlanActivities: data.lessonPlanActivities || 0,
    lessonPlanSequence: data.lessonPlanSequence || 0,
    introductionMark: data.introductionMark || 0,
    logicalPresentation: data.logicalPresentation || 0,
    contentRelevance: data.contentRelevance || 0,
    contentAdequacy: data.contentAdequacy || 0,
    teachingStrategies: data.teachingStrategies || 0,
    teachingSkills: data.teachingSkills || 0,
    contentMastery: data.contentMastery || 0,
    communicationMark: data.communicationMark || 0,
    chalkboardUse: data.chalkboardUse || 0,
    resourceTiming: data.resourceTiming || 0,
    resourceAppropriateness: data.resourceAppropriateness || 0,
    resourceInnovativeness: data.resourceInnovativeness || 0,
    learnerControl: data.learnerControl || 0,
    learnerParticipation: data.learnerParticipation || 0,
    groupWork: data.groupWork || 0,
    teacherLearnerRapport: data.teacherLearnerRapport || 0,
    closureSkills: data.closureSkills || 0,
    concludingActivities: data.concludingActivities || 0,
    assignmentMark: data.assignmentMark || 0,
    personalityMark: data.personalityMark || 0,
    selfAppraisalMark: data.selfAppraisalMark || 0,
    generalComments: data.generalComments || "",
    areasOfStrength: data.areasOfStrength || "",
    areasOfImprovement: data.areasOfImprovement || "",
    submissionLatitude: data.submissionLatitude ?? null,
    submissionLongitude: data.submissionLongitude ?? null,
    isGeoVerified: data.isGeoVerified ?? false,
    geoVerificationNote: data.geoVerificationNote ?? null,
  };

  let assessment;
  if (data.id) {
    assessment = await prisma.assessment.update({
      where: { id: data.id },
      data: payload
    });
  } else {
    assessment = await prisma.assessment.create({
      data: payload
    });
  }

  revalidatePath("/lecturer/students");
  revalidatePath("/lecturer/dashboard");
  revalidatePath("/lecturer/assessments");

  return { success: true, id: assessment.id };
}
