"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function AssessmentDetailClient({ student: propStudent, assessments }: { student?: any; assessments: any[] }) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const student = propStudent || assessments[0]?.student;

  if (!student) {
    return <div className="p-8 text-center text-muted-foreground">Student data unavailable.</div>;
  }

  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = printRef.current;
    if (!element) return;

    // Remove hidden class from PDF container before printing
    element.classList.remove("hidden");

    const opt = {
      margin: 10,
      filename: `TMU_Assessment_${student.admissionNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt as any).from(element).save();

    // Hide it again after printing
    element.classList.add("hidden");
  };

  const getS1 = () => student?.subjects?.[0] || "Subject 1";
  const getS2 = () => student?.subjects?.[1] || "Subject 2";

  const a1s1 = assessments.find(a => a.assessmentNumber === 1 && a.subject === getS1());
  const a1s2 = assessments.find(a => a.assessmentNumber === 1 && a.subject === getS2());
  const a2s1 = assessments.find(a => a.assessmentNumber === 2 && a.subject === getS1());
  const a2s2 = assessments.find(a => a.assessmentNumber === 2 && a.subject === getS2());
  const a3s1 = assessments.find(a => a.assessmentNumber === 3 && a.subject === getS1());
  const a3s2 = assessments.find(a => a.assessmentNumber === 3 && a.subject === getS2());

  const getValue = (assessment: any, key: string) => assessment?.[key] ?? "-";
  const getNum = (assessment: any, key: string) => assessment?.[key] ?? 0;

  const getAvg = (val1: number, val2: number, has1: boolean, has2: boolean) => {
      if (has1 && has2) return ((val1 + val2) / 2).toFixed(1);
      if (has1) return val1.toFixed(1);
      if (has2) return val2.toFixed(1);
      return "-";
  };

  const getGenAvg = (a1Avg: string, a2Avg: string) => {
      const v1 = parseFloat(a1Avg);
      const v2 = parseFloat(a2Avg);
      if (!isNaN(v1) && !isNaN(v2)) return ((v1 + v2) / 2).toFixed(1);
      if (!isNaN(v1)) return v1.toFixed(1);
      if (!isNaN(v2)) return v2.toFixed(1);
      return "-";
  };

  const Row = ({ label, mark, max }: { label: string; mark: string; max: number }) => {
    const v1 = getNum(a1s1, mark);
    const v2 = getNum(a1s2, mark);
    const v3 = getNum(a2s1, mark);
    const v4 = getNum(a2s2, mark);

    const a1Avg = getAvg(v1, v2, !!a1s1, !!a1s2);
    const a2Avg = getAvg(v3, v4, !!a2s1, !!a2s2);

    return (
      <tr className="border-b hover:bg-muted/30">
        <td className="py-2 px-3 text-sm">{label}</td>
        <td className="py-2 px-3 text-center text-sm font-semibold">{max}</td>
        <td className="py-2 px-3 text-center text-sm">{getValue(a1s1, mark)}</td>
        <td className="py-2 px-3 text-center text-sm">{getValue(a1s2, mark)}</td>
        <td className="py-2 px-3 text-center text-sm font-bold bg-primary/5">{a1Avg}</td>
        <td className="py-2 px-3 text-center text-sm">{getValue(a2s1, mark)}</td>
        <td className="py-2 px-3 text-center text-sm">{getValue(a2s2, mark)}</td>
        <td className="py-2 px-3 text-center text-sm font-bold bg-primary/5">{a2Avg}</td>
      </tr>
    );
  };

  const Section = ({ title, marks, children }: { title: string; marks: number; children: React.ReactNode }) => (
    <>
      <tr className="bg-muted font-bold">
        <td colSpan={8} className="py-2 px-3 text-sm text-primary uppercase">{title} ({marks} Marks)</td>
      </tr>
      {children}
    </>
  );

  const t1 = getNum(a1s1, 'totalMarks');
  const t2 = getNum(a1s2, 'totalMarks');
  const t3 = getNum(a2s1, 'totalMarks');
  const t4 = getNum(a2s2, 'totalMarks');

  const tA1Avg = getAvg(t1, t2, !!a1s1, !!a1s2);
  const tA2Avg = getAvg(t3, t4, !!a2s1, !!a2s2);
  const genAvg = getGenAvg(tA1Avg, tA2Avg);

  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="mb-2"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">Comprehensive performance review for {student.user.name}</p>
        </div>
        <Button onClick={handleDownloadPdf} className="bg-primary hover:bg-primary/90 text-primary-foreground"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 bg-primary/5 border-b flex flex-wrap gap-6 items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Student Name</p>
            <p className="text-xl font-bold">{student.user.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admission No.</p>
            <p className="font-medium">{student.admissionNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Course</p>
            <p className="font-medium">{student.course}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">School</p>
            <p className="font-medium">{student.school?.name || "Not Assigned"}</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="py-3 px-3 font-semibold text-sm w-1/3 rounded-tl-lg">Assessment Criteria</th>
                <th className="py-3 px-3 font-semibold text-sm text-center">Max</th>
                <th className="py-3 px-3 font-semibold text-sm text-center">A1S1</th>
                <th className="py-3 px-3 font-semibold text-sm text-center">A1S2</th>
                <th className="py-3 px-3 font-semibold text-sm text-center bg-primary/90">A1 Avg</th>
                <th className="py-3 px-3 font-semibold text-sm text-center">A2S1</th>
                <th className="py-3 px-3 font-semibold text-sm text-center">A2S2</th>
                <th className="py-3 px-3 font-semibold text-sm text-center rounded-tr-lg bg-primary/90">A2 Avg</th>
              </tr>
            </thead>
            <tbody>
              <Section title="A. Preparation" marks={12}>
                <Row label="Scheme of Work" mark="schemeOfWorkMark" max={2} />
                <Row label="Lesson Plan: Objectives" mark="lessonPlanObjectives" max={4} />
                <Row label="Lesson Plan: Activities" mark="lessonPlanActivities" max={2} />
                <Row label="Lesson Plan: Sequence" mark="lessonPlanSequence" max={4} />
              </Section>
              <Section title="B. Presentation" marks={80}>
                <Row label="Set Induction Skills" mark="introductionMark" max={5} />
                <Row label="Logical Presentations" mark="logicalPresentation" max={5} />
                <Row label="Relevance of Content" mark="contentRelevance" max={5} />
                <Row label="Adequacy of Content" mark="contentAdequacy" max={5} />
                <Row label="Teaching Strategies" mark="teachingStrategies" max={5} />
                <Row label="Teaching Skills" mark="teachingSkills" max={5} />
                <Row label="Mastery of Content" mark="contentMastery" max={5} />
                <Row label="Communication (Verbal & Non-verbal)" mark="communicationMark" max={5} />
                <Row label="Chalkboard Layout & Use" mark="chalkboardUse" max={3} />
                <Row label="Timing and Attractiveness" mark="resourceTiming" max={3} />
                <Row label="Appropriateness" mark="resourceAppropriateness" max={4} />
                <Row label="Innovativeness" mark="resourceInnovativeness" max={5} />
                <Row label="Control of Learners" mark="learnerControl" max={5} />
                <Row label="Learner Participation" mark="learnerParticipation" max={5} />
                <Row label="Group Work / Indiv. Differences" mark="groupWork" max={4} />
                <Row label="Teacher/Learner Rapport" mark="teacherLearnerRapport" max={5} />
                <Row label="Closure Skills" mark="closureSkills" max={2} />
                <Row label="Concluding Activities" mark="concludingActivities" max={2} />
                <Row label="Assignment" mark="assignmentMark" max={1} />
              </Section>
              <Section title="C & D. Personality & Appraisal" marks={8}>
                <Row label="Teacher Personality" mark="personalityMark" max={5} />
                <Row label="Self Appraisal" mark="selfAppraisalMark" max={3} />
              </Section>
              <tr className="bg-primary/10 border-t-2 border-primary">
                <td className="py-4 px-3 font-bold text-lg text-primary">TOTAL MARKS</td>
                <td className="py-4 px-3 text-center font-bold text-lg">100</td>
                <td className="py-4 px-3 text-center font-bold text-lg">{t1 || "-"}</td>
                <td className="py-4 px-3 text-center font-bold text-lg">{t2 || "-"}</td>
                <td className="py-4 px-3 text-center font-bold text-lg bg-primary/20">{tA1Avg}</td>
                <td className="py-4 px-3 text-center font-bold text-lg">{t3 || "-"}</td>
                <td className="py-4 px-3 text-center font-bold text-lg">{t4 || "-"}</td>
                <td className="py-4 px-3 text-center font-bold text-lg bg-primary/20">{tA2Avg}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-muted/20 border-t">
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Gen Average</p>
              <p className="text-4xl font-black text-primary mt-1">{genAvg}<span className="text-lg text-muted-foreground font-medium">/100</span></p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase text-muted-foreground">A1 Average</p>
              <p className="text-2xl font-bold mt-1">{tA1Avg}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase text-muted-foreground">A2 Average</p>
              <p className="text-2xl font-bold mt-1">{tA2Avg}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[a1s1, a1s2, a2s1, a2s2].map((a, i) => (
          <div key={i} className="bg-card border rounded-xl p-4 shadow-sm">
            <h4 className="font-bold text-primary mb-3">
              {i === 0 ? "A1S1" : i === 1 ? "A1S2" : i === 2 ? "A2S1" : "A2S2"} Remarks
            </h4>
            {a ? (
              <div className="space-y-3 text-sm">
                <div><span className="font-semibold block text-emerald-600">Strengths:</span> <span className="text-muted-foreground">{a.areasOfStrength || "—"}</span></div>
                <div><span className="font-semibold block text-amber-600">Improvement:</span> <span className="text-muted-foreground">{a.areasOfImprovement || "—"}</span></div>
                <div><span className="font-semibold block text-blue-600">General:</span> <span className="text-muted-foreground">{a.generalComments || "—"}</span></div>
                <div className="text-xs text-muted-foreground border-t pt-2 mt-2">By: {a.lecturer?.user?.name}</div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not assessed yet.</p>
            )}
          </div>
        ))}
      </div>

      {/* Hidden PDF container */}
      <div className="hidden">
        <div ref={printRef} style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "15px", borderBottom: "2px solid #9A1E31", paddingBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
              <div style={{ width: "50px", height: "50px", position: "relative" }}>
                <img src="/tmu-logo.png" alt="TMU Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} crossOrigin="anonymous" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "16px", color: "#9A1E31", fontWeight: "900", textTransform: "uppercase" }}>Tom Mboya University</h1>
                <h2 style={{ margin: 0, fontSize: "12px", color: "#1f2937", fontWeight: "bold" }}>Teaching Practice Assessment Report</h2>
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "15px", background: "#f8fafc", padding: "10px", border: "1px solid #e2e8f0" }}>
            <DBlock label="STUDENT NAME" value={student.user.name} />
            <DBlock label="ADMISSION NO" value={student.admissionNumber} />
            <DBlock label="COURSE" value={student.course} />
            <DBlock label="SCHOOL" value={student.school?.name || "Not Assigned"} />
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "9px" }}>
            <thead>
              <tr style={{ background: "#9A1E31", color: "#fff" }}>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "left", width: "30%" }}>Criteria</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>Max</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>A1S1</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>A1S2</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center", background: "#7A1827" }}>A1 AVG</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>A2S1</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>A2S2</th>
                <th style={{ padding: "4px", border: "1px solid #000", textAlign: "center", background: "#7A1827" }}>A2 AVG</th>
              </tr>
            </thead>
            <tbody>
              <PdfSection title="A. Preparation" marks={12} />
              <PdfRow label="Scheme of Work" mark="schemeOfWorkMark" max={2} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Lesson Plan: Objectives" mark="lessonPlanObjectives" max={4} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Lesson Plan: Activities" mark="lessonPlanActivities" max={2} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Lesson Plan: Sequence" mark="lessonPlanSequence" max={4} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              
              <PdfSection title="B. Presentation" marks={80} />
              <PdfRow label="Set Induction Skills" mark="introductionMark" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Logical Presentations" mark="logicalPresentation" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Relevance of Content" mark="contentRelevance" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Adequacy of Content" mark="contentAdequacy" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Teaching Strategies" mark="teachingStrategies" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Teaching Skills" mark="teachingSkills" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Mastery of Content" mark="contentMastery" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Communication" mark="communicationMark" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Chalkboard Layout & Use" mark="chalkboardUse" max={3} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Timing and Attractiveness" mark="resourceTiming" max={3} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Appropriateness" mark="resourceAppropriateness" max={4} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Innovativeness" mark="resourceInnovativeness" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Control of Learners" mark="learnerControl" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Learner Participation" mark="learnerParticipation" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Group Work" mark="groupWork" max={4} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Teacher/Learner Rapport" mark="teacherLearnerRapport" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Closure Skills" mark="closureSkills" max={2} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Concluding Activities" mark="concludingActivities" max={2} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Assignment" mark="assignmentMark" max={1} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              
              <PdfSection title="C & D. Personality & Appraisal" marks={8} />
              <PdfRow label="Teacher Personality" mark="personalityMark" max={5} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              <PdfRow label="Self Appraisal" mark="selfAppraisalMark" max={3} a1s1={a1s1} a1s2={a1s2} a2s1={a2s1} a2s2={a2s2} />
              
              <tr style={{ background: "#f1f5f9" }}>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "right" }}>TOTAL MARKS</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>100</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>{t1 || "-"}</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>{t2 || "-"}</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center", background: "#e2e8f0" }}>{tA1Avg}</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>{t3 || "-"}</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>{t4 || "-"}</td>
                <td style={{ padding: "6px", border: "1px solid #000", fontWeight: "bold", textAlign: "center", background: "#e2e8f0" }}>{tA2Avg}</td>
              </tr>
              <tr>
                <td colSpan={8} style={{ padding: "10px", border: "1px solid #000", fontWeight: "bold", textAlign: "center", background: "#f8fafc", fontSize: "14px", color: "#9A1E31" }}>
                  GENERAL AVERAGE: {genAvg} / 100
                </td>
              </tr>
            </tbody>
          </table>

          {/* Lecturer Location / GPS Verification */}
          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ fontSize: "10px", fontWeight: "bold", color: "#9A1E31", borderBottom: "1px solid #9A1E31", paddingBottom: "4px", marginBottom: "8px", textTransform: "uppercase" }}>
              Lecturer Location / GPS Verification
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
              <thead>
                <tr style={{ background: "#1f2937", color: "#fff" }}>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Slot</th>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Lecturer</th>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Subject</th>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Lecturer Lat</th>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Lecturer Lng</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Accuracy</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Distance</th>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Verified</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {[ 
                  { label: "A1S1", a: a1s1, subject: getS1() },
                  { label: "A1S2", a: a1s2, subject: getS2() },
                  { label: "A2S1", a: a2s1, subject: getS1() },
                  { label: "A2S2", a: a2s2, subject: getS2() },
                { label: "A3S1", a: a3s1, subject: getS1() },
                { label: "A3S2", a: a3s2, subject: getS2() },
                ].map(({ label, a, subject }) => (
                  <tr key={label}>
                    <td style={{ padding: "3px", border: "1px solid #000", fontWeight: "bold" }}>{label}</td>
                    <td style={{ padding: "3px", border: "1px solid #000" }}>{a?.lecturer?.user?.name || "—"}</td>
                    <td style={{ padding: "3px", border: "1px solid #000" }}>{subject}</td>
                    <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>
                      {a?.submissionLatitude != null ? (a.submissionLatitude as number).toFixed(5) : "—"}
                    </td>
                    <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>
                      {a?.submissionLongitude != null ? (a.submissionLongitude as number).toFixed(5) : "—"}
                    </td>
                  <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>
                    {a?.gpsAccuracy != null ? `${Math.round(a.gpsAccuracy as number)}m` : "—"}
                  </td>
                  <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>
                    {a?.submissionLatitude != null && student?.school?.latitude != null
                      ? `${Math.round(
                          ((a: any, school: any) => {
                            const R = 6371000;
                            const dLat = (school.latitude - a.submissionLatitude) * Math.PI / 180;
                            const dLon = (school.longitude - a.submissionLongitude) * Math.PI / 180;
                            const lat1 = a.submissionLatitude * Math.PI / 180;
                            const lat2 = school.latitude * Math.PI / 180;
                            const aa = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
                            return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
                          })(a, student.school)
                        )}m`
                      : "—"}
                  </td>
                    <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>
                      {a ? (a.isGeoVerified ? "✅ Yes" : "❌ No") : "—"}
                    </td>
                  <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>
                    {a ? (
                      a.isGeoVerified
                        ? <span style={{ background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "7px", fontWeight: "bold" }}>✓ VERIFIED</span>
                        : <span style={{ background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "7px", fontWeight: "bold" }}>✗ MISMATCH</span>
                    ) : "—"}
                  </td>
                    <td style={{ padding: "3px", border: "1px solid #000", fontSize: "7px" }}>
                      {a?.geoVerificationNote || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Student School Location for comparison */}
            {student?.school?.latitude != null && student?.school?.longitude != null && (
              <div style={{ marginTop: "6px", padding: "6px", background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: "8px" }}>
                <strong>Student School Location:</strong> {student.school.name} — 
                Lat: {(student.school.latitude as number).toFixed(5)}, Lng: {(student.school.longitude as number).toFixed(5)}
                {student.school.geofenceRadius != null && ` (Geofence: ${student.school.geofenceRadius}m)`}
              </div>
            )}
          </div>

          {/* Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "30px" }}>
            <SigBlock label="ASSESSOR's SIGNATURE & DATE" />
            <SigBlock label="CANDIDATE's SIGNATURE & DATE" />
            <SigBlock label="COORDINATOR's SIGNATURE & DATE" />
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #1f2937", marginTop: "30px", paddingTop: "10px", textAlign: "center" }}>
            <span style={{ fontSize: "8px", color: "#4b5563" }}>Generated by TMU Teaching Practice System • {dateFormatted} • Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "7px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "10px", fontWeight: "bold", color: "#1f2937" }}>{value}</div>
    </div>
  );
}

function SigBlock({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ borderBottom: "1px solid #1f2937", marginBottom: "8px", height: "25px" }}></div>
      <div style={{ fontSize: "7px", fontWeight: "bold", color: "#1f2937", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function PdfSection({ title, marks }: { title: string; marks: number }) {
  return (
    <tr style={{ background: "#f1f5f9" }}>
      <td colSpan={8} style={{ padding: "4px", border: "1px solid #000", fontWeight: "bold", fontSize: "8px", color: "#9A1E31", textTransform: "uppercase" }}>
        {title} ({marks} Marks)
      </td>
    </tr>
  );
}

function PdfRow({ label, mark, max, a1s1, a1s2, a2s1, a2s2 }: { label: string; mark: string; max: number; a1s1: any; a1s2: any; a2s1: any; a2s2: any }) {
  const v1 = a1s1?.[mark] ?? 0;
  const v2 = a1s2?.[mark] ?? 0;
  const v3 = a2s1?.[mark] ?? 0;
  const v4 = a2s2?.[mark] ?? 0;

  const getAvg = (val1: number, val2: number, has1: boolean, has2: boolean) => {
      if (has1 && has2) return ((val1 + val2) / 2).toFixed(1);
      if (has1) return val1.toFixed(1);
      if (has2) return val2.toFixed(1);
      return "-";
  };

  const a1Avg = getAvg(v1, v2, !!a1s1, !!a1s2);
  const a2Avg = getAvg(v3, v4, !!a2s1, !!a2s2);

  return (
    <tr>
      <td style={{ padding: "4px", border: "1px solid #000" }}>{label}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{max}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>{a1s1?.[mark] ?? "-"}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>{a1s2?.[mark] ?? "-"}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center", fontWeight: "bold", background: "#f8fafc" }}>{a1Avg}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>{a2s1?.[mark] ?? "-"}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center" }}>{a2s2?.[mark] ?? "-"}</td>
      <td style={{ padding: "4px", border: "1px solid #000", textAlign: "center", fontWeight: "bold", background: "#f8fafc" }}>{a2Avg}</td>
    </tr>
  );
}
