"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilePlus, Eye, Edit, Upload, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { saveLessonPlan } from "../_actions/lesson-plans";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const downloadTemplate = () => {
    const header = "Subject,Class/Form,Stream,Topic,SubTopic,Date,StartTime,EndTime,Duration,Objectives\n";
    const example = '"Mathematics","Form 2","East","Algebra","Linear Equations","2026-06-01","08:00","08:40","40 mins","By the end of the lesson..."\n';
    const blob = new Blob([header + example], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lesson_plans_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        if (lines.length > 1) {
          const parsedRows = lines.slice(1).filter(l => l.trim().length > 0).map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
            return {
              subject: values[0] || "Untitled Subject",
              classForm: values[1] || "",
              stream: values[2] || "",
              topic: values[3] || "Untitled Topic",
              subTopic: values[4] || "",
              date: values[5] ? new Date(values[5]).toISOString() : new Date().toISOString(),
              startTime: values[6] || "",
              endTime: values[7] || "",
              duration: values[8] || "",
              objectives: values[9] || "",
              status: "DRAFT"
            };
          });

          // Upload sequentially to avoid overwhelming the server
          let count = 0;
          for (const plan of parsedRows) {
            await saveLessonPlan(plan);
            count++;
          }
          toast.success(`Successfully uploaded ${count} lesson plans as drafts.`);
          window.location.reload();
        }
      } catch (error: any) {
        toast.error("Failed to process CSV file.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 pb-8">
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="rounded-xl h-10 hidden sm:flex">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Template
          </Button>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <Button variant="secondary" size="sm" className="rounded-xl h-10 w-full sm:w-auto pointer-events-none" disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" /> {isUploading ? "Uploading..." : "Bulk CSV"}
            </Button>
          </div>
          <Link href="/student/lesson-plans/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm h-10">
              <FilePlus className="h-4 w-4 mr-2" /> New Lesson
            </Button>
          </Link>
        </div>
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
