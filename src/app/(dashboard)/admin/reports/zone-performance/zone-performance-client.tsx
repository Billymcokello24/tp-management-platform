"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, MapPin, School, Users, TrendingUp, ShieldCheck, BookOpen, Download, Search } from "lucide-react";
import { useRef, useState } from "react";
import { PdfReportHeader, PdfReportFooter, PdfInfoBlock } from "@/components/shared/pdf-report-components";

interface ZonePerformance {
  zoneId: string;
  zoneName: string;
  county: string;
  totalSchools: number;
  totalLecturers: number;
  totalStudents: number;
  studentsAssessed: number;
  completionRate: number;
  averageScore: number;
  locationComplianceRate: number;
  totalAssessments: number;
}

export function ZonePerformanceClient({ data }: { data: ZonePerformance[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = data.filter((z) =>
    z.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    z.county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => window.print();
  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = printRef.current;
    if (!el) return;
    el.classList.remove("hidden");
    const opt = { margin: 8, filename: `TMU_Zone_Performance_Report.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, letterRendering: true }, pagebreak: { mode: ["avoid-all", "css", "legacy"] }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const } };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const totalSchools = filtered.reduce((s, z) => s + z.totalSchools, 0);
  const totalStudents = filtered.reduce((s, z) => s + z.totalStudents, 0);
  const totalAssessments = filtered.reduce((s, z) => s + z.totalAssessments, 0);
  const avgCompliance = filtered.length > 0 ? Math.round(filtered.reduce((s, z) => s + z.locationComplianceRate, 0) / filtered.length) : 0;
  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div><div className="flex items-center gap-2 mb-2"><div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div><span className="text-xs font-bold uppercase tracking-widest text-purple-600">Zone Reports</span></div><h1 className="text-4xl font-extrabold tracking-tight text-foreground">Zone Performance Report</h1><p className="text-sm text-muted-foreground mt-2 font-medium">Aggregated performance metrics for each zone, including location compliance.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button><Button onClick={handleDownloadPdf} className="bg-primary"><Download className="h-4 w-4 mr-2" /> Download PDF</Button></div>
      </div>

      <div className="relative max-w-md no-print"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by zone name or county..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Zones</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Schools</CardTitle><School className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalSchools}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Students</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalStudents}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Assessments</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalAssessments}</div></CardContent></Card>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((z) => (
            <Card key={z.zoneId}>
              <CardHeader className="bg-muted/30"><div className="flex items-center justify-between"><div><CardTitle className="text-lg">{z.zoneName}</CardTitle><CardDescription>{z.county}</CardDescription></div><div className="text-3xl font-bold text-primary">{z.averageScore > 0 ? `${z.averageScore}%` : "N/A"}</div></div></CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><div className="text-muted-foreground text-xs">Schools</div><div className="text-lg font-bold">{z.totalSchools}</div></div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><div className="text-muted-foreground text-xs">Lecturers</div><div className="text-lg font-bold">{z.totalLecturers}</div></div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><div className="text-muted-foreground text-xs">Students</div><div className="text-lg font-bold">{z.totalStudents}</div></div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center"><div className="text-muted-foreground text-xs">Assessed</div><div className="text-lg font-bold">{z.studentsAssessed}</div></div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground">Completion</div><div className="text-lg font-bold text-blue-600">{z.completionRate}%</div></div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground">Avg Score</div><div className="text-lg font-bold text-emerald-600">{z.averageScore > 0 ? `${z.averageScore}%` : "N/A"}</div></div>
                  <div className="col-span-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ShieldCheck className="h-3 w-3" /> Location Compliance</div><div className={`text-lg font-bold ${z.locationComplianceRate >= 80 ? "text-emerald-600" : z.locationComplianceRate >= 50 ? "text-amber-600" : "text-red-600"}`}>{z.locationComplianceRate}%</div></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (<Card><CardContent className="py-8 text-center text-muted-foreground"><MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" /><p>No zone data{searchTerm ? " matching your search." : "."}</p></CardContent></Card>)}

      {/* Hidden PDF Container */}
      <div className="hidden">
        <div ref={printRef} style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
          <PdfReportHeader title="Zone Performance Report" subtitle={`Generated: ${dateFormatted} • ${filtered.length} Zones`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
            <PdfInfoBlock label="Total Zones" value={filtered.length.toString()} />
            <PdfInfoBlock label="Total Schools" value={totalSchools.toString()} />
            <PdfInfoBlock label="Total Students" value={totalStudents.toString()} />
            <PdfInfoBlock label="Total Assessments" value={totalAssessments.toString()} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
            <thead><tr style={{ background: "#1f2937", color: "#fff" }}><th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Zone</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>County</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Schools</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Lecturers</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Students</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Assessed</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Completion</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Avg Score</th><th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>GPS Compliance</th></tr></thead>
            <tbody>{filtered.map((z) => (
              <tr key={z.zoneId}>
                <td style={{ padding: "3px", border: "1px solid #000", fontWeight: "bold" }}>{z.zoneName}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{z.county}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{z.totalSchools}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{z.totalLecturers}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{z.totalStudents}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{z.studentsAssessed}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{z.completionRate}%</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", fontWeight: "bold", color: "#9A1E31" }}>{z.averageScore > 0 ? `${z.averageScore}%` : "N/A"}</td>
                <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", fontWeight: "bold", color: z.locationComplianceRate >= 80 ? "#10b981" : "#ef4444" }}>{z.locationComplianceRate}%</td>
              </tr>
            ))}</tbody>
          </table>
          <PdfReportFooter generatedBy="Zone Performance Report" />
        </div>
      </div>
    </div>
  );
}
