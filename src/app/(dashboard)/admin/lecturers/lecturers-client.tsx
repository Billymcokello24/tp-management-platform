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
import { Plus, Upload, Pencil, Trash2, Users, Download } from "lucide-react";
import { toast } from "sonner";
import { createLecturer, updateLecturer, deleteLecturer, bulkCreateLecturers, bulkDeleteLecturers } from "../_actions/crud";

interface Lecturer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  zone: string | null;
  county: string | null;
  assignedStudents: number;
  assessmentsDone: number;
  assessmentsPending: number;
}

export function LecturersClient({ lecturers }: { lecturers: Lecturer[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    zone: "",
    county: "",
    password: "",
  });

  const resetForm = () => setForm({ name: "", email: "", phone: "", department: "", zone: "", county: "", password: "" });

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.department) {
      toast.error("Please fill in name, email, and department.");
      return;
    }
    setLoading(true);
    try {
      await createLecturer({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        department: form.department,
        zone: form.zone || undefined,
        county: form.county || undefined,
        password: form.password || undefined,
      });
      toast.success("Lecturer created!");
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to create lecturer.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingLecturer) return;
    setLoading(true);
    try {
      await updateLecturer(editingLecturer.id, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        department: form.department,
        zone: form.zone || undefined,
        county: form.county || undefined,
      });
      toast.success("Lecturer updated!");
      setEditOpen(false);
      setEditingLecturer(null);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to update lecturer.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lecturer: Lecturer) => {
    if (!confirm(`Are you sure you want to delete ${lecturer.name}?`)) return;
    try {
      await deleteLecturer(lecturer.id);
      toast.success("Lecturer deleted.");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete lecturer.");
    }
  };

  const handleBulkDelete = async (selected: Lecturer[]) => {
    if (!confirm(`Are you sure you want to delete ${selected.length} lecturers?`)) return;
    setLoading(true);
    try {
      await bulkDeleteLecturers(selected.map((s) => s.id));
      toast.success(`${selected.length} lecturers deleted.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete lecturers.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (lecturer: Lecturer) => {
    setEditingLecturer(lecturer);
    setForm({
      name: lecturer.name,
      email: lecturer.email,
      phone: lecturer.phone || "",
      department: lecturer.department,
      zone: lecturer.zone || "",
      county: lecturer.county || "",
      password: "", // Don't pre-fill password on edit
    });
    setEditOpen(true);
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
          if (h === "email") row.email = values[i];
          if (h === "department") row.department = values[i];
          if (h === "zone") row.zone = values[i];
          if (h === "county") row.county = values[i];
          if (h === "phone") row.phone = values[i];
          if (h === "password") row.password = values[i];
        });
        return row;
      }).filter((r) => r.name && r.email);

      if (rows.length === 0) {
        toast.error("No valid rows found. Ensure CSV has columns: name, email, department, zone, county");
        return;
      }

      const result = await bulkCreateLecturers(rows);
      toast.success(`Imported ${result.created} lecturers. Skipped ${result.skipped} duplicates.`);
      setCsvOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to import CSV.");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Lecturer>[] = [
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
    { accessorKey: "department", header: "Department" },
    {
      accessorKey: "assignedStudents",
      header: "Students",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{row.original.assignedStudents}</span>
        </div>
      ),
    },
    {
      id: "assessments",
      header: "Assessments",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {row.original.assessmentsDone} done
          </Badge>
          {row.original.assessmentsPending > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {row.original.assessmentsPending} pending
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "zone",
      header: "Zone",
      cell: ({ row }) => row.original.zone || "-",
    },
    {
      accessorKey: "county",
      header: "County",
      cell: ({ row }) => row.original.county || "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
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
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Smith" />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@tmu.ac.ke" type="email" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Department *</Label>
          <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Educational Foundations" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Zone</Label>
          <Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Nairobi" />
        </div>
        <div className="space-y-2">
          <Label>County</Label>
          <Input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} placeholder="Nairobi" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Default: password123" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Faculty Registry</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Lecturer Management
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage all TP supervisors and their workloads.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={lecturers}
        searchKey="name"
        searchPlaceholder="Search lecturers by name..."
        onDeleteSelected={handleBulkDelete}
        isDeletingSelected={loading}
        toolbar={
          <div className="flex items-center gap-2">
            <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm" />}>
                <Upload className="h-4 w-4 mr-2" /> Import CSV
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Lecturers from CSV</DialogTitle>
                  <DialogDescription className="space-y-3">
                    <p>Upload a CSV with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">name, email, department, zone, county, phone, password</code></p>
                    <a href="/lecturer_template.csv" download className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1 mt-2">
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

            <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger render={<Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm" />}>
                <Plus className="h-4 w-4 mr-2" /> Add Lecturer
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Lecturer</DialogTitle>
                  <DialogDescription>Create a new supervisor account. Default password: <code className="text-xs bg-muted px-1 py-0.5 rounded">password123</code>.</DialogDescription>
                </DialogHeader>
                {formFields}
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={loading}>
                    {loading ? "Creating..." : "Create Lecturer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setEditingLecturer(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Lecturer</DialogTitle>
            <DialogDescription>Update lecturer details.</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
