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
import { Plus, Pencil, Trash2, Users, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { createSchool, updateSchool, deleteSchool, bulkCreateSchools, bulkDeleteSchools } from "../_actions/crud";

interface SchoolRow {
  id: string;
  name: string;
  county: string;
  subCounty: string;
  principal: string | null;
  phone: string | null;
  email: string | null;
  studentsAssigned: number;
}

export function SchoolsClient({ schools }: { schools: SchoolRow[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolRow | null>(null);

  const [form, setForm] = useState({
    name: "",
    county: "",
    subCounty: "",
    principal: "",
    phone: "",
    email: "",
  });

  const resetForm = () => setForm({ name: "", county: "", subCounty: "", principal: "", phone: "", email: "" });

  const handleAdd = async () => {
    if (!form.name || !form.county || !form.subCounty) {
      toast.error("Please fill in school name, county, and sub-county.");
      return;
    }
    setLoading(true);
    try {
      await createSchool({
        name: form.name,
        county: form.county,
        subCounty: form.subCounty,
        principal: form.principal || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      });
      toast.success("School added successfully!");
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to add school.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingSchool) return;
    setLoading(true);
    try {
      await updateSchool(editingSchool.id, {
        name: form.name,
        county: form.county,
        subCounty: form.subCounty,
        principal: form.principal || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      });
      toast.success("School updated!");
      setEditOpen(false);
      setEditingSchool(null);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to update school.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (school: SchoolRow) => {
    if (school.studentsAssigned > 0) {
      toast.error("Cannot delete a school with assigned students. Reassign them first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${school.name}?`)) return;
    try {
      await deleteSchool(school.id);
      toast.success("School deleted.");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete school.");
    }
  };

  const handleBulkDelete = async (selected: SchoolRow[]) => {
    if (selected.some((s) => s.studentsAssigned > 0)) {
      toast.error("Some selected schools have assigned students. Unassign them first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selected.length} schools?`)) return;
    setLoading(true);
    try {
      await bulkDeleteSchools(selected.map((s) => s.id));
      toast.success(`${selected.length} schools deleted.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete schools.");
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
          if (h === "county") row.county = values[i];
          if (h === "subcounty" || h === "sub_county") row.subCounty = values[i];
          if (h === "principal") row.principal = values[i];
          if (h === "phone") row.phone = values[i];
          if (h === "email") row.email = values[i];
        });
        return row;
      }).filter((r) => r.name && r.county && r.subCounty);

      if (rows.length === 0) {
        toast.error("No valid rows found. Ensure CSV has columns: name, county, subCounty");
        return;
      }

      const result = await bulkCreateSchools(rows);
      toast.success(`Imported ${result.created} schools. Skipped ${result.skipped} duplicates.`);
      setCsvOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to import CSV.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (school: SchoolRow) => {
    setEditingSchool(school);
    setForm({
      name: school.name,
      county: school.county,
      subCounty: school.subCounty,
      principal: school.principal || "",
      phone: school.phone || "",
      email: school.email || "",
    });
    setEditOpen(true);
  };

  const columns: ColumnDef<SchoolRow>[] = [
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
      header: "School Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: "county", header: "County" },
    { accessorKey: "subCounty", header: "Sub-County" },
    {
      accessorKey: "principal",
      header: "Principal",
      cell: ({ row }) => row.original.principal || "-",
    },
    {
      accessorKey: "studentsAssigned",
      header: "Students",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="secondary">{row.original.studentsAssigned}</Badge>
        </div>
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
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>School Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nairobi High School" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>County *</Label>
          <Input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} placeholder="Nairobi" />
        </div>
        <div className="space-y-2">
          <Label>Sub-County *</Label>
          <Input value={form.subCounty} onChange={(e) => setForm({ ...form, subCounty: e.target.value })} placeholder="Westlands" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Principal</Label>
          <Input value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} placeholder="Mr. Omondi" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@nairobi-high.ac.ke" type="email" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Placement Registry</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            School Management
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage all TP placement schools.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={schools}
        searchKey="name"
        searchPlaceholder="Search schools by name..."
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
                  <DialogTitle>Import Schools from CSV</DialogTitle>
                  <DialogDescription className="space-y-3">
                    <p>Upload a CSV with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">name, county, subCounty, principal, phone, email</code></p>
                    <a href="/school_template.csv" download className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1 mt-2">
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
                <Plus className="h-4 w-4 mr-2" /> Add School
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New School</DialogTitle>
                  <DialogDescription>Register a new TP placement school.</DialogDescription>
                </DialogHeader>
                {formFields}
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={loading}>
                    {loading ? "Adding..." : "Add School"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setEditingSchool(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>Update school details.</DialogDescription>
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
