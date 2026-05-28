"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AssessmentDetailClient({ assessment }: { assessment: any }) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto mb-20">
      {/* Non-printable controls */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
        </Button>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
          <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* Printable Area */}
      <Card className="print:shadow-none print:border-none rounded-none sm:rounded-2xl border border-border/50 shadow-sm bg-card overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          
          {/* Header */}
          <div className="text-center mb-8 border-b border-border/50 pb-6">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 text-foreground">Tom Mboya University</h1>
            <h2 className="text-lg font-semibold uppercase text-muted-foreground">Teaching Practice Assessment Tool</h2>
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-8 text-sm">
            <div className="space-y-1">
              <p><span className="font-semibold text-muted-foreground">Student Name:</span> {assessment.student.user.name}</p>
              <p><span className="font-semibold text-muted-foreground">Admission No:</span> {assessment.student.admissionNumber}</p>
              <p><span className="font-semibold text-muted-foreground">Course:</span> {assessment.student.course}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-semibold text-muted-foreground">Assessor Name:</span> {assessment.lecturer.user.name}</p>
              <p><span className="font-semibold text-muted-foreground">School Attached:</span> {assessment.student.school?.name || "N/A"}</p>
              <p><span className="font-semibold text-muted-foreground">Assessment Date:</span> {new Date(assessment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Final Score Banner */}
          <div className="flex items-center justify-between bg-primary/10 p-5 rounded-2xl mb-8 print-avoid-break border border-primary/20 shadow-inner">
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Final Grade</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{assessment.grade || "N/A"} - <span className="text-muted-foreground font-medium text-lg">{assessment.performanceBand || "Pending"}</span></p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Total Score</p>
              <p className="text-4xl font-extrabold text-primary mt-1">{assessment.totalMarks} <span className="text-xl text-primary/60 font-medium">/ 100</span></p>
            </div>
          </div>

          {/* Rubric Breakdown */}
          <div className="space-y-8 print:text-xs">
            
            <Section title="A. Preparation (12 Marks)">
              <Row label="Scheme of Work (Max 2)" score={assessment.schemeOfWorkMark} max={2} />
              <Row label="Lesson Plan: Objectives (Max 4)" score={assessment.lessonPlanObjectives} max={4} />
              <Row label="Lesson Plan: Activities (Max 2)" score={assessment.lessonPlanActivities} max={2} />
              <Row label="Lesson Plan: Sequence (Max 4)" score={assessment.lessonPlanSequence} max={4} />
            </Section>

            <Section title="B. Presentation (80 Marks)">
              <div className="ml-4 space-y-4">
                <SubSection title="1. Introduction (5)">
                  <Row label="Set Induction Skills" score={assessment.introductionMark} max={5} />
                </SubSection>
                <SubSection title="2. Lesson Development (30)">
                  <Row label="Logical Presentations of Contents" score={assessment.logicalPresentation} max={5} />
                  <Row label="Relevance of Content" score={assessment.contentRelevance} max={5} />
                  <Row label="Adequacy of Content to Time" score={assessment.contentAdequacy} max={5} />
                  <Row label="Teaching Strategies & Methods" score={assessment.teachingStrategies} max={5} />
                  <Row label="Teaching Skills (Motivation, Questioning)" score={assessment.teachingSkills} max={5} />
                  <Row label="Mastery of Content" score={assessment.contentMastery} max={5} />
                </SubSection>
                <SubSection title="3. Communication (5)">
                  <Row label="Verbal & Non-verbal Communication" score={assessment.communicationMark} max={5} />
                </SubSection>
                <SubSection title="4. Resource Materials (15)">
                  <Row label="Chalkboard Layout & Use" score={assessment.chalkboardUse} max={3} />
                  <Row label="Timing and Attractiveness" score={assessment.resourceTiming} max={3} />
                  <Row label="Appropriateness" score={assessment.resourceAppropriateness} max={4} />
                  <Row label="Innovativeness & Originality" score={assessment.resourceInnovativeness} max={5} />
                </SubSection>
                <SubSection title="5. Classroom Management (20)">
                  <Row label="Control and Knowledge of Learners" score={assessment.learnerControl} max={5} />
                  <Row label="Learner Participation" score={assessment.learnerParticipation} max={5} />
                  <Row label="Group Work / Individual Differences" score={assessment.groupWork} max={4} />
                  <Row label="Teacher/Learner Rapport" score={assessment.teacherLearnerRapport} max={5} />
                </SubSection>
                <SubSection title="6. Conclusion (5)">
                  <Row label="Closure Skills (Review, Questions)" score={assessment.closureSkills} max={2} />
                  <Row label="Concluding Activities (Evaluation)" score={assessment.concludingActivities} max={2} />
                  <Row label="Assignment" score={assessment.assignmentMark} max={1} />
                </SubSection>
              </div>
            </Section>

            <Section title="C. Teacher Personality (5 Marks)">
              <Row label="Confidence, Dressing, Mannerisms" score={assessment.personalityMark} max={5} />
            </Section>

            <Section title="D. Self Appraisal (3 Marks)">
              <Row label="Use of Previous Comments" score={assessment.selfAppraisalMark} max={3} />
            </Section>

            {/* Comments Section */}
            <div className="mt-12 pt-6 border-t print-avoid-break">
              <h3 className="text-lg font-bold mb-4 uppercase">Assessor Comments</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Areas of Strength</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-sm border min-h-[80px]">
                    {assessment.areasOfStrength || "No specific strengths recorded."}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Areas of Improvement</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-sm border min-h-[80px]">
                    {assessment.areasOfImprovement || "No specific areas of improvement recorded."}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">General Comments</h4>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-sm border min-h-[80px]">
                    {assessment.generalComments || "No general comments provided."}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-16 pt-8">
                <div>
                  <div className="border-b border-black dark:border-white pb-2 mb-2"></div>
                  <p className="text-xs uppercase text-muted-foreground text-center">Assessor Signature & Date</p>
                </div>
                <div>
                  <div className="border-b border-black dark:border-white pb-2 mb-2"></div>
                  <p className="text-xs uppercase text-muted-foreground text-center">Student Signature & Date</p>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper UI Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="print-avoid-break">
      <h3 className="font-bold border-b pb-1 mb-3 text-sm uppercase bg-muted px-2 py-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold text-sm mb-2 text-muted-foreground italic">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, score, max }: { label: string; score: number; max: number }) {
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-200 dark:border-slate-800 last:border-0 pl-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{score} <span className="text-muted-foreground text-xs font-sans">/ {max}</span></span>
    </div>
  );
}
