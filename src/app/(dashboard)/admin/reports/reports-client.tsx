"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, TrendingUp, Users, BookOpen, GraduationCap, MapPin, AlertTriangle, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

interface ReportsData {
  totalStudents: number;
  totalLecturers: number;
  completedAssessments: number;
  avgScore: number;
  gradeDistribution: { name: string; value: number }[];
  averageByCourse: { name: string; average: number }[];
}

interface LecturerAssessmentReport {
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  department: string;
  totalAssessments: number;
  totalStudentsAssessed: number;
  studentsAssessed: { id: string; name: string; admissionNumber: string }[];
  subjectAverages: { subject: string; averageScore: number; assessmentCount: number }[];
  overallAverage: number;
}

interface LocationAssessment {
  id: string;
  studentName: string;
  studentAdmission: string;
  subject: string;
  assessmentNumber: number;
  lecturerLat: number;
  lecturerLng: number;
  isGeoVerified: boolean;
  geoVerificationNote: string | null;
  schoolName: string | null;
  schoolLat: number | null;
  schoolLng: number | null;
  schoolCounty: string | null;
  schoolSubCounty: string | null;
  schoolWard: string | null;
  distanceFromSchool: number | null;
  withinGeofence: boolean | null;
}

interface LecturerLocationReport {
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  department: string;
  assessments: LocationAssessment[];
  summary: {
    totalLocationTracked: number;
    totalWithSchoolGps: number;
    withinGeofence: number;
    outsideGeofence: number;
    averageDistanceMeters: number;
  };
}

/** Build a human-readable school location from county/sub-county/ward */
function schoolLocationString(a: LocationAssessment): string {
  const parts = [a.schoolCounty, a.schoolSubCounty, a.schoolWard].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : (a.schoolName || "—");
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

export function ReportsClient({
  data,
  lecturerReports,
  locationReports,
}: {
  data: ReportsData;
  lecturerReports: LecturerAssessmentReport[];
  locationReports: LecturerLocationReport[];
}) {
  const handlePrint = () => {
    window.print();
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLecturer, setFilterLecturer] = useState("");

  // Collect unique lecturers for filter dropdown
  const allLecturerNames = Array.from(
    new Set([
      ...lecturerReports.map((l) => l.lecturerName),
      ...locationReports.map((l) => l.lecturerName),
    ])
  ).sort();

  const filteredLecturerReports = lecturerReports.filter(
    (l) =>
      (filterLecturer === "" || l.lecturerName === filterLecturer) &&
      (l.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.studentsAssessed.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.subjectAverages.some((s) => s.subject.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredLocationReports = locationReports.filter(
    (l) =>
      (filterLecturer === "" || l.lecturerName === filterLecturer) &&
      (l.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.assessments.some(
        (a) =>
          a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
  ));

  return (
    <div className="space-y-6">
      {/* Non-printable header controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Reports & Analytics</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            TP Management Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Comprehensive analytics across the teaching practice programme.
          </p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Quick Report Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
        {[
          { label: "Lecturer Performance", href: "/admin/reports/lecturer-performance", icon: "👨‍🏫", color: "border-l-blue-500" },
          { label: "GPS Audit Report", href: "/admin/reports/gps-audit", icon: "📍", color: "border-l-amber-500" },
          { label: "School Performance", href: "/admin/reports/school-performance", icon: "🏫", color: "border-l-emerald-500" },
          { label: "Zone Performance", href: "/admin/reports/zone-performance", icon: "🗺️", color: "border-l-purple-500" },
          { label: "Student TP Reports", href: "/admin/reports/student-complete", icon: "📋", color: "border-l-emerald-500" },
        ].map((r) => (
          <a key={r.href} href={r.href} className={`border-l-4 ${r.color} bg-card hover:bg-muted/30 rounded-lg p-3 transition-colors`}>
            <div className="text-lg mb-1">{r.icon}</div>
            <div className="text-xs font-semibold">{r.label}</div>
            <div className="text-[10px] text-muted-foreground">View Report →</div>
          </a>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by lecturer, student, subject, department, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterLecturer}
          onChange={(e) => setFilterLecturer(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background max-w-[200px]"
        >
          <option value="">All Lecturers</option>
          {allLecturerNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
            Clear
          </Button>
        )}
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Filter className="h-3 w-3" />
          {searchTerm
            ? `Filtered: ${filteredLecturerReports.length + filteredLocationReports.length} results`
            : `Showing all ${filteredLecturerReports.length + filteredLocationReports.length} records`}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLecturers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedAssessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 no-print">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Assessment grade percentages across all students</CardDescription>
          </CardHeader>
          <CardContent>
            {data.gradeDistribution.some((g) => g.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${(name || "").split(" ")[0]} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.gradeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Performance by Course</CardTitle>
            <CardDescription>Comparative performance across degree programs</CardDescription>
          </CardHeader>
          <CardContent>
            {data.averageByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.averageByCourse} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── LECTURER ASSESSMENT REPORTS ──────────────────────── */}
      <div className="mt-10 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Assessment Reports</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Lecturer Assessment Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Breakdown of each lecturer's assessments: students assessed, subjects covered, and average scores.
        </p>
      </div>

      {filteredLecturerReports.length > 0 ? (
        <div className="space-y-6">
          {filteredLecturerReports.map((lr) => (
            <Card key={lr.lecturerId}>
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{lr.lecturerName}</CardTitle>
                    <CardDescription>
                      {lr.department} • {lr.lecturerEmail}
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-primary">{lr.totalAssessments}</div>
                      <div className="text-muted-foreground text-xs">Assessments</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-emerald-600">{lr.totalStudentsAssessed}</div>
                      <div className="text-muted-foreground text-xs">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-blue-600">{lr.overallAverage}%</div>
                      <div className="text-muted-foreground text-xs">Overall Avg</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Subject Averages */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Subject Averages</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {lr.subjectAverages.map((sa) => (
                      <div key={sa.subject} className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-muted-foreground truncate">{sa.subject}</div>
                        <div className="text-lg font-bold text-primary">{sa.averageScore}%</div>
                        <div className="text-xs text-muted-foreground">{sa.assessmentCount} assessments</div>
                      </div>
                    ))}
                    {lr.subjectAverages.length === 0 && (
                      <div className="col-span-4 text-sm text-muted-foreground italic">No subject data available.</div>
                    )}
                  </div>
                </div>

                {/* Students Assessed */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Students Assessed ({lr.studentsAssessed.length})
                  </h4>
                  {lr.studentsAssessed.length > 0 ? (
                    <div className="max-h-[120px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-left py-1 px-2 text-xs font-semibold">Name</th>
                            <th className="text-left py-1 px-2 text-xs font-semibold">Admission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lr.studentsAssessed.map((s) => (
                            <tr key={s.id} className="border-t">
                              <td className="py-1 px-2">{s.name}</td>
                              <td className="py-1 px-2 text-muted-foreground">{s.admissionNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No students assessed yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No lecturer assessment data available yet.</p>
          </CardContent>
        </Card>
      )}

      {/* ── LECTURER LOCATION REPORTS ──────────────────────── */}
      <div className="mt-10 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">GPS Verification</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Lecturer Location Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">
          GPS location of lecturers during assessments and comparison with student school locations.
        </p>
      </div>

      {filteredLocationReports.length > 0 ? (
        <div className="space-y-6">
          {filteredLocationReports.map((loc) => (
            <Card key={loc.lecturerId}>
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{loc.lecturerName}</CardTitle>
                    <CardDescription>
                      {loc.department} • {loc.lecturerEmail}
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-primary">{loc.summary.totalLocationTracked}</div>
                      <div className="text-muted-foreground text-xs">GPS Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-emerald-600">{loc.summary.withinGeofence}</div>
                      <div className="text-muted-foreground text-xs">In Geofence</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-red-600">{loc.summary.outsideGeofence}</div>
                      <div className="text-muted-foreground text-xs">Outside</div>
                    </div>
                    {loc.summary.averageDistanceMeters > 0 && (
                      <div className="text-center">
                        <div className="font-bold text-2xl text-amber-600">
                          {Math.round(loc.summary.averageDistanceMeters)}m
                        </div>
                        <div className="text-muted-foreground text-xs">Avg Distance</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {loc.assessments.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/60 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-2 text-xs font-semibold">Student</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold">Subject</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold">Slot</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold">Lecturer Location</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold">School Location</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold">Distance</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loc.assessments.map((a) => (
                          <tr key={a.id} className="border-t hover:bg-muted/20">
                            <td className="py-1.5 px-2">
                              <div className="font-medium">{a.studentName}</div>
                              <div className="text-xs text-muted-foreground">{a.studentAdmission}</div>
                            </td>
                            <td className="py-1.5 px-2 text-xs">{a.subject}</td>
                            <td className="py-1.5 px-2 text-center text-xs font-semibold">
                              A{a.assessmentNumber}
                            </td>
                            <td className="py-1.5 px-2 text-center text-xs">
                              <LocationCell lat={a.lecturerLat} lng={a.lecturerLng} fallback="No GPS" />
                            </td>
                            <td className="py-1.5 px-2 text-center text-xs">
                              {a.schoolName ? (
                                <>
                                  <span>{schoolLocationString(a)}</span>
                                  <div className="text-muted-foreground text-xs">{a.schoolName}</div>
                                </>
                              ) : (
                                <span className="text-muted-foreground italic">No school GPS</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-center text-xs">
                              {a.distanceFromSchool != null ? (
                                <span
                                  className={
                                    a.withinGeofence
                                      ? "text-emerald-600 font-semibold"
                                      : "text-red-600 font-semibold"
                                  }
                                >
                                  {a.distanceFromSchool}m
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              {a.withinGeofence === true ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" /> Inside
                                </span>
                              ) : a.withinGeofence === false ? (
                                <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                                  <XCircle className="h-3 w-3" /> Outside
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                                  <AlertTriangle className="h-3 w-3" /> Unknown
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm italic">
                    No GPS-tracked assessments for this lecturer.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No GPS location data available for any assessments yet.</p>
            <p className="text-sm mt-1">GPS data is captured when lecturers submit assessments from their devices.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
