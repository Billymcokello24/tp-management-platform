"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ClipboardCheck, Clock, FileText, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";

interface AssessmentSlot {
  id: string;
  totalMarks: number;
  grade: string;
  status: string;
  lecturerName: string;
  createdAt: string;
}

interface StudentRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  course: string;
  schoolName: string;
  a1: AssessmentSlot | null;
  a2: AssessmentSlot | null;
  a3: AssessmentSlot | null;
}

const scoreColor = (score: number | undefined) => {
  if (!score) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-600 font-bold";
  if (score < 40) return "text-red-600 font-bold";
  return "text-foreground font-semibold";
};

export function AssessmentsClient({
  students,
  stats,
}: {
  students: StudentRow[];
  stats: { total: number; draft: number; submitted: number; reviewed: number; avgScore: number };
}) {

  // CSV Export — one row per student with A1/A2/A3 columns
  const exportToCSV = () => {
    if (students.length === 0) return;

    const headers = [
      "Student Name", "Admission No", "Course", "School",
      "A1 Score", "A1 Grade", "A1 Lecturer", "A1 Date",
      "A2 Score", "A2 Grade", "A2 Lecturer", "A2 Date",
      "A3 Score", "A3 Grade", "A3 Lecturer", "A3 Date",
      "Average Score"
    ];

    const rows = students.map(s => {
      const scores = [s.a1?.totalMarks, s.a2?.totalMarks, s.a3?.totalMarks].filter((v): v is number => v != null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "";
      return [
        `"${s.studentName}"`, s.admissionNumber, `"${s.course}"`, `"${s.schoolName}"`,
        s.a1?.totalMarks ?? "", s.a1?.grade ?? "", `"${s.a1?.lecturerName ?? ""}"`, s.a1 ? new Date(s.a1.createdAt).toLocaleDateString() : "",
        s.a2?.totalMarks ?? "", s.a2?.grade ?? "", `"${s.a2?.lecturerName ?? ""}"`, s.a2 ? new Date(s.a2.createdAt).toLocaleDateString() : "",
        s.a3?.totalMarks ?? "", s.a3?.grade ?? "", `"${s.a3?.lecturerName ?? ""}"`, s.a3 ? new Date(s.a3.createdAt).toLocaleDateString() : "",
        avg,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tp_assessments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ScoreCell = ({ slot }: { slot: AssessmentSlot | null }) => {
    if (!slot) return <span className="text-muted-foreground text-xs">—</span>;
    return (
      <div className="text-center">
        <span className={scoreColor(slot.totalMarks)}>{slot.totalMarks}</span>
        <span className="text-muted-foreground text-xs">/100</span>
      </div>
    );
  };

  const columns: ColumnDef<StudentRow>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.studentName}</p>
          <p className="text-xs text-muted-foreground">{row.original.admissionNumber}</p>
        </div>
      ),
    },
    {
      id: "a1",
      header: () => <div className="text-center">A1</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a1} />,
    },
    {
      id: "a2",
      header: () => <div className="text-center">A2</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a2} />,
    },
    {
      id: "a3",
      header: () => <div className="text-center">A3</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a3} />,
    },
    {
      id: "average",
      header: () => <div className="text-center">Avg</div>,
      cell: ({ row }) => {
        const scores = [row.original.a1?.totalMarks, row.original.a2?.totalMarks, row.original.a3?.totalMarks].filter((v): v is number => v != null);
        if (scores.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        return (
          <div className="text-center">
            <span className={scoreColor(avg)}>{avg}</span>
            <span className="text-muted-foreground text-xs">%</span>
          </div>
        );
      },
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const completed = [row.original.a1, row.original.a2, row.original.a3].filter(Boolean).length;
        return (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i <= completed ? "bg-emerald-500" : "bg-muted-foreground/20"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{completed}/3</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/admin/assessments/${row.original.studentId}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2 text-primary" />
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Rubric Database</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Assessment Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Track and export all lecturer assessments and rubrics — grouped by student.
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shrink-0">
          <Download className="h-4 w-4 mr-2" /> Export All to CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <div className="text-2xl font-bold">{stats.draft}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold">{stats.submitted}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="text-2xl font-bold">{stats.reviewed}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Student Assessment Database</h2>
        <DataTable
          columns={columns}
          data={students}
          searchKey="studentName"
          searchPlaceholder="Search by student name..."
        />
      </div>
    </div>
  );
}
