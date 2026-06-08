"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardEdit, MapPin, CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AssignedStudent {
  id: string;
  name: string;
  admissionNumber: string;
  course: string;
  email: string;
  phone: string;
  schoolName: string;
  schoolCounty: string;
  completedCount: number;
  avgScore: number;
  latestGrade: string | null;
  progressLabel: string;
  completedSlots: {
    A1S1: boolean;
    A1S2: boolean;
    A2S1: boolean;
    A2S2: boolean;
  };
}

export function LecturerStudentsClient({ students }: { students: AssignedStudent[] }) {
  const columns: ColumnDef<AssignedStudent>[] = [
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium truncate">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.admissionNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: "Course",
      cell: ({ row }) => (
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm truncate">{row.original.course}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "schoolName",
      header: "School",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm truncate">{row.original.schoolName}</p>
          {row.original.schoolCounty !== "N/A" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{row.original.schoolCounty}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "progress",
      header: "Assessment Progress",
      cell: ({ row }) => {
        const s = row.original;
        const slots = [
          { label: "A1S1", done: s.completedSlots.A1S1 },
          { label: "A1S2", done: s.completedSlots.A1S2 },
          { label: "A2S1", done: s.completedSlots.A2S1 },
          { label: "A2S2", done: s.completedSlots.A2S2 },
        ];
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {slots.map((slot, i) => (
                <div key={slot.label} className="flex items-center gap-1.5" title={slot.label}>
                  <div className="flex flex-col items-center">
                    {slot.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-muted-foreground/30" />}
                    <span className="text-[8px] font-bold text-muted-foreground mt-0.5">{slot.label}</span>
                  </div>
                  {i < 3 && <div className={`w-2 h-0.5 mt-[-10px] ${slot.done && slots[i+1].done ? "bg-emerald-400" : "bg-border/50"}`} />}
                </div>
              ))}
            </div>
            <Badge
              variant={s.progressLabel === "Fully Assessed" ? "default" : s.progressLabel === "Partially Assessed" ? "secondary" : "outline"}
              className={`text-[10px] px-1.5 py-0 ${
                s.progressLabel === "Fully Assessed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                s.progressLabel === "Partially Assessed" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : ""
              }`}
            >
              {s.progressLabel}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "score",
      header: "Avg Score",
      cell: ({ row }) => {
        const s = row.original;
        if (s.completedCount === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="text-center">
            <p className={`text-lg font-bold ${s.avgScore >= 70 ? "text-emerald-600" : s.avgScore < 40 ? "text-red-500" : "text-foreground"}`}>{s.avgScore}%</p>
            {s.latestGrade && <p className="text-[10px] text-muted-foreground font-semibold">{s.latestGrade}</p>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const s = row.original;
        const allDone = s.completedCount >= 4;
        return (
          <Link href={`/lecturer/assessments/new/${s.id}`}>
            <Button
              variant={allDone ? "outline" : "default"}
              size="sm"
              className={`rounded-xl whitespace-nowrap ${allDone ? "" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
            >
              {allDone ? (
                <><CheckCircle2 className="h-4 w-4 mr-1.5" /> View Results</>
              ) : (
                <><ArrowRight className="h-4 w-4 mr-1.5" /> Assess</>
              )}
            </Button>
          </Link>
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Trainee Roster</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            My Students
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage and assess the teacher trainees assigned to you.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="name"
        searchPlaceholder="Search students by name..."
      />
    </div>
  );
}
