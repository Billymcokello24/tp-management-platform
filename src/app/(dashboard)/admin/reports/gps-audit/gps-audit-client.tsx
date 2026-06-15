"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, MapPin, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Download, Search } from "lucide-react";
import { useRef, useState, useEffect } from "react";
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
  schoolCounty: string | null;
  schoolSubCounty: string | null;
  schoolWard: string | null;
  lecturerLat: number | null;
  lecturerLng: number | null;
  gpsAccuracy: number | null;
  distance: number | null;
  withinGeofence: boolean | null;
  isGeoVerified: boolean;
  geoVerificationNote: string | null;
}

/** Build a human-readable school location from county/sub-county/ward */
function schoolLocationString(entry: GPSAuditEntry): string {
  const parts = [entry.schoolCounty, entry.schoolSubCounty, entry.schoolWard].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : (entry.schoolName || "—");
}

/** Client-side reverse geocode with simple cache */
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
      margin: 6,
      filename: `TMU_GPS_Audit_Report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" as const },
    };
    await html2pdf().set(opt as any).from(el).save();
    el.classList.add("hidden");
  };

  const verifiedCount = data.filter((d) => d.withinGeofence === true).length;
  const violationCount = data.filter((d) => d.withinGeofence === false).length;
  const unknownCount = data.filter((d) => d.withinGeofence === null).length;

  const dateFormatted = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl"><MapPin className="h-5 w-5" /> GPS Location Audit Report</CardTitle>
              <CardDescription>Geofence compliance verification for all assessments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
              <Button onClick={handleDownloadPdf}><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <div><div className="text-2xl font-bold text-emerald-700">{verifiedCount}</div><div className="text-xs text-muted-foreground">Verified ✓</div></div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div><div className="text-2xl font-bold text-red-700">{violationCount}</div><div className="text-xs text-muted-foreground">Violations ✗</div></div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <div><div className="text-2xl font-bold text-amber-700">{unknownCount}</div><div className="text-xs text-muted-foreground">Unknown</div></div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lecturer, student, school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="py-2 px-2 text-left text-xs font-semibold">Date</th>
                  <th className="py-2 px-2 text-left text-xs font-semibold">Lecturer</th>
                  <th className="py-2 px-2 text-left text-xs font-semibold">Student</th>
                  <th className="py-2 px-2 text-left text-xs font-semibold">School</th>
                  <th className="py-2 px-2 text-left text-xs font-semibold">School Location</th>
                  <th className="py-2 px-2 text-left text-xs font-semibold">Lecturer Location</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold">Accuracy</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold">Distance</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-muted/30">
                    <td className="py-1.5 px-2 text-xs">{new Date(d.assessmentDate).toLocaleDateString()}</td>
                    <td className="py-1.5 px-2 font-medium">{d.lecturerName}</td>
                    <td className="py-1.5 px-2">{d.studentName}</td>
                    <td className="py-1.5 px-2 text-xs">{d.schoolName}</td>
                    <td className="py-1.5 px-2 text-xs">{schoolLocationString(d)}</td>
                    <td className="py-1.5 px-2 text-xs">
                      <LocationCell lat={d.lecturerLat} lng={d.lecturerLng} fallback="No GPS" />
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs">{d.gpsAccuracy != null ? `${Math.round(d.gpsAccuracy)}m` : "—"}</td>
                    <td className={`py-1.5 px-2 text-center font-semibold ${d.withinGeofence ? "text-emerald-600" : d.withinGeofence === false ? "text-red-600" : ""}`}>
                      {d.distance != null ? `${d.distance}m` : "—"}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {d.withinGeofence === true ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                      ) : d.withinGeofence === false ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium"><XCircle className="h-3 w-3" /> Outside</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><AlertTriangle className="h-3 w-3" /> Unknown</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden PDF content */}
      <div ref={printRef} className="hidden">
        <div style={{ fontFamily: "Arial, sans-serif", color: "#000", padding: "5px" }}>
          <PdfReportHeader title="GPS Location Audit Report" subtitle={`Generated ${dateFormatted}`} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <PdfInfoBlock label="Verified" value={`${verifiedCount} assessments`} />
            <PdfInfoBlock label="Violations" value={`${violationCount} assessments`} />
            <PdfInfoBlock label="Unknown" value={`${unknownCount} assessments`} />
          </div>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7px", pageBreakInside: "auto" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", pageBreakInside: "avoid" }}>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Date</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Lecturer</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left" }}>Student</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left", fontSize: "6px" }}>School</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left", fontSize: "6px" }}>School Location</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "left", fontSize: "6px" }}>Lecturer Location</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Acc.</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Dist.</th>
                <th style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} style={{ pageBreakInside: "avoid" }}>
                  <td style={{ padding: "3px", border: "1px solid #000" }}>{new Date(d.assessmentDate).toLocaleDateString()}</td>
                  <td style={{ padding: "3px", border: "1px solid #000" }}>{d.lecturerName}</td>
                  <td style={{ padding: "3px", border: "1px solid #000" }}>{d.studentName}</td>
                  <td style={{ padding: "3px", border: "1px solid #000", fontSize: "6px" }}>{d.schoolName}</td>
                  <td style={{ padding: "3px", border: "1px solid #000", fontSize: "6px" }}>{schoolLocationString(d)}</td>
                  <td style={{ padding: "3px", border: "1px solid #000", fontSize: "6px" }}>
                    {d.lecturerLat != null && d.lecturerLng != null ? `${d.lecturerLat.toFixed(5)}, ${d.lecturerLng.toFixed(5)}` : "—"}
                  </td>
                  <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center" }}>{d.gpsAccuracy != null ? `${Math.round(d.gpsAccuracy)}m` : "—"}</td>
                  <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", fontWeight: "bold", color: d.withinGeofence ? "#10b981" : "#ef4444" }}>{d.distance != null ? `${d.distance}m` : "—"}</td>
                  <td style={{ padding: "3px", border: "1px solid #000", textAlign: "center", fontSize: "7px" }}>{d.withinGeofence === true ? "✓ Verified" : d.withinGeofence === false ? "✗ VIOLATION" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PdfReportFooter generatedBy="GPS Location Audit Report" />
        </div>
      </div>
    </div>
  );
}
