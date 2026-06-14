"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

interface AssessmentSlot {
  id: string;
  totalMarks: number;
  grade: string;
  status: string;
  createdAt: string;
}

interface StudentRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  a1s1: AssessmentSlot | null;
  a1s2: AssessmentSlot | null;
  a2s1: AssessmentSlot | null;
  a2s2: AssessmentSlot | null;
  a3s1: AssessmentSlot | null;
  a3s2: AssessmentSlot | null;
}

const scoreColor = (score: number | undefined) => {
  if (!score) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-600 font-bold";
  if (score < 40) return "text-red-600 font-bold";
  return "text-foreground font-semibold";
};

export function LecturerAssessmentsClient({ students }: { students: StudentRow[] }) {

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
      id: "a1s1",
      header: () => <div className="text-center text-xs">A1S1</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a1s1} />,
    },
    {
      id: "a1s2",
      header: () => <div className="text-center text-xs">A1S2</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a1s2} />,
    },
    {
      id: "a2s1",
      header: () => <div className="text-center text-xs">A2S1</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a2s1} />,
    },
    {
      id: "a2s2",
      header: () => <div className="text-center text-xs">A2S2</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a2s2} />,
    },
    {
      id: "a3s1",
      header: () => <div className="text-center text-xs">A3S1</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a3s1} />,
    },
    {
      id: "a3s2",
      header: () => <div className="text-center text-xs">A3S2</div>,
      cell: ({ row }) => <ScoreCell slot={row.original.a3s2} />,
    },
    {
      id: "average",
      header: () => <div className="text-center">Avg</div>,
      cell: ({ row }) => {
        const scores = [
          row.original.a1s1?.totalMarks, 
          row.original.a1s2?.totalMarks, 
          row.original.a2s1?.totalMarks,
          row.original.a2s2?.totalMarks,
          row.original.a3s1?.totalMarks,
          row.original.a3s2?.totalMarks,
        ].filter((v): v is number => v != null);
        
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
        const completed = [
          row.original.a1s1, 
          row.original.a1s2, 
          row.original.a2s1,
          row.original.a2s2,
          row.original.a3s1,
          row.original.a3s2,
        ].filter(Boolean).length;
        return (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i <= completed ? "bg-emerald-500" : "bg-muted-foreground/20"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{completed}/6</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/lecturer/assessments/${row.original.studentId}`}>
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Assessment Records</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            My Assessments
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            History of all student assessments you have completed, grouped by student.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="studentName"
        searchPlaceholder="Search by student name..."
      />
    </div>
  );
}
