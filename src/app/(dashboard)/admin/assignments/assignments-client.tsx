"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shuffle, RotateCcw, AlertTriangle, Users, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateRandomAssignments, resetAssignments } from "../_actions/assignments";

interface AssignmentRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  course: string;
  schoolName: string;
  schoolCounty: string;
  lecturerName: string;
  assignmentLocked: boolean;
}

export function AssignmentsClient({
  assignments,
  stats,
}: {
  assignments: AssignmentRow[];
  stats: { total: number; assigned: number; unassigned: number };
}) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (stats.unassigned === 0) {
      toast.info("All students are already assigned!");
      return;
    }
    
    setLoading(true);
    try {
      const result = await generateRandomAssignments();
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (stats.assigned === 0) return;
    
    if (!confirm("WARNING: This will clear all current unlocked assignments. Are you sure you want to reset?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await resetAssignments();
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reset assignments.");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<AssignmentRow>[] = [
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
    { accessorKey: "course", header: "Course" },
    {
      accessorKey: "schoolName",
      header: "School",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.schoolName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" /> {row.original.schoolCounty}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lecturerName",
      header: "Assigned Lecturer",
      cell: ({ row }) => <span className="font-medium text-primary dark:text-primary">{row.original.lecturerName}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Allocation Engine</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Assignment Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Randomly allocate students to lecturers for Teaching Practice supervision.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="text-2xl font-bold">{stats.assigned}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned (Pending)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${stats.unassigned > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
              <div className="text-2xl font-bold">{stats.unassigned}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Allocation Controls</CardTitle>
          <CardDescription>Use the Fisher-Yates shuffle algorithm to evenly distribute unassigned students to available lecturers.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={handleGenerate} 
              disabled={loading || stats.unassigned === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm"
            >
              <Shuffle className="h-4 w-4 mr-2" /> 
              {loading ? "Generating..." : "Generate Random Assignments"}
            </Button>
            
            <Button 
              onClick={handleReset} 
              disabled={loading || stats.assigned === 0}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset All Unlocked
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
        <DataTable
          columns={columns}
          data={assignments}
          searchKey="studentName"
          searchPlaceholder="Search assignments by student..."
        />
      </div>
    </div>
  );
}
