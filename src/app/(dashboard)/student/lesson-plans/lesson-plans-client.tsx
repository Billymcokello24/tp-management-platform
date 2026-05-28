"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilePlus, Eye, Edit } from "lucide-react";
import Link from "next/link";

interface LessonPlanRow {
  id: string;
  topic: string;
  subject: string;
  classForm: string;
  status: string;
  date: string;
  createdAt: string;
}

export function LessonPlansClient({ plans }: { plans: LessonPlanRow[] }) {
  const columns: ColumnDef<LessonPlanRow>[] = [
    {
      accessorKey: "topic",
      header: "Topic / Subject",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.topic}</p>
          <p className="text-xs text-muted-foreground">{row.original.subject}</p>
        </div>
      ),
    },
    {
      accessorKey: "classForm",
      header: "Class",
    },
    {
      accessorKey: "date",
      header: "Teaching Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        let colorClass = "";

        if (s === "APPROVED") { variant = "default"; colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"; }
        else if (s === "SUBMITTED") { variant = "default"; colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"; }
        else if (s === "DRAFT") { variant = "secondary"; }
        else if (s === "REJECTED") { variant = "destructive"; }

        return <Badge variant={variant} className={colorClass}>{s.replace("_", " ")}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.status === "DRAFT" ? (
            <Link href={`/student/lesson-plans/edit/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
            </Link>
          ) : (
            <Link href={`/student/lesson-plans/${row.original.id}`}>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                <Eye className="h-4 w-4 mr-2" /> View / PDF
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Lesson Builder</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Lesson Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage your digital lesson plans and submissions.
          </p>
        </div>
        <Link href="/student/lesson-plans/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
            <FilePlus className="h-4 w-4 mr-2" /> Create Lesson Plan
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={plans}
        searchKey="topic"
        searchPlaceholder="Search by topic..."
      />
    </div>
  );
}
