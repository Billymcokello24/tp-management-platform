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
    <div className="space-y-6 max-w-5xl mx-auto mb-20">
      {/* Non-printable controls */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
        </Button>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
          <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* Printable Area - Premium Institutional Design */}
      <div className="bg-white text-black p-8 sm:p-12 border border-slate-200 shadow-xl rounded-2xl print:p-0 print:border-none print:shadow-none print:rounded-none relative overflow-hidden print-container">
        {/* Subtle Watermark (Visible only in print/PDF) */}
        <div className="hidden print:flex absolute inset-0 opacity-[0.03] pointer-events-none items-center justify-center z-0">
          <img src="/tmu-logo.png?v=2" alt="Watermark" className="w-[80%] max-w-[600px] object-contain grayscale" />
        </div>

        <div className="relative z-10">
          {/* Institutional Header */}
          <div className="flex items-center justify-between border-b-4 border-primary print:border-[#9A1E31] pb-6 mb-8">
            <div className="flex items-center gap-6">
              <img src="/tmu-logo.png?v=2" alt="TMU Logo" className="h-28 w-28 object-contain print:h-24 print:w-24" />
              <div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-primary print:text-[#9A1E31] mb-1">Tom Mboya University</h1>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600">Office of the Teaching Practice Coordinator</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">P.O. Box 199 - 40300, Homa Bay, Kenya</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Official Evaluation Report</p>
                <p className="text-sm font-bold text-slate-800 font-mono">REF: TP-{assessment.id.substring(0,8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Student & Assessor Details Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 print:bg-transparent print:border-y print:border-x-0 print:border-slate-300 print:rounded-none">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Candidate Name</span>
                  <span className="font-bold text-slate-900">{assessment.student.user.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Admission Number</span>
                  <span className="font-bold text-slate-900">{assessment.student.admissionNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Programme / Course</span>
                  <span className="font-bold text-slate-900">{assessment.student.course}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Assessor Name</span>
                  <span className="font-bold text-slate-900">{assessment.lecturer.user.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">School Attached</span>
                  <span className="font-bold text-slate-900">{assessment.student.school?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Date of Assessment</span>
                  <span className="font-bold text-slate-900">{new Date(assessment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Score Ribbon */}
          <div className="flex items-center justify-between bg-primary text-primary-foreground print:bg-slate-100 print:text-black p-6 rounded-xl mb-10 print-avoid-break print:border print:border-slate-300 shadow-md print:shadow-none">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 print:bg-white border-2 border-white/30 print:border-[#9A1E31] flex items-center justify-center shrink-0">
                <span className="text-2xl font-black">{assessment.grade || "N/A"}</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 print:text-slate-500">Classification</p>
                <p className="text-xl font-extrabold mt-1">{assessment.performanceBand || "Pending Evaluation"}</p>
              </div>
            </div>
            <div className="text-right border-l border-white/20 print:border-slate-300 pl-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 print:text-slate-500">Total Marks Awarded</p>
              <div className="flex items-baseline gap-1 mt-1 justify-end">
                <span className="text-4xl font-black">{assessment.totalMarks}</span>
                <span className="text-lg font-medium opacity-70">/ 100</span>
              </div>
            </div>
          </div>

          {/* Comprehensive Rubric Table */}
          <div className="mb-10 print:text-[13px]">
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-6">Detailed Assessment Rubric</h3>
            
            <div className="space-y-6">
              <Section title="A. Preparation (12 Marks)">
                <Row label="Scheme of Work (Max 2)" score={assessment.schemeOfWorkMark} max={2} />
                <Row label="Lesson Plan: Objectives (Max 4)" score={assessment.lessonPlanObjectives} max={4} />
                <Row label="Lesson Plan: Activities (Max 2)" score={assessment.lessonPlanActivities} max={2} />
                <Row label="Lesson Plan: Sequence (Max 4)" score={assessment.lessonPlanSequence} max={4} />
              </Section>

              <Section title="B. Presentation (80 Marks)">
                <div className="ml-4 border-l-2 border-slate-200 pl-4 space-y-5 my-4">
                  <SubSection title="1. Introduction (5 Marks)">
                    <Row label="Set Induction Skills" score={assessment.introductionMark} max={5} />
                  </SubSection>
                  <SubSection title="2. Lesson Development (30 Marks)">
                    <Row label="Logical Presentations of Contents" score={assessment.logicalPresentation} max={5} />
                    <Row label="Relevance of Content" score={assessment.contentRelevance} max={5} />
                    <Row label="Adequacy of Content to Time" score={assessment.contentAdequacy} max={5} />
                    <Row label="Teaching Strategies & Methods" score={assessment.teachingStrategies} max={5} />
                    <Row label="Teaching Skills (Motivation, Questioning)" score={assessment.teachingSkills} max={5} />
                    <Row label="Mastery of Content" score={assessment.contentMastery} max={5} />
                  </SubSection>
                  <SubSection title="3. Communication (5 Marks)">
                    <Row label="Verbal & Non-verbal Communication" score={assessment.communicationMark} max={5} />
                  </SubSection>
                  <SubSection title="4. Resource Materials (15 Marks)">
                    <Row label="Chalkboard Layout & Use" score={assessment.chalkboardUse} max={3} />
                    <Row label="Timing and Attractiveness" score={assessment.resourceTiming} max={3} />
                    <Row label="Appropriateness" score={assessment.resourceAppropriateness} max={4} />
                    <Row label="Innovativeness & Originality" score={assessment.resourceInnovativeness} max={5} />
                  </SubSection>
                  <SubSection title="5. Classroom Management (20 Marks)">
                    <Row label="Control and Knowledge of Learners" score={assessment.learnerControl} max={5} />
                    <Row label="Learner Participation" score={assessment.learnerParticipation} max={5} />
                    <Row label="Group Work / Individual Differences" score={assessment.groupWork} max={4} />
                    <Row label="Teacher/Learner Rapport" score={assessment.teacherLearnerRapport} max={5} />
                  </SubSection>
                  <SubSection title="6. Conclusion (5 Marks)">
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
            </div>
          </div>

          {/* Qualitative Assessor Comments */}
          <div className="print-page-break print:mt-12">
            <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-6">Qualitative Remarks</h3>
            
            <div className="grid gap-6">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Areas of Strength</h4>
                </div>
                <div className="p-4 bg-white text-slate-800 text-sm leading-relaxed min-h-[80px]">
                  {assessment.areasOfStrength || <span className="text-slate-400 italic">No specific strengths recorded.</span>}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Areas of Improvement</h4>
                </div>
                <div className="p-4 bg-white text-slate-800 text-sm leading-relaxed min-h-[80px]">
                  {assessment.areasOfImprovement || <span className="text-slate-400 italic">No specific areas of improvement recorded.</span>}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">General Comments</h4>
                </div>
                <div className="p-4 bg-white text-slate-800 text-sm leading-relaxed min-h-[80px]">
                  {assessment.generalComments || <span className="text-slate-400 italic">No general comments provided.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200 print-avoid-break">
            <div className="grid grid-cols-2 gap-16">
              <div className="text-center">
                <div className="border-b border-slate-800 pb-10 mb-2">
                  {/* Space for actual signature */}
                </div>
                <p className="font-bold text-sm text-slate-800">{assessment.lecturer.user.name}</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">Assessor Signature & Date</p>
              </div>
              <div className="text-center">
                <div className="border-b border-slate-800 pb-10 mb-2">
                  {/* Space for actual signature */}
                </div>
                <p className="font-bold text-sm text-slate-800">{assessment.student.user.name}</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">Candidate Signature & Date</p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                This document is invalid without the official signature of the designated university assessor.
              </p>
            </div>
          </div>
        </div>
      </div>
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
