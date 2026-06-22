"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";

interface AssessmentSlot {
  id: string;
  subject: string;
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

export function StudentAssessmentsClient({ students }: { students: StudentRow[] }) {
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
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const slots = [
          { key: "A1S1", value: row.original.a1s1 },
          { key: "A1S2", value: row.original.a1s2 },
          { key: "A2S1", value: row.original.a2s1 },
          { key: "A2S2", value: row.original.a2s2 },
          { key: "A3S1", value: row.original.a3s1 },
          { key: "A3S2", value: row.original.a3s2 },
        ];
        const completed = slots.filter((s) => s.value !== null).length;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {slots.map((slot, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      slot.value ? "bg-emerald-500" : "bg-muted-foreground/20"
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground">{slot.key}</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{completed}/6 assessments completed</span>
          </div>
        );
      },
    },
    {
      id: "subjects",
      header: "Subjects",
      cell: ({ row }) => {
        const completedSlots = [
          row.original.a1s1,
          row.original.a1s2,
          row.original.a2s1,
          row.original.a2s2,
          row.original.a3s1,
          row.original.a3s2,
        ].filter(Boolean);
        const subjects = [...new Set(completedSlots.map((s) => s!.subject))];
        return (
          <div className="text-sm">
            {subjects.length > 0 ? subjects.join(", ") : <span className="text-muted-foreground text-xs">—</span>}
          </div>
        );
      },
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
            Track the progress of your teaching practice assessments. Completion status is shown below.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="studentName"
        searchPlaceholder="Search..."
      />
    </div>
  );
}
