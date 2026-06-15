"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Download, Search, GraduationCap, MapPin, Award, TrendingUp, CheckCircle2, XCircle, FileText, FileDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { PdfReportHeader, PdfReportFooter, PdfInfoBlock } from "@/components/shared/pdf-report-components";
import { ComboboxFilter } from "@/components/shared/combobox-filter";

interface StudentCompleteTP {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  course: string;
  school: { name: string; county: string; latitude: number | null; longitude: number | null; geofenceRadius: number | null } | null;
  lecturer: { name: string; email: string; department: string } | null;
  subjects: { s1: string; s2: string };
  slots: Record<string, any>;
  summary: {
    s1Average: number;
    s2Average: number;
    assessmentAverage: number;
    finalGrade: string;
    completionPercentage: number;
    completedSlots: number;
    totalSlots: number;
  };
  gpsSummary: { totalTracked: number; totalVerified: number };
  assessments: {
    id: string;
    assessmentNumber: number;
    subject: string;
    totalMarks: number;
    grade: string;
    performanceBand: string;
    lecturerName: string;
    createdAt: string;
    submissionLatitude: number | null;
    submissionLongitude: number | null;
    gpsAccuracy: number | null;
    isGeoVerified: boolean;
    geoVerificationNote: string | null;
    generalComments: string | null;
    areasOfStrength: string | null;
    areasOfImprovement: string | null;
  }[];
}

export function StudentCompleteTPClient({ data }: { data: StudentCompleteTP[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLecturer, setFilterLecturer] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentCompleteTP | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const printRef = useRef<HTMLDivElement>(null);
  const allPrintRef = useRef<HTMLDivElement>(null);

  // Client-side reverse geocode cache
  const locationNameCache = new Map<string, string>();

  function useLocationName(lat: number | null, lng: number | null): string {
    const [name, setName] = useState<string>("");

    useEffect(() => {
      if (lat == null || lng == null) return;
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      if (locationNameCache.has(key)) {
        setName(locationNameCache.get(key)!);
        return;
      }
      let cancelled = false;
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
        { headers: { "User-Agent": "TMU-TP-Management-Platform/1.0" } }
      )
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (data?.display_name) {
            const parts = (data.display_name as string).split(", ");
            const short = parts.slice(0, 3).join(", ");
            locationNameCache.set(key, short);
            setName(short);
          } else {
            setName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        })
        .catch(() => {
          if (!cancelled) setName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        });
      return () => { cancelled = true; };
    }, [lat, lng]);

    return name;
  }

  function LocationCell({ lat, lng, fallback }: { lat: number | null; lng: number | null; fallback?: string }) {
    const name = useLocationName(lat, lng);
    const display = name || fallback || "—";
    return <span title={lat != null ? `${lat.toFixed(5)}, ${lng?.toFixed(5)}` : undefined}>{display}</span>;
  }

  const filtered = data.filter((s) =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.school?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.lecturer?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    ).filter((s) =>
      (filterLecturer === "" || (s.lecturer?.name || "") === filterLecturer) &&
      (filterCourse === "" || s.course === filterCourse) &&
      (filterSchool === "" || (s.school?.name || "") === filterSchool)
  );

  // Collect unique values for filters
  const lecturerNames = Array.from(new Set(data.map((s) => s.lecturer?.name || "Unassigned"))).sort();
  const courses = Array.from(new Set(data.map((s) => s.course))).sort();
  const schoolNames = Array.from(new Set(data.map((s) => s.school?.name || "Unassigned"))).filter(Boolean).sort();

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!selectedStudent) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const el = printRef.current;
    if (!el) return;
    el.classList.remove("hidden");
    const opt = {
      margin: 8,
      filename: `TMU_Student_TP_Report_${selectedStudent.admissionNumber}.pdf`,
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const handleDownloadAllPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = allPrintRef.current;
    if (!el) return;
    el.classList.remove("hidden");
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `TMU_All_Students_Combined_TP_Report.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 1.2,
        useCORS: true,
        letterRendering: true,
        windowWidth: 800,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const gradeBadge = (g: string) => {
    if (g?.startsWith("A")) return "bg-emerald-100 text-emerald-800";
    if (g?.startsWith("B")) return "bg-blue-100 text-blue-800";
    if (g?.startsWith("C")) return "bg-amber-100 text-amber-800";
    if (g?.startsWith("D")) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  const handleFilterChange = (setter: Function, value: string) => {
    setter(value);
    setPage(1);
  };

  const avgAll = filtered.length > 0 ? Math.round(filtered.reduce((s, st) => s + st.summary.assessmentAverage, 0) / filtered.length) : 0;
  const avgCompletion = filtered.length > 0 ? Math.round(filtered.reduce((s, st) => s + st.summary.completionPercentage, 0) / filtered.length) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Student Reports</span></div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Student Complete TP Report</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Comprehensive teaching practice reports. Click a student for details, or download all combined.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          <Button onClick={handleDownloadAllPdf} variant="secondary" className="bg-emerald-600 hover:bg-emerald-700 text-white"><FileDown className="h-4 w-4 mr-2" /> Download All Students PDF</Button>
          {selectedStudent && <Button onClick={handleDownloadPdf} className="bg-primary"><Download className="h-4 w-4 mr-2" /> Download {selectedStudent.admissionNumber} PDF</Button>}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 no-print flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, admission..." value={searchTerm} onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)} className="pl-9" />
        </div>
        <ComboboxFilter value={filterLecturer} onChange={(v) => handleFilterChange(setFilterLecturer, v)} options={lecturerNames} placeholder="Search lecturer..." allLabel="All Lecturers" />
        <ComboboxFilter value={filterCourse} onChange={(v) => handleFilterChange(setFilterCourse, v)} options={courses} placeholder="Search course..." allLabel="All Courses" />
        <ComboboxFilter value={filterSchool} onChange={(v) => handleFilterChange(setFilterSchool, v)} options={schoolNames} placeholder="Search school..." allLabel="All Schools" />
        {(searchTerm || filterLecturer || filterCourse || filterSchool) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setFilterLecturer(""); setFilterCourse(""); setFilterSchool(""); setPage(1); }}>
            Clear All
          </Button>
        )}
        <span className="text-xs text-muted-foreground self-center">
          {filtered.length} of {data.length} students
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Students</CardTitle><GraduationCap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Score</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgAll}%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Completion</CardTitle><Award className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgCompletion}%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">GPS Verified</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.reduce((s, st) => s + st.gpsSummary.totalVerified, 0)}</div></CardContent></Card>
      </div>

      {/* Student List Table */}
      <Card className="no-print">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div><CardTitle>All Students</CardTitle><CardDescription>Click a row to view details. Download combined PDF for all students.</CardDescription></div>
            <span className="text-sm text-muted-foreground font-medium">Page {page} of {totalPages || 1} • {filtered.length} students</span>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="bg-muted/60"><tr><th className="text-left py-2 px-2 text-xs font-semibold w-[14px]">#</th><th className="text-left py-2 px-2 text-xs font-semibold">Name</th><th className="text-left py-2 px-2 text-xs font-semibold">Admission</th><th className="text-left py-2 px-2 text-xs font-semibold">Course</th><th className="text-left py-2 px-2 text-xs font-semibold">School</th><th className="text-left py-2 px-2 text-xs font-semibold">Lecturer</th><th className="text-center py-2 px-2 text-xs font-semibold">A1S1</th><th className="text-center py-2 px-2 text-xs font-semibold">A1S2</th><th className="text-center py-2 px-2 text-xs font-semibold">A2S1</th><th className="text-center py-2 px-2 text-xs font-semibold">A2S2</th><th className="text-center py-2 px-2 text-xs font-semibold">A3S1</th><th className="text-center py-2 px-2 text-xs font-semibold">A3S2</th><th className="text-center py-2 px-2 text-xs font-semibold">Avg</th><th className="text-center py-2 px-2 text-xs font-semibold">Grade</th></tr></thead>
            <tbody>{paginated.map((s, idx) => (
              <tr key={s.studentId} className={`border-t hover:bg-muted/20 cursor-pointer ${selectedStudent?.studentId === s.studentId ? "bg-primary/5" : ""}`} onClick={() => setSelectedStudent(s)}>
                  <td className="py-1.5 px-2 text-xs text-muted-foreground text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-1.5 px-2 font-medium">{s.studentName}</td>
                  <td className="py-1.5 px-2 text-xs text-muted-foreground">{s.admissionNumber}</td>
                  <td className="py-1.5 px-2 text-xs">{s.course}</td>
                  <td className="py-1.5 px-2 text-xs">{s.school?.name || "N/A"}</td>
                  <td className="py-1.5 px-2 text-xs">{s.lecturer?.name || "N/A"}</td>
                  {["a1s1","a1s2","a2s1","a2s2","a3s1","a3s2"].map((slot) => (
                    <td key={slot} className="py-1.5 px-2 text-center text-xs font-bold">
                      {s.slots[slot] ? <span className={s.slots[slot].totalMarks >= 70 ? "text-emerald-600" : s.slots[slot].totalMarks < 40 ? "text-red-600" : ""}>{s.slots[slot].totalMarks}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                  <td className="py-1.5 px-2 text-center font-bold">{s.summary.assessmentAverage > 0 ? `${s.summary.assessmentAverage}%` : "N/A"}</td>
                  <td className="py-1.5 px-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${gradeBadge(s.summary.finalGrade)}`}>{s.summary.finalGrade}</span></td>
                </tr>
              ))}</tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)}>««</Button>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>«</Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) pageNum = i + 1;
                  else if (page <= 4) pageNum = i + 1;
                  else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                  else pageNum = page - 3 + i;
                  return <Button key={pageNum} variant={pageNum === page ? "default" : "outline"} size="sm" onClick={() => setPage(pageNum)} className="min-w-[36px]">{pageNum}</Button>;
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>»</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Student Detail */}
      {selectedStudent && (
        <div className="space-y-6 no-print">
          <Card>
            <CardHeader className="bg-muted/30"><div className="flex flex-col md:flex-row md:items-center justify-between gap-2"><div><CardTitle className="text-xl">{selectedStudent.studentName}</CardTitle><CardDescription>{selectedStudent.admissionNumber} • {selectedStudent.course}</CardDescription></div><div className="flex gap-3"><div className="text-center"><div className="font-bold text-2xl text-primary">{selectedStudent.summary.assessmentAverage > 0 ? `${selectedStudent.summary.assessmentAverage}%` : "N/A"}</div><div className="text-xs text-muted-foreground">Final Avg</div></div><div className="text-center"><div className={`font-bold text-2xl ${selectedStudent.summary.finalGrade.startsWith("A") ? "text-emerald-600" : selectedStudent.summary.finalGrade.startsWith("B") ? "text-blue-600" : "text-amber-600"}`}><span className={`px-2 py-0.5 rounded ${gradeBadge(selectedStudent.summary.finalGrade)}`}>{selectedStudent.summary.finalGrade}</span></div><div className="text-xs text-muted-foreground">Grade</div></div></div></div></CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4"><h4 className="text-xs font-semibold mb-2">School Details</h4><div className="space-y-1 text-sm"><div className="font-medium">{selectedStudent.school?.name || "N/A"}</div><div className="text-muted-foreground text-xs">{selectedStudent.school?.county}</div></div></div>
                <div className="bg-muted/50 rounded-lg p-4"><h4 className="text-xs font-semibold mb-2">Assigned Lecturer</h4><div className="space-y-1 text-sm"><div className="font-medium">{selectedStudent.lecturer?.name || "N/A"}</div><div className="text-muted-foreground text-xs">{selectedStudent.lecturer?.department}</div></div></div>
                <div className="bg-muted/50 rounded-lg p-4"><h4 className="text-xs font-semibold mb-2">Subjects</h4><div className="space-y-1 text-sm"><div>{selectedStudent.subjects.s1} — Avg: {selectedStudent.summary.s1Average}%</div><div>{selectedStudent.subjects.s2} — Avg: {selectedStudent.summary.s2Average}%</div></div></div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Assessment Scores</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[{ label: "A1S1", slot: selectedStudent.slots.a1s1 },{ label: "A1S2", slot: selectedStudent.slots.a1s2 },{ label: "A2S1", slot: selectedStudent.slots.a2s1 },{ label: "A2S2", slot: selectedStudent.slots.a2s2 },{ label: "A3S1", slot: selectedStudent.slots.a3s1 },{ label: "A3S2", slot: selectedStudent.slots.a3s2 }].map(({ label, slot }) => (
                    <div key={label} className={`rounded-lg p-3 text-center border ${slot ? "border-emerald-200 bg-emerald-50/50" : "border-dashed border-border/60 bg-muted/20"}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                      {slot ? (<><div className="text-xl font-bold">{slot.totalMarks}%</div><span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${gradeBadge(slot.grade || "")}`}>{slot.grade || "N/A"}</span><div className="text-[9px] text-muted-foreground mt-1">by {slot.lecturer?.user?.name || "—"}</div></>) : (<div className="text-sm text-muted-foreground">—</div>)}
                    </div>
                  ))}
                </div>
              </div>
              {selectedStudent.gpsSummary.totalTracked > 0 && (
                <div><h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Location Audit</h4>
                  <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-muted/60"><tr><th className="py-1 px-2 text-left">Assessment</th><th className="py-1 px-2 text-left">Lecturer</th><th className="py-1 px-2 text-center">Location</th><th className="py-1 px-2 text-center">Accuracy</th><th className="py-1 px-2 text-center">Status</th></tr></thead>
                    <tbody>{selectedStudent.assessments.filter((a) => a.submissionLatitude != null).map((a) => (<tr key={a.id} className="border-t"><td className="py-1 px-2 font-medium">A{a.assessmentNumber} — {a.subject}</td><td className="py-1 px-2">{a.lecturerName}</td><td className="py-1 px-2 text-center text-[10px]"><LocationCell lat={a.submissionLatitude ?? null} lng={a.submissionLongitude ?? null} fallback="—" /></td><td className="py-1 px-2 text-center">{a.gpsAccuracy != null ? `${Math.round(a.gpsAccuracy)}m` : "—"}</td><td className="py-1 px-2 text-center">{a.isGeoVerified ? <span className="text-emerald-600 font-medium"><CheckCircle2 className="h-3 w-3 inline" /> Verified</span> : <span className="text-red-600 font-medium"><XCircle className="h-3 w-3 inline" /> Mismatch</span>}</td></tr>))}</tbody></table></div>
                </div>
              )}
              <div><h4 className="text-sm font-semibold mb-3">Assessment Comments</h4>
                <div className="space-y-2">{selectedStudent.assessments.filter((a) => a.areasOfStrength || a.areasOfImprovement || a.generalComments).map((a) => (<div key={a.id} className="bg-muted/30 rounded-lg p-3 text-sm"><div className="font-semibold text-xs mb-1">A{a.assessmentNumber} — {a.subject} (by {a.lecturerName})</div>{a.areasOfStrength && <div className="text-xs"><span className="text-emerald-600 font-medium">Strengths:</span> {a.areasOfStrength}</div>}{a.areasOfImprovement && <div className="text-xs"><span className="text-amber-600 font-medium">Improvement:</span> {a.areasOfImprovement}</div>}{a.generalComments && <div className="text-xs"><span className="text-blue-600 font-medium">Comments:</span> {a.generalComments}</div>}</div>))}{selectedStudent.assessments.filter((a) => a.areasOfStrength || a.areasOfImprovement || a.generalComments).length === 0 && (<div className="text-sm text-muted-foreground italic">No comments recorded.</div>)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden PDF: Single Student */}
      {selectedStudent && (
        <div ref={printRef} className="hidden" style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
          <PdfReportHeader title="Student Complete TP Assessment Report" subtitle={`Generated: ${dateFormatted}`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
            <PdfInfoBlock label="Student Name" value={selectedStudent.studentName} />
            <PdfInfoBlock label="Admission No" value={selectedStudent.admissionNumber} />
            <PdfInfoBlock label="Course" value={selectedStudent.course} />
            <PdfInfoBlock label="School" value={selectedStudent.school?.name || "N/A"} />
            <PdfInfoBlock label="Lecturer" value={selectedStudent.lecturer?.name || "N/A"} />
            <PdfInfoBlock label="Subject 1" value={selectedStudent.subjects.s1} />
            <PdfInfoBlock label="Subject 2" value={selectedStudent.subjects.s2} />
            <PdfInfoBlock label="Completion" value={`${selectedStudent.summary.completedSlots}/${selectedStudent.summary.totalSlots}`} />
          </div>
            <h3 style={{ fontSize: "10px", fontWeight: "normal", color: "#9A1E31", borderBottom: "1px solid #d1d5db", paddingBottom: "4px", marginBottom: "8px" }}>Assessment Scores</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px", marginBottom: "12px" }}>
            <thead><tr style={{ background: "#f3f4f6", color: "#374151" }}><th style={{ padding: "3px", border: "0.5px solid #d1d5db" }}>Slot</th><th style={{ padding: "3px", border: "0.5px solid #d1d5db" }}>Subject</th><th style={{ padding: "3px", border: "0.5px solid #d1d5db", textAlign: "center" }}>Score</th><th style={{ padding: "3px", border: "0.5px solid #d1d5db", textAlign: "center" }}>Grade</th><th style={{ padding: "3px", border: "0.5px solid #d1d5db" }}>Assessed By</th><th style={{ padding: "3px", border: "0.5px solid #d1d5db" }}>Date</th></tr></thead>
            <tbody>{[{ label: "A1S1", s: selectedStudent.slots.a1s1 },{ label: "A1S2", s: selectedStudent.slots.a1s2 },{ label: "A2S1", s: selectedStudent.slots.a2s1 },{ label: "A2S2", s: selectedStudent.slots.a2s2 },{ label: "A3S1", s: selectedStudent.slots.a3s1 },{ label: "A3S2", s: selectedStudent.slots.a3s2 }].map(({ label, s: slot }) => (
              <tr key={label}><td style={{ padding: "3px", border: "0.5px solid #d1d5db", fontWeight: "normal" }}>{label}</td><td style={{ padding: "3px", border: "0.5px solid #d1d5db" }}>{slot?.subject || "—"}</td><td style={{ padding: "3px", border: "0.5px solid #d1d5db", textAlign: "center", fontWeight: "normal" }}>{slot ? `${slot.totalMarks}` : "—"}</td><td style={{ padding: "3px", border: "0.5px solid #d1d5db", textAlign: "center" }}>{slot?.grade || "—"}</td><td style={{ padding: "3px", border: "0.5px solid #d1d5db" }}>{slot?.lecturer?.user?.name || "—"}</td><td style={{ padding: "3px", border: "0.5px solid #d1d5db", fontSize: "7px" }}>{slot?.createdAt ? new Date(slot.createdAt).toLocaleDateString() : "—"}</td></tr>
            ))}</tbody>
          </table>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
            <PdfInfoBlock label={`${selectedStudent.subjects.s1} Average`} value={`${selectedStudent.summary.s1Average}%`} />
            <PdfInfoBlock label={`${selectedStudent.subjects.s2} Average`} value={`${selectedStudent.summary.s2Average}%`} />
            <PdfInfoBlock label="Final TP Average" value={`${selectedStudent.summary.assessmentAverage}%`} />
          </div>
          <div style={{ textAlign: "center", marginBottom: "12px", padding: "8px", background: "#fef3c7", border: "0.5px solid #f59e0b" }}>
            <span style={{ fontSize: "14px", fontWeight: "normal", color: "#9A1E31" }}>FINAL GRADE: {selectedStudent.summary.finalGrade}</span>
          </div>
          {selectedStudent.assessments.some((a) => a.generalComments || a.areasOfStrength || a.areasOfImprovement) && (
            <><h3 style={{ fontSize: "10px", fontWeight: "normal", color: "#9A1E31", borderBottom: "0.5px solid #9A1E31", paddingBottom: "4px", marginBottom: "8px" }}>Comments & Recommendations</h3>
            {selectedStudent.assessments.filter((a) => a.generalComments || a.areasOfStrength || a.areasOfImprovement).map((a) => (
              <div key={a.id} style={{ marginBottom: "6px", fontSize: "8px" }}><strong>A{a.assessmentNumber} — {a.subject} ({a.lecturerName}):</strong>{a.areasOfStrength && <div style={{ color: "#10b981" }}>Strengths: {a.areasOfStrength}</div>}{a.areasOfImprovement && <div style={{ color: "#f59e0b" }}>Improvement: {a.areasOfImprovement}</div>}{a.generalComments && <div>Comments: {a.generalComments}</div>}</div>
            ))}</>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "30px" }}>
            {["ASSESSOR's SIGNATURE & DATE","CANDIDATE's SIGNATURE & DATE","COORDINATOR's SIGNATURE & DATE"].map((l,i) => (<div key={i} style={{ textAlign: "center" }}><div style={{ borderBottom: "0.5px solid #d1d5db", marginBottom: "8px", height: "25px" }}></div><div style={{ fontSize: "7px", fontWeight: "normal", color: "#1f2937", textTransform: "uppercase" }}>{l}</div></div>))}
          </div>
          <PdfReportFooter generatedBy="Student Complete TP Report" />
        </div>
      )}

      {/* Hidden PDF: ALL STUDENTS COMBINED */}
      <div ref={allPrintRef} className="hidden" style={{ width: "100%", fontFamily: "sans-serif", color: "#000", background: "#fff", padding: "10px" }}>
        <PdfReportHeader title="Combined Students TP Assessment Report" subtitle={`Generated: ${dateFormatted} • ${filtered.length} Students`} />

        {/* Summary KPI Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
          <PdfInfoBlock label="Total Students" value={filtered.length.toString()} />
          <PdfInfoBlock label="Average Score" value={`${avgAll}%`} />
          <PdfInfoBlock label="Avg Completion" value={`${avgCompletion}%`} />
          <PdfInfoBlock label="GPS Verified" value={filtered.reduce((s, st) => s + st.gpsSummary.totalVerified, 0).toString()} />
        </div>

        {/* Combined Students Master Table */}
        <h3 style={{ fontSize: "10px", fontWeight: "normal", color: "#9A1E31", borderBottom: "0.5px solid #9A1E31", paddingBottom: "4px", marginBottom: "8px" }}>All Students — Assessment Scores Summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7px", marginBottom: "16px" }}>
          <thead>
            <tr style={{ background: "#f3f4f6", color: "#374151" }}>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>#</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Student Name</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Admission</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Course</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>School</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Lecturer</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>A1S1</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>A1S2</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>A2S1</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>A2S2</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>A3S1</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>A3S2</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>Avg</th>
              <th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => (
              <tr key={s.studentId} style={{ background: idx % 2 === 0 ? "#f8fafc" : "#fff" }}>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db" }}>{idx + 1}</td>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db", fontWeight: "normal" }}>{s.studentName}</td>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db" }}>{s.admissionNumber}</td>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db", fontSize: "6px" }}>{s.course}</td>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db", fontSize: "6px" }}>{s.school?.name || "N/A"}</td>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db", fontSize: "6px" }}>{s.lecturer?.name || "N/A"}</td>
                {["a1s1","a1s2","a2s1","a2s2","a3s1","a3s2"].map((slot) => (
                  <td key={slot} style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center", fontWeight: "normal", color: s.slots[slot] ? (s.slots[slot].totalMarks >= 70 ? "#10b981" : s.slots[slot].totalMarks < 40 ? "#ef4444" : "#000") : "#9ca3af" }}>
                    {s.slots[slot] ? s.slots[slot].totalMarks : "—"}
                  </td>
                ))}
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center", fontWeight: "normal" }}>{s.summary.assessmentAverage > 0 ? `${s.summary.assessmentAverage}%` : "N/A"}</td>
                <td style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center", fontWeight: "normal", color: s.summary.finalGrade.startsWith("A") ? "#10b981" : s.summary.finalGrade.startsWith("B") ? "#3b82f6" : "#f59e0b" }}>{s.summary.finalGrade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Lecturer Assessment Summary */}
        <h3 style={{ fontSize: "10px", fontWeight: "normal", color: "#9A1E31", borderBottom: "0.5px solid #9A1E31", paddingBottom: "4px", marginBottom: "8px", marginTop: "16px" }}>Lecturer Assessment Summary</h3>
        {(() => {
          const lecturerMap = new Map<string, { department: string; assessments: { studentName: string; admission: string; subject: string; assessmentNumber: number; slot: string; marks: number; grade: string }[] }>();
          filtered.forEach((s) => {
            const name = s.lecturer?.name || "Unassigned";
            const dept = s.lecturer?.department || "";
            if (!lecturerMap.has(name)) lecturerMap.set(name, { department: dept, assessments: [] });
            const entry = lecturerMap.get(name)!;
            const slotLabels: Record<string, string> = { a1s1: "A1S1", a1s2: "A1S2", a2s1: "A2S1", a2s2: "A2S2", a3s1: "A3S1", a3s2: "A3S2" };
            Object.entries(s.slots).forEach(([key, slot]) => {
              if (slot) {
                entry.assessments.push({
                  studentName: s.studentName,
                  admission: s.admissionNumber,
                  subject: slot.subject || "N/A",
                  assessmentNumber: slot.assessmentNumber ?? parseInt(key.charAt(1)),
                  slot: slotLabels[key] || key,
                  marks: slot.totalMarks,
                  grade: slot.grade || "N/A",
                });
              }
            });
          });
          return Array.from(lecturerMap.entries()).map(([lecturer, data]) => (
            <div key={lecturer} style={{ marginBottom: "10px", border: "1px solid #e2e8f0", padding: "6px" }}>
              <div style={{ fontSize: "9px", fontWeight: "normal", color: "#1f2937", marginBottom: "4px", background: "#f1f5f9", padding: "4px 6px" }}>
                {lecturer}{data.department ? ` — ${data.department}` : ""} • {data.assessments.length} assessments across {new Set(data.assessments.map((a) => a.studentName)).size} students
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7px" }}>
                <thead><tr style={{ background: "#e2e8f0" }}><th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Student</th><th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Admission</th><th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "left" }}>Subject</th><th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>Slot</th><th style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center" }}>Marks</th></tr></thead>
                <tbody>
                  {data.assessments.sort((a, b) => a.studentName.localeCompare(b.studentName) || a.assessmentNumber - b.assessmentNumber).map((a, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <td style={{ padding: "2px", border: "0.5px solid #d1d5db" }}>{a.studentName}</td>
                      <td style={{ padding: "2px", border: "0.5px solid #d1d5db", fontSize: "6px" }}>{a.admission}</td>
                      <td style={{ padding: "2px", border: "0.5px solid #d1d5db" }}>{a.subject}</td>
                      <td style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center", fontWeight: "normal" }}>{a.slot}</td>
                      <td style={{ padding: "2px", border: "0.5px solid #d1d5db", textAlign: "center", fontWeight: "normal", color: a.marks >= 70 ? "#10b981" : a.marks < 40 ? "#ef4444" : "#000" }}>{a.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ));
        })()}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "30px" }}>
          {["ASSESSOR's SIGNATURE & DATE","CANDIDATE's SIGNATURE & DATE","COORDINATOR's SIGNATURE & DATE"].map((l,i) => (<div key={i} style={{ textAlign: "center" }}><div style={{ borderBottom: "0.5px solid #d1d5db", marginBottom: "8px", height: "25px" }}></div><div style={{ fontSize: "7px", fontWeight: "normal", color: "#1f2937", textTransform: "uppercase" }}>{l}</div></div>))}
        </div>
        <PdfReportFooter generatedBy="Combined Students TP Report" />
      </div>
    </div>
  );
}
