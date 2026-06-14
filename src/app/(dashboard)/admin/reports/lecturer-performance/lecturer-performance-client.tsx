"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, TrendingUp, Users, BookOpen, Award, GraduationCap, ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import { useRef, useState } from "react";
import { PdfReportHeader, PdfReportFooter, PdfInfoBlock } from "@/components/shared/pdf-report-components";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface StudentAssessed {
  studentId: string;
  studentName: string;
  school: string;
  schoolCounty: string;
  assessments: {
    id: string;
    assessmentNumber: number;
    subject: string;
    totalMarks: number;
    grade: string;
    createdAt: string;
  }[];
}

interface LecturerPerformance {
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  zone: string;
  department: string;
  totalAssessments: number;
  totalStudentsAssessed: number;
  overallAverage: number;
  completionRate: number;
  subjectAnalysis: {
    subject: string;
    count: number;
    average: number;
    highest: number;
    lowest: number;
    passRate: number;
  }[];
  studentsAssessed: StudentAssessed[];
}

export function LecturerPerformanceClient({ data }: { data: LecturerPerformance[] }) {
  const [expandedLecturer, setExpandedLecturer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = data.filter((l) =>
    l.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => window.print();
  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = printRef.current;
    if (!el) return;
    el.classList.remove("hidden");
    const opt = {
      margin: 10,
      filename: `TMU_Lecturer_Performance_Report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const overallAvg = filtered.length > 0 ? Math.round(filtered.reduce((s, l) => s + l.overallAverage, 0) / filtered.length) : 0;
  const totalAssessments = filtered.reduce((s, l) => s + l.totalAssessments, 0);
  const avgCompletion = filtered.length > 0 ? Math.round(filtered.reduce((s, l) => s + l.completionRate, 0) / filtered.length) : 0;
  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Performance Reports</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Lecturer Assessment Report</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Comprehensive performance breakdown of each lecturer, including subject analysis and student details.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          <Button onClick={handleDownloadPdf} className="bg-primary"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md no-print">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by lecturer name, zone, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lecturers</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Assessments</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalAssessments}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Overall Avg</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{overallAvg}%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Completion</CardTitle><Award className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgCompletion}%</div></CardContent></Card>
      </div>

      {/* Expanded Lecturer Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((l) => {
            const isExpanded = expandedLecturer === l.lecturerId;
            return (
              <Card key={l.lecturerId}>
                <CardHeader className="bg-muted/30 cursor-pointer" onClick={() => setExpandedLecturer(isExpanded ? null : l.lecturerId)}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      <div>
                        <CardTitle className="text-lg">{l.lecturerName}</CardTitle>
                        <CardDescription>{l.department} • {l.zone} • {l.lecturerEmail}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center"><div className="font-bold text-xl text-primary">{l.totalAssessments}</div><div className="text-muted-foreground text-xs">Assessments</div></div>
                      <div className="text-center"><div className="font-bold text-xl text-emerald-600">{l.totalStudentsAssessed}</div><div className="text-muted-foreground text-xs">Students</div></div>
                      <div className="text-center"><div className="font-bold text-xl text-blue-600">{l.overallAverage}%</div><div className="text-muted-foreground text-xs">Avg Score</div></div>
                      <div className="text-center"><div className="font-bold text-xl text-amber-600">{l.completionRate}%</div><div className="text-muted-foreground text-xs">Completion</div></div>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-4 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Subject Performance Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {l.subjectAnalysis.map((sa) => (
                          <Card key={sa.subject} className="border-primary/20">
                            <CardHeader className="pb-1"><CardTitle className="text-sm">{sa.subject}</CardTitle><CardDescription className="text-xs">{sa.count} assessed</CardDescription></CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><span className="text-muted-foreground">Average:</span> <span className="font-bold">{sa.average}%</span></div>
                                <div><span className="text-muted-foreground">Pass Rate:</span> <span className="font-bold text-emerald-600">{sa.passRate}%</span></div>
                                <div><span className="text-muted-foreground">Highest:</span> <span className="font-bold text-emerald-600">{sa.highest}%</span></div>
                                <div><span className="text-muted-foreground">Lowest:</span> <span className="font-bold text-red-600">{sa.lowest}%</span></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Students Assessed ({l.studentsAssessed.length})</h4>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {l.studentsAssessed.map((s) => (
                          <Card key={s.studentId} className="border-border/50">
                            <CardHeader className="pb-1"><CardTitle className="text-sm">{s.studentName}</CardTitle><CardDescription className="text-xs">{s.school} • {s.schoolCounty}</CardDescription></CardHeader>
                            <CardContent>
                              <table className="w-full text-xs">
                                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-1">Assessment</th><th className="py-1">Subject</th><th className="py-1 text-center">Score</th><th className="py-1 text-center">Grade</th><th className="py-1 text-right">Date</th></tr></thead>
                                <tbody>{s.assessments.map((a) => (
                                  <tr key={a.id} className="border-b last:border-0"><td className="py-1 font-medium">A{a.assessmentNumber}</td><td className="py-1">{a.subject}</td><td className="py-1 text-center font-bold">{a.totalMarks}</td><td className="py-1 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${a.grade==="A"?"bg-emerald-100 text-emerald-800":a.grade==="B"?"bg-blue-100 text-blue-800":a.grade==="C"?"bg-amber-100 text-amber-800":"bg-red-100 text-red-800"}`}>{a.grade}</span></td><td className="py-1 text-right text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td></tr>
                                ))}</tbody>
                              </table>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" /><p>No lecturer data found{searchTerm ? " matching your search." : "."}</p></CardContent></Card>
      )}

      {/* Hidden PDF Container */}
      <div className="hidden">
        <div ref={printRef} style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
          <PdfReportHeader title="Lecturer Assessment Performance Report" subtitle={`Generated: ${dateFormatted} • ${filtered.length} Lecturers • ${totalAssessments} Assessments`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "15px", background: "#f8fafc", padding: "10px", border: "1px solid #e2e8f0" }}>
            <PdfInfoBlock label="Total Lecturers" value={filtered.length.toString()} />
            <PdfInfoBlock label="Total Assessments" value={totalAssessments.toString()} />
            <PdfInfoBlock label="Overall Avg Score" value={`${overallAvg}%`} />
            <PdfInfoBlock label="Avg Completion" value={`${avgCompletion}%`} />
          </div>
          {filtered.map((l) => (
            <div key={l.lecturerId} style={{ marginBottom: "15px", border: "1px solid #e2e8f0", padding: "8px" }}>
              <h3 style={{ fontSize: "11px", fontWeight: "bold", color: "#9A1E31", marginBottom: "6px" }}>
                {l.lecturerName} — {l.department} • {l.zone}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "5px", marginBottom: "8px", fontSize: "8px" }}>
                <div><strong>Assessments:</strong> {l.totalAssessments}</div>
                <div><strong>Students:</strong> {l.totalStudentsAssessed}</div>
                <div><strong>Avg Score:</strong> {l.overallAverage}%</div>
                <div><strong>Completion:</strong> {l.completionRate}%</div>
              </div>
              {l.subjectAnalysis.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px", marginBottom: "8px" }}>
                  <thead><tr style={{ background: "#f1f5f9" }}><th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Subject</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Count</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Avg</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Highest</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Lowest</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Pass Rate</th></tr></thead>
                  <tbody>{l.subjectAnalysis.map((sa) => (
                    <tr key={sa.subject}><td style={{ padding: "3px", border: "1px solid #000" }}>{sa.subject}</td><td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{sa.count}</td><td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{sa.average}%</td><td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", color: "#10b981" }}>{sa.highest}%</td><td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", color: "#ef4444" }}>{sa.lowest}%</td><td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{sa.passRate}%</td></tr>
                  ))}</tbody>
                </table>
              )}
              <h4 style={{ fontSize: "9px", fontWeight: "bold", marginBottom: "4px" }}>Students Assessed:</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
                <thead><tr style={{ background: "#f1f5f9" }}><th style={{ padding: "2px", border: "1px solid #000" }}>Student</th><th style={{ padding: "2px", border: "1px solid #000" }}>School</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Subject</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>A#</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Score</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Grade</th></tr></thead>
                <tbody>{l.studentsAssessed.flatMap((s) => s.assessments.map((a) => (
                  <tr key={a.id}><td style={{ padding: "2px", border: "1px solid #000" }}>{s.studentName}</td><td style={{ padding: "2px", border: "1px solid #000", fontSize: "7px" }}>{s.school}</td><td style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>{a.subject}</td><td style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>{a.assessmentNumber}</td><td style={{ padding: "2px", border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{a.totalMarks}</td><td style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>{a.grade}</td></tr>
                )))}</tbody>
              </table>
            </div>
          ))}
          <PdfReportFooter generatedBy="Lecturer Performance Report" />
        </div>
      </div>
    </div>
  );
}
