"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shuffle, RotateCcw, AlertTriangle, Users, MapPin, CheckCircle2, Plus, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { generateRandomAssignments, resetAssignments, manualAssignStudents } from "../_actions/assignments";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

interface AssignmentRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  course: string;
  schoolName: string;
  schoolCounty: string;
  schoolZone: string | null;
  lecturerName: string;
  lecturerZone: string | null;
  assignmentLocked: boolean;
}

interface LecturerOption {
  id: string;
  name: string;
  zone: string;
}

export function AssignmentsClient({
  assignments,
  stats,
  lecturers,
}: {
  assignments: AssignmentRow[];
  stats: { total: number; assigned: number; unassigned: number };
  lecturers: LecturerOption[];
}) {
  const [ConfirmModal, confirm] = useConfirm();
  const [loading, setLoading] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
  
  // Manual Assignment State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningStudentIds, setAssigningStudentIds] = useState<string[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");

  const handleManualAssign = async () => {
    if (!selectedLecturerId || assigningStudentIds.length === 0) {
      toast.error("Please select a lecturer.");
      return;
    }
    
    setLoading(true);
    try {
      const result = await manualAssignStudents(assigningStudentIds, selectedLecturerId);
      if (result.success) {
        toast.success(result.message);
        setAssignModalOpen(false);
        setAssigningStudentIds([]);
        setSelectedLecturerId("");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to assign students.");
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Assignment Engine Error:", error);
      toast.error(error.message || "Failed to generate assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (stats.assigned === 0) return;
    
    const ok = await confirm("Reset Assignments", "WARNING: This will clear all current unlocked assignments. Are you sure you want to reset?");
    if (!ok) return;

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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
            <MapPin className="h-3 w-3" /> {row.original.schoolZone || "Unzoned"} • {row.original.schoolCounty}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lecturerName",
      header: "Assigned Lecturer",
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-primary dark:text-primary">{row.original.lecturerName}</span>
          {row.original.lecturerZone && (
            <p className="text-xs text-muted-foreground mt-0.5">Zone: {row.original.lecturerZone}</p>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => {
          setAssigningStudentIds([row.original.studentId]);
          setSelectedLecturerId("");
          setAssignModalOpen(true);
        }} className="text-blue-500 hover:text-blue-600">
          <Plus className="h-4 w-4 mr-1" /> Re-assign
        </Button>
      ),
    },
  ];

  const filteredAssignments = assignments.filter(a => {
    if (assignmentFilter === "assigned") return a.lecturerName !== "Unknown";
    if (assignmentFilter === "unassigned") return a.lecturerName === "Unknown";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Allocation Engine</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Zone-Aware Assignment Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Smartly allocate students to lecturers based on their supervision zones.
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
          <CardTitle>Smart Allocation Controls</CardTitle>
          <CardDescription>Group students by zone and distribute to lecturers assigned to the same zone (fallback to least loaded lecturer for unzoned students).</CardDescription>
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

      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Current Assignments</h2>
          <div className="flex items-center gap-3">
            <div className="w-[180px]">
              <Select value={assignmentFilter} onValueChange={(v: any) => setAssignmentFilter(v)}>
                <SelectTrigger className="h-10 border-primary/20 bg-background/50 backdrop-blur-sm shadow-sm rounded-xl">
                  <SelectValue placeholder="Filter Assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned (Unknown)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredAssignments}
          searchKey="studentName"
          searchPlaceholder="Search assignments by student..."
          renderBulkActions={(selectedRows, clearSelection) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAssigningStudentIds(selectedRows.map((r: any) => r.studentId));
                setSelectedLecturerId("");
                setAssignModalOpen(true);
                clearSelection();
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Lecturer ({selectedRows.length})
            </Button>
          )}
        />
      </div>

      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Lecturer</DialogTitle>
            <DialogDescription>Select a lecturer to assign to the {assigningStudentIds.length} selected student(s).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2 flex flex-col">
              <Label>Select Lecturer</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedLecturerId && "text-muted-foreground"
                      )}
                    />
                  }
                >
                  {selectedLecturerId
                    ? lecturers.find((l) => l.id === selectedLecturerId)?.name
                    : "Search lecturer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[375px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search lecturer..." />
                    <CommandList>
                      <CommandEmpty>No lecturer found.</CommandEmpty>
                      <CommandGroup>
                        {lecturers.map((l) => (
                          <CommandItem
                            key={l.id}
                            value={l.name}
                            onSelect={() => {
                              setSelectedLecturerId(l.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLecturerId === l.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {l.name} <span className="ml-1 text-muted-foreground text-xs">({l.zone})</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleManualAssign} disabled={loading || !selectedLecturerId}>
              {loading ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmModal />
    </div>
  );
}
