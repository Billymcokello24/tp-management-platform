"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Upload, Pencil, Trash2, Download, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createStudent, updateStudent, deleteStudent, bulkCreateStudents, bulkDeleteStudents } from "../_actions/crud";
import { useConfirm } from "@/hooks/use-confirm";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  admissionNumber: string;
  course: string;
  subjects: string[];
  tpStatus: string;
  schoolId: string | null;
  schoolName: string;
  schoolCounty: string;
  lecturerName: string;
  assignmentId: string | null;
}

interface SchoolOption {
  id: string;
  name: string;
  county: string;
}

interface LecturerOption {
  id: string;
  name: string;
  zone: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export function StudentsClient({ students, schools, lecturers }: { students: Student[]; schools: SchoolOption[]; lecturers: LecturerOption[] }) {
  const [ConfirmModal, confirm] = useConfirm();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [assigningStudentIds, setAssigningStudentIds] = useState<string[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    admissionNumber: "",
    course: "",
    subjects: "",
    phone: "",
    schoolId: "",
    password: "",
  });

  const resetForm = () => setForm({ name: "", admissionNumber: "", course: "", subjects: "", phone: "", schoolId: "", password: "" });

  const handleAdd = async () => {
    if (!form.name || !form.admissionNumber || !form.course) {
      toast.error("Please fill in name, admission number, and course.");
      return;
    }
    setLoading(true);
    try {
      await createStudent({
        name: form.name,
        admissionNumber: form.admissionNumber,
        course: form.course,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        phone: form.phone || undefined,
        schoolId: form.schoolId || undefined,
        password: form.password || undefined,
      });
      toast.success("Student created successfully!");
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingStudent) return;
    setLoading(true);
    try {
      await updateStudent(editingStudent.id, {
        name: form.name,
        admissionNumber: form.admissionNumber,
        course: form.course,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        phone: form.phone || undefined,
        schoolId: form.schoolId || undefined,
        password: form.password || undefined,
      });
      toast.success("Student updated successfully!");
      setEditOpen(false);
      setEditingStudent(null);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to update student.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student: Student) => {
    const ok = await confirm(`Delete ${student.name}?`, `Are you sure you want to delete ${student.name}? This action cannot be undone.`);
    if (!ok) return;
    try {
      await deleteStudent(student.id);
      toast.success("Student deleted.");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete student.");
    }
  };

  const handleBulkDelete = async (selected: Student[]) => {
    const ok = await confirm("Bulk Delete", `Are you sure you want to delete ${selected.length} students?`);
    if (!ok) return;
    setLoading(true);
    try {
      await bulkDeleteStudents(selected.map((s) => s.id));
      toast.success(`${selected.length} students deleted.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete students.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      admissionNumber: student.admissionNumber,
      course: student.course,
      subjects: student.subjects.join(", "),
      phone: student.phone || "",
      schoolId: student.schoolId || "",
      password: "", // Don't pre-fill password on edit
    });
    setEditOpen(true);
  };

  const handleManualAssign = async () => {
    if (!selectedLecturerId || assigningStudentIds.length === 0) {
      toast.error("Please select a lecturer.");
      return;
    }
    
    setLoading(true);
    try {
      const { manualAssignStudents } = await import("../_actions/assignments");
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

  const handleCsvUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("csv") as File;
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: any = {};
        headers.forEach((h, i) => {
          if (h === "name") row.name = values[i];
          if (h === "admissionnumber" || h === "admission_number" || h === "adm_no" || h === "admno") row.admissionNumber = values[i];
          if (h === "course") row.course = values[i];
          if (h === "subjects") row.subjects = values[i];
          if (h === "phone") row.phone = values[i];
          if (h === "password") row.password = values[i];
          if (h === "school") row.school = values[i];
        });
        return row;
      }).filter((r) => r.name && r.admissionNumber);

      if (rows.length === 0) {
        toast.error("No valid rows found. Ensure CSV has columns: name, admissionNumber, course, subjects");
        return;
      }

      const result = await bulkCreateStudents(rows);
      toast.success(`Imported ${result.created} students. Skipped ${result.skipped} duplicates.`);
      setCsvOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to import CSV.");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Student>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "admissionNumber",
      header: "Adm No",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.admissionNumber}</span>,
    },
    { accessorKey: "course", header: "Course" },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.subjects.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>
      ),
    },
    { accessorKey: "schoolName", header: "School" },
    { accessorKey: "lecturerName", header: "Lecturer" },
    {
      accessorKey: "tpStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.tpStatus] || ""}>
          {row.original.tpStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            setAssigningStudentIds([row.original.id]);
            setSelectedLecturerId(row.original.assignmentId || "");
            setAssignModalOpen(true);
          }} className="text-blue-500 hover:text-blue-600">
            <Plus className="h-4 w-4 mr-1" /> Assign
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label>Admission No *</Label>
          <Input value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} placeholder="ED/1234/2026" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Course *</Label>
          <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="B.Ed (Arts)" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Subjects (comma-separated)</Label>
        <Input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Mathematics, Geography" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>School</Label>
          <Select value={form.schoolId} onValueChange={(v) => setForm({ ...form, schoolId: v || "" })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.county})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Default: password123" />
        </div>
      </div>
    </div>
  );

  const filteredStudents = students.filter(s => {
    if (assignmentFilter === "assigned") return s.assignmentId !== null;
    if (assignmentFilter === "unassigned") return s.assignmentId === null;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Student Registry</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Student Management
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage all Teaching Practice students across the institution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-[180px]">
            <Select value={assignmentFilter} onValueChange={(v: any) => setAssignmentFilter(v)}>
              <SelectTrigger className="h-10 border-primary/20 bg-background/50 backdrop-blur-sm shadow-sm rounded-xl">
                <SelectValue placeholder="Filter Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        searchKey="name"
        searchPlaceholder="Search students by name..."
        onDeleteSelected={handleBulkDelete}
        isDeletingSelected={loading}
        renderBulkActions={(selectedRows, clearSelection) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAssigningStudentIds(selectedRows.map((r: any) => r.id));
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
        toolbar={
          <div className="flex items-center gap-2">
            {/* CSV Import Dialog */}
            <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm" />}>
                <Upload className="h-4 w-4 mr-2" /> Import CSV
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Students from CSV</DialogTitle>
                  <DialogDescription className="space-y-3">
                    <p>Upload a CSV file with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">name, admissionNumber, course, subjects, phone, password, school</code></p>
                    <a href="/student_template.csv" download className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1 mt-2">
                      <Download className="h-3 w-3" /> Download CSV Template
                    </a>
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCsvUpload}>
                  <div className="py-4">
                    <Input name="csv" type="file" accept=".csv" required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Importing..." : "Upload & Import"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Student Dialog */}
            <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger render={<Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm" />}>
                <Plus className="h-4 w-4 mr-2" /> Add Student
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>Create a new student account. Default password will be <code className="text-xs bg-muted px-1 py-0.5 rounded">password123</code>.</DialogDescription>
                </DialogHeader>
                {formFields}
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={loading}>
                    {loading ? "Creating..." : "Create Student"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setEditingStudent(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student details.</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
