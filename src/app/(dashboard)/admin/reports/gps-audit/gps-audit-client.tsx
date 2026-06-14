"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, MapPin, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Download, Search } from "lucide-react";
import { useRef, useState } from "react";
import { PdfReportHeader, PdfReportFooter, PdfInfoBlock } from "@/components/shared/pdf-report-components";

interface GPSAuditEntry {
  id: string;
  assessmentDate: string;
  lecturerName: string;
  lecturerEmail: string;
  studentName: string;
  studentAdmission: string;
  subject: string;
  assessmentNumber: number;
  schoolName: string;
  schoolLat: number | null;
  schoolLng: number | null;
  lecturerLat: number | null;
  lecturerLng: number | null;
  gpsAccuracy: number | null;
  distance: number | null;
  withinGeofence: boolean | null;
  isGeoVerified: boolean;
  geoVerificationNote: string | null;
}

export function GPSAuditClient({ data }: { data: GPSAuditEntry[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = data.filter((d) =>
    d.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => window.print();
  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = printRef.current;
    if (!el) return;
    el.classList.remove("hidden");
    const opt = {
      margin: 8,
      filename: `TMU_GPS_Audit_Report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" as const },
    };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const verifiedCount = filtered.filter((d) => d.isGeoVerified).length;
  const mismatchCount = filtered.filter((d) => d.withinGeofence === false).length;
  const insideCount = filtered.filter((d) => d.withinGeofence === true).length;
  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2"><div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div><span className="text-xs font-bold uppercase tracking-widest text-amber-600">GPS Audit</span></div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Lecturer Location Audit Report</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Verify lecturers physically visited assigned schools. Mismatches flagged in red.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          <Button onClick={handleDownloadPdf} className="bg-primary"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
        </div>
      </div>

      <div className="relative max-w-md no-print">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by lecturer, student, school, or subject..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 no-print">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tracked</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Verified</CardTitle><ShieldCheck className="h-4 w-4 text-emerald-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600">{verifiedCount}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">In Geofence</CardTitle><CheckCircle2 className="h-4 w-4 text-emerald-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600">{insideCount}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Mismatches</CardTitle><XCircle className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{mismatchCount}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Compliance</CardTitle><ShieldCheck className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length > 0 ? Math.round((insideCount / filtered.length) * 100) : 0}%</div></CardContent></Card>
      </div>

      {filtered.length > 0 ? (
        <Card>
          <CardHeader><CardTitle>GPS Audit Trail</CardTitle><CardDescription>{filtered.length} GPS-tracked assessments. Red rows indicate potential location violations.</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60"><tr><th className="text-left py-2 px-2 text-xs font-semibold">Date</th><th className="text-left py-2 px-2 text-xs font-semibold">Lecturer</th><th className="text-left py-2 px-2 text-xs font-semibold">Student</th><th className="text-left py-2 px-2 text-xs font-semibold">School</th><th className="text-center py-2 px-2 text-xs font-semibold">School Coords</th><th className="text-center py-2 px-2 text-xs font-semibold">Lecturer Coords</th><th className="text-center py-2 px-2 text-xs font-semibold">Accuracy</th><th className="text-center py-2 px-2 text-xs font-semibold">Distance</th><th className="text-center py-2 px-2 text-xs font-semibold">Status</th></tr></thead>
                <tbody>{filtered.map((d) => (
                  <tr key={d.id} className={`border-t hover:bg-muted/20 ${d.withinGeofence === false ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                    <td className="py-1.5 px-2 text-xs">{new Date(d.assessmentDate).toLocaleDateString()}</td>
                    <td className="py-1.5 px-2"><div className="font-medium text-xs">{d.lecturerName}</div><div className="text-xs text-muted-foreground">{d.lecturerEmail}</div></td>
                    <td className="py-1.5 px-2"><div className="font-medium text-xs">{d.studentName}</div><div className="text-xs text-muted-foreground">{d.studentAdmission}</div></td>
                    <td className="py-1.5 px-2 text-xs">{d.schoolName}</td>
                    <td className="py-1.5 px-2 text-center text-xs">{d.schoolLat != null ? <span>{d.schoolLat.toFixed(5)}, {d.schoolLng?.toFixed(5)}</span> : <span className="text-muted-foreground italic">No GPS</span>}</td>
                    <td className="py-1.5 px-2 text-center text-xs">{d.lecturerLat != null ? <span>{d.lecturerLat.toFixed(5)}, {d.lecturerLng?.toFixed(5)}</span> : <span className="text-muted-foreground italic">No GPS</span>}</td>
                    <td className="py-1.5 px-2 text-center text-xs">{d.gpsAccuracy != null ? `${Math.round(d.gpsAccuracy)}m` : "—"}</td>
                    <td className="py-1.5 px-2 text-center text-xs">{d.distance != null ? <span className={d.withinGeofence ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>{d.distance}m</span> : "—"}</td>
                    <td className="py-1.5 px-2 text-center">{d.withinGeofence === true ? <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Verified</span> : d.withinGeofence === false ? <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Violation</span> : <span className="inline-flex items-center gap-1 text-muted-foreground text-xs px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" /> Unknown</span>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" /><p>No GPS-tracked assessments found{searchTerm ? " matching your search." : "."}</p></CardContent></Card>
      )}

      {/* Hidden PDF Container */}
      <div className="hidden">
        <div ref={printRef} style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
          <PdfReportHeader title="Lecturer Location Audit Report" subtitle={`Generated: ${dateFormatted} • ${filtered.length} GPS-Tracked Assessments`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
            <PdfInfoBlock label="Total Tracked" value={filtered.length.toString()} />
            <PdfInfoBlock label="Verified" value={verifiedCount.toString()} />
            <PdfInfoBlock label="In Geofence" value={insideCount.toString()} />
            <PdfInfoBlock label="Mismatches" value={mismatchCount.toString()} />
            <PdfInfoBlock label="Compliance Rate" value={`${filtered.length > 0 ? Math.round((insideCount / filtered.length) * 100) : 0}%`} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7px" }}>
            <thead><tr style={{ background: "#1f2937", color: "#fff" }}><th style={{ padding: "2px", border: "1px solid #000" }}>Date</th><th style={{ padding: "2px", border: "1px solid #000" }}>Lecturer</th><th style={{ padding: "2px", border: "1px solid #000" }}>Student</th><th style={{ padding: "2px", border: "1px solid #000" }}>School</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>School Coords</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Lecturer Coords</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Acc</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Dist</th><th style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>Status</th></tr></thead>
            <tbody>{filtered.map((d) => (
              <tr key={d.id} style={{ background: d.withinGeofence === false ? "#fef2f2" : "transparent" }}>
                <td style={{ padding: "2px", border: "1px solid #000" }}>{new Date(d.assessmentDate).toLocaleDateString()}</td>
                <td style={{ padding: "2px", border: "1px solid #000" }}>{d.lecturerName}</td>
                <td style={{ padding: "2px", border: "1px solid #000" }}>{d.studentName}</td>
                <td style={{ padding: "2px", border: "1px solid #000", fontSize: "6px" }}>{d.schoolName}</td>
                <td style={{ padding: "2px", border: "1px solid #000", textAlign: "center", fontSize: "6px" }}>{d.schoolLat != null ? `${d.schoolLat.toFixed(4)},${d.schoolLng?.toFixed(4)}` : "—"}</td>
                <td style={{ padding: "2px", border: "1px solid #000", textAlign: "center", fontSize: "6px" }}>{d.lecturerLat != null ? `${d.lecturerLat.toFixed(4)},${d.lecturerLng?.toFixed(4)}` : "—"}</td>
                <td style={{ padding: "2px", border: "1px solid #000", textAlign: "center" }}>{d.gpsAccuracy != null ? `${Math.round(d.gpsAccuracy)}m` : "—"}</td>
                <td style={{ padding: "2px", border: "1px solid #000", textAlign: "center", fontWeight: "bold", color: d.withinGeofence ? "#10b981" : "#ef4444" }}>{d.distance != null ? `${d.distance}m` : "—"}</td>
                <td style={{ padding: "2px", border: "1px solid #000", textAlign: "center", fontSize: "7px" }}>{d.withinGeofence === true ? "✓ Verified" : d.withinGeofence === false ? "✗ VIOLATION" : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
          <PdfReportFooter generatedBy="GPS Location Audit Report" />
        </div>
      </div>
    </div>
  );
}
