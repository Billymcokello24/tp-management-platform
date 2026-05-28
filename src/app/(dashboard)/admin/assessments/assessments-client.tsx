"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ClipboardCheck, Clock, FileText, CheckCircle2 } from "lucide-react";

interface AssessmentRow {
  id: string;
  studentName: string;
  admissionNumber: string;
  lecturerName: string;
  status: string;
  totalMarks: number;
  grade: string;
  performanceBand: string;
  generalComments: string;
  createdAt: string;
  // Included fields for export
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  SUBMITTED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  REVIEWED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export function AssessmentsClient({
  assessments,
  stats,
}: {
  assessments: AssessmentRow[];
  stats: { total: number; draft: number; submitted: number; reviewed: number; avgScore: number };
}) {

  // Function to trigger a CSV download
  const exportToCSV = () => {
    if (assessments.length === 0) return;

    // Define CSV Headers mapping exactly to what the university might want
    const headers = [
      "Assessment ID", "Date", "Status", "Student Name", "Admission No", "Lecturer Name", 
      "Total Marks (100)", "Grade", "Performance Band", "Scheme of Work (2)", "Objectives (4)", 
      "Activities (2)", "Sequence (4)", "Introduction (5)", "Logical Presentation (5)", 
      "Content Relevance (5)", "Content Adequacy (5)", "Teaching Strategies (5)", 
      "Teaching Skills (5)", "Content Mastery (5)", "Communication (5)", "Chalkboard Use (3)", 
      "Resource Timing (3)", "Resource Appropriateness (4)", "Innovativeness (5)", 
      "Learner Control (5)", "Learner Participation (5)", "Group Work (4)", "Rapport (5)", 
      "Closure (2)", "Concluding Activities (2)", "Assignment (1)", "Personality (5)", 
      "Self Appraisal (3)", "General Comments", "Areas of Strength", "Areas of Improvement"
    ];

    // Map each assessment to a row matching the headers
    const rows = assessments.map(a => [
      a.id,
      new Date(a.createdAt).toLocaleDateString(),
      a.status,
      `"${a.studentName}"`,
      a.admissionNumber,
      `"${a.lecturerName}"`,
      a.totalMarks,
      a.grade,
      a.performanceBand,
      a.schemeOfWorkMark, a.lessonPlanObjectives, a.lessonPlanActivities, a.lessonPlanSequence,
      a.introductionMark, a.logicalPresentation, a.contentRelevance, a.contentAdequacy,
      a.teachingStrategies, a.teachingSkills, a.contentMastery, a.communicationMark,
      a.chalkboardUse, a.resourceTiming, a.resourceAppropriateness, a.resourceInnovativeness,
      a.learnerControl, a.learnerParticipation, a.groupWork, a.teacherLearnerRapport,
      a.closureSkills, a.concludingActivities, a.assignmentMark, a.personalityMark,
      a.selfAppraisalMark,
      `"${(a.generalComments || "").replace(/"/g, '""')}"`,
      `"${(a.areasOfStrength || "").replace(/"/g, '""')}"`,
      `"${(a.areasOfImprovement || "").replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tp_assessments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<AssessmentRow>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.studentName}</p>
          <p className="text-xs text-muted-foreground">{row.original.admissionNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "lecturerName",
      header: "Lecturer",
    },
    {
      accessorKey: "totalMarks",
      header: "Score",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.totalMarks > 0 ? (
            <span className={row.original.totalMarks >= 70 ? "text-green-600" : row.original.totalMarks < 40 ? "text-red-600" : ""}>
              {row.original.totalMarks}%
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => row.original.grade !== "N/A" ? <Badge variant="outline">{row.original.grade}</Badge> : "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status] || ""}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <a href={`/admin/assessments/${row.original.id}`} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm">
            View PDF
          </Button>
        </a>
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
            Track and export all lecturer assessments and rubrics.
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
        <h2 className="text-xl font-semibold mb-4">Assessment Database</h2>
        <DataTable
          columns={columns}
          data={assessments}
          searchKey="studentName"
          searchPlaceholder="Search by student name..."
        />
      </div>
    </div>
  );
}
