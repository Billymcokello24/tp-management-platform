"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

interface AssessmentRow {
  id: string;
  lecturerName: string;
  status: string;
  totalMarks: number;
  grade: string;
  createdAt: string;
}

export function StudentAssessmentsClient({ assessments }: { assessments: AssessmentRow[] }) {
  const columns: ColumnDef<AssessmentRow>[] = [
    {
      accessorKey: "lecturerName",
      header: "Assessed By",
    },
    {
      accessorKey: "createdAt",
      header: "Assessment Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "totalMarks",
      header: "Score",
      cell: ({ row }) => (
        <div className="font-medium">
          <span className={row.original.totalMarks >= 70 ? "text-green-600" : row.original.totalMarks < 40 ? "text-red-600" : ""}>
            {row.original.totalMarks}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => <Badge variant="outline">{row.original.grade}</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/student/assessments/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            View / Print
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Official Records</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            My Assessments
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            View the official assessment reports completed by your supervisor.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={assessments}
        searchKey="lecturerName"
        searchPlaceholder="Search by supervisor name..."
      />
    </div>
  );
}
