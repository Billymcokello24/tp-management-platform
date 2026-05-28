"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardEdit, MapPin } from "lucide-react";
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
  assessmentStatus: string;
}

export function LecturerStudentsClient({ students }: { students: AssignedStudent[] }) {
  const columns: ColumnDef<AssignedStudent>[] = [
    {
      accessorKey: "name",
      header: "Student Profile",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.admissionNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: "Course & Contact",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.course}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "schoolName",
      header: "Assigned School",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.schoolName}</p>
          {row.original.schoolCounty !== "N/A" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" /> {row.original.schoolCounty}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "assessmentStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.assessmentStatus === "Completed" ? "default" : "secondary"}
               className={row.original.assessmentStatus === "Completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
          {row.original.assessmentStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/lecturer/assessments/new/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <ClipboardEdit className="h-4 w-4 mr-2" />
            Assess
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Trainee Roster</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
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
