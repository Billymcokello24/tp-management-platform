import { notFound } from "next/navigation";
import { getStudentForAssessment } from "../../../_actions/assessments";
import { AssessmentFormClient } from "./assessment-form-client";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function NewAssessmentPage({ params }: PageProps) {
  const { studentId } = await params;

  try {
    const { student, lecturerId, assessments } = await getStudentForAssessment(studentId);
    
    // Serialize assessments for the client
    const serializedAssessments = assessments.map((a: any) => ({
      id: a.id,
      status: a.status,
      assessmentNumber: a.assessmentNumber || 1,
      subject: a.subject || null,
      totalMarks: a.totalMarks,
      grade: a.grade,
      performanceBand: a.performanceBand,
      createdAt: a.createdAt.toISOString(),
      // All mark fields
      schemeOfWorkMark: a.schemeOfWorkMark,
      lessonPlanObjectives: a.lessonPlanObjectives,
      lessonPlanActivities: a.lessonPlanActivities,
      lessonPlanSequence: a.lessonPlanSequence,
      introductionMark: a.introductionMark,
      logicalPresentation: a.logicalPresentation,
      contentRelevance: a.contentRelevance,
      contentAdequacy: a.contentAdequacy,
      teachingStrategies: a.teachingStrategies,
      teachingSkills: a.teachingSkills,
      contentMastery: a.contentMastery,
      communicationMark: a.communicationMark,
      chalkboardUse: a.chalkboardUse,
      resourceTiming: a.resourceTiming,
      resourceAppropriateness: a.resourceAppropriateness,
      resourceInnovativeness: a.resourceInnovativeness,
      learnerControl: a.learnerControl,
      learnerParticipation: a.learnerParticipation,
      groupWork: a.groupWork,
      teacherLearnerRapport: a.teacherLearnerRapport,
      closureSkills: a.closureSkills,
      concludingActivities: a.concludingActivities,
      assignmentMark: a.assignmentMark,
      personalityMark: a.personalityMark,
      selfAppraisalMark: a.selfAppraisalMark,
      generalComments: a.generalComments || "",
      areasOfStrength: a.areasOfStrength || "",
      areasOfImprovement: a.areasOfImprovement || "",
    }));

    const serializedStudent = {
      id: student.id,
      name: student.user.name,
      admissionNumber: student.admissionNumber,
      course: student.course,
      subjects: student.subjects || [],
      schoolName: student.school?.name || "N/A",
      schoolLatitude: student.school?.latitude ?? null,
      schoolLongitude: student.school?.longitude ?? null,
      schoolGeofenceRadius: student.school?.geofenceRadius ?? 500,
    };

    return (
      <AssessmentFormClient
        student={serializedStudent}
        lecturerId={lecturerId}
        existingAssessments={serializedAssessments}
      />
    );
  } catch (error) {
    // If student not found or unauthorized
    notFound();
  }
}
