import { getAllAssessments, getAssessmentStats } from "../_actions/assessments";
import { AssessmentsClient } from "./assessments-client";

export default async function AssessmentsPage() {
  const [assessments, stats] = await Promise.all([
    getAllAssessments(),
    getAssessmentStats(),
  ]);

  const serialized = assessments.map((a) => ({
    id: a.id,
    studentName: a.student.user.name,
    admissionNumber: a.student.admissionNumber,
    lecturerName: a.lecturer.user.name,
    status: a.status,
    totalMarks: a.totalMarks,
    grade: a.grade || "N/A",
    performanceBand: a.performanceBand || "N/A",
    generalComments: a.generalComments || "",
    areasOfStrength: a.areasOfStrength || "",
    areasOfImprovement: a.areasOfImprovement || "",
    // Tom Mboya Specific Rubric Marks for Export
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
    createdAt: a.createdAt.toISOString(),
  }));

  return <AssessmentsClient assessments={serialized} stats={stats} />;
}
