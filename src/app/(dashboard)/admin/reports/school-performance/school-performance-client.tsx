"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, School, Users, TrendingUp, GraduationCap, BookOpen, Download, Search } from "lucide-react";
import { useRef, useState } from "react";
import { PdfReportHeader, PdfReportFooter, PdfInfoBlock } from "@/components/shared/pdf-report-components";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SchoolPerformance {
  schoolId: string;
  schoolName: string;
  zone: string;
  county: string;
  totalStudents: number;
  studentsAssessed: number;
  completionRate: number;
  averageScore: number;
  topSubject: string;
  lowestSubject: string;
  subjectPerformance: { subject: string; average: number; count: number }[];
  assignedLecturers: string[];
}

export function SchoolPerformanceClient({ data }: { data: SchoolPerformance[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = data.filter((s) =>
    s.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => window.print();
  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = printRef.current;
    if (!el) return;
    el.classList.remove("hidden");
    const opt = { margin: 8, filename: `TMU_School_Performance_Report.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, letterRendering: true }, pagebreak: { mode: ["avoid-all", "css", "legacy"] }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const } };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const totalStudents = filtered.reduce((s, sc) => s + sc.totalStudents, 0);
  const assessed = filtered.reduce((s, sc) => s + sc.studentsAssessed, 0);
  const avgCompletion = filtered.length > 0 ? Math.round(filtered.reduce((s, sc) => s + sc.completionRate, 0) / filtered.length) : 0;
  const avgScore = filtered.length > 0 ? Math.round(filtered.reduce((s, sc) => s + sc.averageScore, 0) / filtered.length) : 0;
  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div><div className="flex items-center gap-2 mb-2"><div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div><span className="text-xs font-bold uppercase tracking-widest text-blue-600">School Reports</span></div><h1 className="text-4xl font-extrabold tracking-tight text-foreground">School Performance Report</h1><p className="text-sm text-muted-foreground mt-2 font-medium">Assessment completion, average scores, and subject performance per school.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button><Button onClick={handleDownloadPdf} className="bg-primary"><Download className="h-4 w-4 mr-2" /> Download PDF</Button></div>
      </div>

      <div className="relative max-w-md no-print"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by school name, zone, or county..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Schools</CardTitle><School className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Students</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalStudents}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Assessed</CardTitle><GraduationCap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{assessed}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Completion</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgCompletion}%</div></CardContent></Card>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((sc) => (
            <Card key={sc.schoolId}>
              <CardHeader className="bg-muted/30"><div className="flex flex-col md:flex-row md:items-center justify-between gap-2"><div><CardTitle className="text-lg">{sc.schoolName}</CardTitle><CardDescription>{sc.zone} • {sc.county}</CardDescription></div><div className="flex gap-4 text-sm"><div className="text-center"><div className="font-bold text-xl">{sc.totalStudents}</div><div className="text-muted-foreground text-xs">Students</div></div><div className="text-center"><div className="font-bold text-xl text-emerald-600">{sc.studentsAssessed}</div><div className="text-muted-foreground text-xs">Assessed</div></div><div className="text-center"><div className="font-bold text-xl text-blue-600">{sc.completionRate}%</div><div className="text-muted-foreground text-xs">Completion</div></div><div className="text-center"><div className="font-bold text-xl text-primary">{sc.averageScore}%</div><div className="text-muted-foreground text-xs">Avg Score</div></div></div></div></CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground">Top Subject</div><div className="font-bold text-emerald-600">{sc.topSubject}</div></div>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground">Lowest</div><div className="font-bold text-red-600">{sc.lowestSubject}</div></div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground">Avg Score</div><div className="font-bold text-blue-600">{sc.averageScore}%</div></div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground">Lecturers</div><div className="font-bold text-amber-600">{sc.assignedLecturers.length}</div></div>
                </div>
                {sc.subjectPerformance.length > 0 && (
                  <div><h4 className="text-xs font-semibold mb-2 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Subject Performance</h4>
                    <ResponsiveContainer width="100%" height={120}><BarChart data={sc.subjectPerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="subject" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                  </div>
                )}
                <div><h4 className="text-xs font-semibold mb-1">Assigned Lecturers</h4><div className="flex flex-wrap gap-1">{sc.assignedLecturers.map((l, i) => (<span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">{l}</span>))}{sc.assignedLecturers.length === 0 && <span className="text-xs text-muted-foreground italic">No lecturers</span>}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (<Card><CardContent className="py-8 text-center text-muted-foreground"><School className="h-8 w-8 mx-auto mb-2 opacity-20" /><p>No school data{searchTerm ? " matching your search." : "."}</p></CardContent></Card>)}

      {/* Hidden PDF Container */}
      <div className="hidden">
        <div ref={printRef} style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
          <PdfReportHeader title="School Performance Report" subtitle={`Generated: ${dateFormatted} • ${filtered.length} Schools`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
            <PdfInfoBlock label="Total Schools" value={filtered.length.toString()} />
            <PdfInfoBlock label="Total Students" value={totalStudents.toString()} />
            <PdfInfoBlock label="Students Assessed" value={assessed.toString()} />
            <PdfInfoBlock label="Avg Completion" value={`${avgCompletion}%`} />
          </div>
          {filtered.map((sc) => (
            <div key={sc.schoolId} style={{ marginBottom: "10px", border: "1px solid #e2e8f0", padding: "6px" }}>
              <h3 style={{ fontSize: "10px", fontWeight: "bold", color: "#9A1E31", marginBottom: "4px" }}>{sc.schoolName} — {sc.zone} • {sc.county}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px", fontSize: "8px", marginBottom: "6px" }}>
                <div><strong>Students:</strong> {sc.totalStudents}</div><div><strong>Assessed:</strong> {sc.studentsAssessed}</div><div><strong>Completion:</strong> {sc.completionRate}%</div><div><strong>Avg Score:</strong> {sc.averageScore}%</div>
              </div>
              {sc.subjectPerformance.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7px", marginBottom: "4px" }}>
                  <thead><tr style={{ background: "#f1f5f9" }}><th style={{ padding: "2px", border: "1px solid #000" }}>Subject</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Avg</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Count</th></tr></thead>
                  <tbody>{sc.subjectPerformance.map((sp) => (<tr key={sp.subject}><td style={{ padding: "2px", border: "1px solid #000" }}>{sp.subject}</td><td style={{ padding: "2px", border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{sp.average}%</td><td style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>{sp.count}</td></tr>))}</tbody>
                </table>
              )}
              <div style={{ fontSize: "7px" }}><strong>Lecturers:</strong> {sc.assignedLecturers.join(", ") || "None"}</div>
            </div>
          ))}
          <PdfReportFooter generatedBy="School Performance Report" />
        </div>
      </div>
    </div>
  );
}
