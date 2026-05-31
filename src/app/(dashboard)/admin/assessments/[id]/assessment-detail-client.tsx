"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Rubric definition for the table rows
const rubricSections = [
  { type: "group", title: "A. PREPARATION (12 Marks)" },
  { type: "row", idx: "1", title: "Scheme of Work", key: "schemeOfWorkMark", max: 2 },
  { type: "row", idx: "2", title: "Lesson Plan: Objectives", key: "lessonPlanObjectives", max: 4 },
  { type: "row", idx: "3", title: "Lesson Plan: Activities", key: "lessonPlanActivities", max: 2 },
  { type: "row", idx: "4", title: "Lesson Plan: Sequence", key: "lessonPlanSequence", max: 4 },
  { type: "group", title: "B. PRESENTATION (80 Marks)" },
  { type: "sub", title: "1. Introduction (5 Marks)" },
  { type: "row", idx: "5", title: "Set Induction Skills", key: "introductionMark", max: 5 },
  { type: "sub", title: "2. Lesson Development (30 Marks)" },
  { type: "row", idx: "6", title: "Logical Presentations", key: "logicalPresentation", max: 5 },
  { type: "row", idx: "7", title: "Relevance of Content", key: "contentRelevance", max: 5 },
  { type: "row", idx: "8", title: "Adequacy of Content", key: "contentAdequacy", max: 5 },
  { type: "row", idx: "9", title: "Teaching Strategies", key: "teachingStrategies", max: 5 },
  { type: "row", idx: "10", title: "Teaching Skills", key: "teachingSkills", max: 5 },
  { type: "row", idx: "11", title: "Mastery of Content", key: "contentMastery", max: 5 },
  { type: "sub", title: "3. Communication (5 Marks)" },
  { type: "row", idx: "12", title: "Verbal & Non-verbal", key: "communicationMark", max: 5 },
  { type: "sub", title: "4. Resource Materials (15 Marks)" },
  { type: "row", idx: "13", title: "Chalkboard Layout & Use", key: "chalkboardUse", max: 3 },
  { type: "row", idx: "14", title: "Timing and Attractiveness", key: "resourceTiming", max: 3 },
  { type: "row", idx: "15", title: "Appropriateness", key: "resourceAppropriateness", max: 4 },
  { type: "row", idx: "16", title: "Innovativeness", key: "resourceInnovativeness", max: 5 },
  { type: "sub", title: "5. Classroom Management (20 Marks)" },
  { type: "row", idx: "17", title: "Control of Learners", key: "learnerControl", max: 5 },
  { type: "row", idx: "18", title: "Learner Participation", key: "learnerParticipation", max: 5 },
  { type: "row", idx: "19", title: "Group Work / Indiv. Diff.", key: "groupWork", max: 4 },
  { type: "row", idx: "20", title: "Teacher/Learner Rapport", key: "teacherLearnerRapport", max: 5 },
  { type: "sub", title: "6. Conclusion (5 Marks)" },
  { type: "row", idx: "21", title: "Closure Skills", key: "closureSkills", max: 2 },
  { type: "row", idx: "22", title: "Concluding Activities", key: "concludingActivities", max: 2 },
  { type: "row", idx: "23", title: "Assignment", key: "assignmentMark", max: 1 },
  { type: "group", title: "C. TEACHER PERSONALITY (5 Marks)" },
  { type: "row", idx: "24", title: "Confidence, Dressing, Mannerisms", key: "personalityMark", max: 5 },
  { type: "group", title: "D. SELF APPRAISAL (3 Marks)" },
  { type: "row", idx: "25", title: "Use of Previous Comments", key: "selfAppraisalMark", max: 3 },
];

export function AssessmentDetailClient({ assessments }: { assessments: any[] }) {
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isPdf, setIsPdf] = useState(false);

  const student = assessments[0]?.student;
  const studentName = student?.user?.name || "Unknown";
  const studentInitials = studentName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const count = assessments.length;

  // Compute averages
  const getAvg = (key: string) => {
    const vals = assessments.map((a: any) => a[key] as number).filter((v: number) => v != null);
    return vals.length > 0 ? Math.round((vals.reduce((s: number, v: number) => s + v, 0) / vals.length) * 10) / 10 : 0;
  };
  const totalAvg = count > 0 ? Math.round(assessments.reduce((s: number, a: any) => s + a.totalMarks, 0) / count) : 0;

  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    setIsPdf(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const safeName = studentName.replace(/\s+/g, "_");
      const logoImg = document.getElementById("tmu-logo-hidden") as HTMLImageElement;
      let logoDataUrl = "";
      if (logoImg) {
        const canvas = document.createElement("canvas");
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.drawImage(logoImg, 0, 0); logoDataUrl = canvas.toDataURL("image/png"); }
      }
      const worker = html2pdf().set({
        margin: [38, 8, 15, 8],
        filename: `TMU_Assessment_${safeName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 1100 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" as const },
        pagebreak: { mode: ["css", "legacy"] },
      } as any).from(pdfRef.current).toPdf();
      await worker.get('pdf').then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          if (logoDataUrl) pdf.addImage(logoDataUrl, 'PNG', 138, 3, 20, 20);
          pdf.setFontSize(14); pdf.setTextColor(0, 0, 0); pdf.setFont("helvetica", "bold");
          pdf.text("TOM MBOYA UNIVERSITY", 148.5, 28, { align: "center" });
          pdf.setFontSize(7); pdf.setTextColor(75, 85, 99); pdf.setFont("helvetica", "bold");
          pdf.text("Office of the Teaching Practice Coordinator — P.O. Box 199 - 40300, Homa Bay", 148.5, 32, { align: "center" });
          pdf.setDrawColor(154, 30, 49); pdf.setLineWidth(0.5); pdf.line(8, 34, 289, 34);
          if (logoDataUrl) {
            pdf.setGState(new (pdf.GState || (window as any).jsPDF.GState)({ opacity: 0.04 }));
            pdf.addImage(logoDataUrl, 'PNG', 88, 68, 120, 120);
            pdf.setGState(new (pdf.GState || (window as any).jsPDF.GState)({ opacity: 1.0 }));
          }
          pdf.setDrawColor(31, 41, 55); pdf.setLineWidth(0.2); pdf.line(8, 200, 289, 200);
          pdf.setFontSize(6); pdf.setTextColor(75, 85, 99); pdf.setFont("helvetica", "normal");
          const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          pdf.text(`Generated by TMU Teaching Practice System • ${dateStr} • Confidential • Page ${i} of ${totalPages}`, 148.5, 204, { align: "center" });
        }
      });
      await worker.save();
    } catch (error) { console.error("PDF generation failed:", error); }
    finally { setIsPdf(false); setDownloading(false); }
  };

  const p = (v: boolean) => v ? "4px" : "8px"; // padding helper
  const fs = (v: boolean) => v ? "8px" : "10px"; // font size helper

  return (
    <div className="space-y-6 max-w-7xl mx-auto mb-20">
      <img id="tmu-logo-hidden" src="/tmu-logo.png" alt="" style={{ display: "none" }} crossOrigin="anonymous" />
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleDownload} disabled={downloading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm gap-2">
          {downloading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Download className="h-4 w-4" /> Download PDF</>}
        </Button>
      </div>

      {/* PDF Content */}
      <div ref={pdfRef} style={{ background: "#fff", color: "#000", fontFamily: "Arial, sans-serif", padding: isPdf ? "0px" : "30px", borderRadius: isPdf ? "0" : "16px", border: isPdf ? "none" : "1px solid #e2e8f0", boxShadow: isPdf ? "none" : "0 8px 32px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
        
        {/* Watermark */}
        {!isPdf && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0 }}>
            <img src="/tmu-logo.png?v=2" alt="" style={{ width: "500px" }} />
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header (web only) */}
          {!isPdf && (
            <>
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <img src="/tmu-logo.png?v=2" alt="TMU" style={{ height: "65px", margin: "0 auto", objectFit: "contain" }} />
                <h1 style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px", color: "#000", marginTop: "8px", textTransform: "uppercase" }}>Tom Mboya University</h1>
                <p style={{ fontSize: "9px", color: "#4b5563", fontWeight: "bold" }}>Office of the Teaching Practice Coordinator — P.O. Box 199 - 40300, Homa Bay</p>
              </div>
              <div style={{ borderTop: "2px solid #9A1E31", marginBottom: "12px" }}></div>
            </>
          )}

          {/* Title Banner */}
          <div style={{ background: "#faf1f2", padding: isPdf ? "8px" : "12px", textAlign: "center", marginBottom: isPdf ? "12px" : "20px" }}>
            <h2 style={{ fontSize: isPdf ? "12px" : "14px", fontWeight: "bold", color: "#9A1E31", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
              Consolidated Teaching Practice Assessment Report
            </h2>
          </div>

          {/* Candidate Details */}
          <div style={{ display: "flex", gap: isPdf ? "12px" : "20px", marginBottom: isPdf ? "15px" : "25px", alignItems: "center" }}>
            <div style={{ width: isPdf ? "50px" : "65px", height: isPdf ? "50px" : "65px", border: "2px solid #9A1E31", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: isPdf ? "18px" : "22px", fontWeight: "bold", color: "#9A1E31" }}>{studentInitials}</span>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isPdf ? "8px" : "16px", borderLeft: "1px solid #e5e7eb", paddingLeft: isPdf ? "12px" : "20px" }}>
              <DBlock label="CANDIDATE NAME" value={studentName} small={isPdf} />
              <DBlock label="ADMISSION NUMBER" value={student?.admissionNumber || "N/A"} small={isPdf} />
              <DBlock label="PROGRAMME / COURSE" value={student?.course || "N/A"} small={isPdf} />
              <DBlock label="SCHOOL ATTACHED" value={student?.school?.name || "N/A"} small={isPdf} />
              <DBlock label="ASSESSMENTS COMPLETED" value={`${count} of 3`} small={isPdf} />
              <DBlock label="OVERALL AVERAGE" value={`${totalAvg}/100`} small={isPdf} />
            </div>
          </div>

          {/* 3-Column Rubric Table */}
          <h3 style={{ fontSize: isPdf ? "10px" : "12px", color: "#9A1E31", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>DETAILED ASSESSMENT RUBRIC</h3>
          <div style={{ borderTop: "1px solid #cbd5e1", marginBottom: isPdf ? "8px" : "12px" }}></div>

          <div style={{ border: "1px solid #95a5a6", marginBottom: isPdf ? "15px" : "25px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isPdf ? "8px" : "10px" }}>
              <thead>
                <tr style={{ background: "#9A1E31", color: "#fff" }}>
                  <th style={{ padding: p(isPdf), textAlign: "left", fontWeight: "bold", borderRight: "1px solid #fff", width: "25px", fontSize: fs(isPdf) }}>#</th>
                  <th style={{ padding: p(isPdf), textAlign: "left", fontWeight: "bold", borderRight: "1px solid #fff", fontSize: fs(isPdf) }}>ASSESSMENT AREA</th>
                  <th style={{ padding: p(isPdf), textAlign: "center", fontWeight: "bold", borderRight: "1px solid #fff", width: "50px", fontSize: fs(isPdf) }}>MAX</th>
                  {assessments.map((_, i) => (
                    <th key={i} style={{ padding: p(isPdf), textAlign: "center", fontWeight: "bold", borderRight: "1px solid #fff", width: "60px", fontSize: fs(isPdf) }}>A{i + 1}</th>
                  ))}
                  {count > 1 && <th style={{ padding: p(isPdf), textAlign: "center", fontWeight: "bold", width: "60px", fontSize: fs(isPdf), background: "#7f1525" }}>AVG</th>}
                </tr>
              </thead>
              <tbody>
                {rubricSections.map((section, si) => {
                  if (section.type === "group") {
                    return (
                      <tr key={si} style={{ background: "#f8fafc" }}>
                        <td colSpan={3 + count + (count > 1 ? 1 : 0)} style={{ padding: isPdf ? "5px 8px" : "7px 10px", color: "#1f2937", fontWeight: "bold", fontSize: isPdf ? "8px" : "10px", borderBottom: "1px solid #e5e7eb" }}>
                          {section.title}
                        </td>
                      </tr>
                    );
                  }
                  if (section.type === "sub") {
                    return (
                      <tr key={si} style={{ background: "#fff" }}>
                        <td colSpan={3 + count + (count > 1 ? 1 : 0)} style={{ padding: isPdf ? "3px 8px 3px 14px" : "5px 10px 5px 18px", color: "#64748b", fontStyle: "italic", fontWeight: "bold", fontSize: isPdf ? "7px" : "9px", borderBottom: "1px dashed #e5e7eb" }}>
                          {section.title}
                        </td>
                      </tr>
                    );
                  }
                  // Data row
                  const avg = getAvg(section.key!);
                  return (
                    <tr key={si} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: p(isPdf), color: "#9A1E31", fontWeight: "bold", fontSize: fs(isPdf), borderRight: "1px solid #e5e7eb" }}>{section.idx}</td>
                      <td style={{ padding: p(isPdf), color: "#1f2937", fontSize: fs(isPdf), borderRight: "1px solid #e5e7eb" }}>{section.title}</td>
                      <td style={{ padding: p(isPdf), textAlign: "center", fontSize: fs(isPdf), color: "#64748b", borderRight: "1px solid #e5e7eb" }}>{section.max}</td>
                      {assessments.map((a, i) => (
                        <td key={i} style={{ padding: p(isPdf), textAlign: "center", fontWeight: "bold", fontSize: fs(isPdf), borderRight: "1px solid #e5e7eb", color: "#1f2937" }}>{a[section.key!]}</td>
                      ))}
                      {count > 1 && <td style={{ padding: p(isPdf), textAlign: "center", fontWeight: "bold", fontSize: fs(isPdf), color: "#9A1E31", background: "#faf5ff" }}>{avg}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <h3 style={{ fontSize: isPdf ? "10px" : "12px", color: "#9A1E31", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>AGGREGATE PERFORMANCE</h3>
          <div style={{ borderTop: "1px solid #cbd5e1", marginBottom: isPdf ? "8px" : "12px" }}></div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${count + (count > 1 ? 1 : 0)}, 1fr)`, border: "1px solid #95a5a6", marginBottom: isPdf ? "15px" : "25px" }}>
            {assessments.map((a, i) => (
              <div key={i} style={{ padding: isPdf ? "10px" : "14px", textAlign: "center", borderRight: "1px solid #95a5a6" }}>
                <div style={{ fontSize: isPdf ? "7px" : "9px", fontWeight: "bold", color: "#4b5563", textTransform: "uppercase", marginBottom: "4px" }}>Assessment {i + 1}</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px" }}>
                  <span style={{ fontSize: isPdf ? "18px" : "22px", fontWeight: "bold", color: "#9A1E31" }}>{a.totalMarks}</span>
                  <span style={{ fontSize: isPdf ? "9px" : "11px", fontWeight: "bold", color: "#000" }}>/100</span>
                </div>
                <div style={{ fontSize: isPdf ? "7px" : "9px", color: "#64748b", marginTop: "2px" }}>{a.grade || "N/A"} • {a.performanceBand || "N/A"}</div>
              </div>
            ))}
            {count > 1 && (
              <div style={{ padding: isPdf ? "10px" : "14px", textAlign: "center", background: "#faf5ff" }}>
                <div style={{ fontSize: isPdf ? "7px" : "9px", fontWeight: "bold", color: "#6b21a8", textTransform: "uppercase", marginBottom: "4px" }}>Overall Average</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px" }}>
                  <span style={{ fontSize: isPdf ? "18px" : "22px", fontWeight: "bold", color: "#6b21a8" }}>{totalAvg}</span>
                  <span style={{ fontSize: isPdf ? "9px" : "11px", fontWeight: "bold", color: "#000" }}>/100</span>
                </div>
              </div>
            )}
          </div>

          {/* Comments per assessment */}
          <h3 style={{ fontSize: isPdf ? "10px" : "12px", color: "#9A1E31", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px" }}>QUALITATIVE REMARKS</h3>
          <div style={{ borderTop: "1px solid #cbd5e1", marginBottom: isPdf ? "8px" : "12px" }}></div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: isPdf ? "6px" : "10px", marginBottom: isPdf ? "15px" : "25px" }}>
            {assessments.map((a, i) => (
              <div key={i} style={{ background: "#f8fafc", padding: isPdf ? "8px" : "12px", borderRadius: "4px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: isPdf ? "8px" : "10px", fontWeight: "bold", color: "#9A1E31", marginBottom: "6px" }}>Assessment {i + 1} — {a.lecturer?.user?.name}</div>
                <div style={{ fontSize: isPdf ? "7px" : "9px", color: "#1f2937", marginBottom: "4px" }}>
                  <strong>Strengths:</strong> <em>{a.areasOfStrength || "—"}</em>
                </div>
                <div style={{ fontSize: isPdf ? "7px" : "9px", color: "#1f2937", marginBottom: "4px" }}>
                  <strong>Improve:</strong> <em>{a.areasOfImprovement || "—"}</em>
                </div>
                <div style={{ fontSize: isPdf ? "7px" : "9px", color: "#1f2937" }}>
                  <strong>General:</strong> <em>{a.generalComments || "—"}</em>
                </div>
              </div>
            ))}
          </div>

          {/* Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: isPdf ? "20px" : "30px" }}>
            <SigBlock label="ASSESSOR's SIGNATURE & DATE" isPdf={isPdf} />
            <SigBlock label="CANDIDATE's SIGNATURE & DATE" isPdf={isPdf} />
            <SigBlock label="COORDINATOR's SIGNATURE & DATE" isPdf={isPdf} />
          </div>

          {/* Footer (web only) */}
          {!isPdf && (
            <div style={{ borderTop: "1px solid #1f2937", marginTop: "30px", paddingTop: "10px", textAlign: "center" }}>
              <span style={{ fontSize: "8px", color: "#4b5563" }}>Generated by TMU Teaching Practice System • {dateFormatted} • Confidential</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DBlock({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: small ? "6px" : "8px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: small ? "9px" : "12px", fontWeight: "bold", color: "#1f2937" }}>{value}</div>
    </div>
  );
}

function SigBlock({ label, isPdf }: { label: string; isPdf?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ borderBottom: "1px solid #1f2937", marginBottom: "8px", height: isPdf ? "25px" : "30px" }}></div>
      <div style={{ fontSize: isPdf ? "7px" : "9px", fontWeight: "bold", color: "#1f2937", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
