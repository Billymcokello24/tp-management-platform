"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Users, School, Upload, Download, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createZone, updateZone, deleteZone, bulkDeleteZones, bulkCreateZones } from "../_actions/crud";
import { KenyaLocationPicker } from "@/components/shared/kenya-location-picker";
import { useConfirm } from "@/hooks/use-confirm";

type ZoneWithCounts = {
  id: string;
  name: string;
  county: string;
  subCounty: string | null;
  ward: string | null;
  village: string | null;
  description: string | null;
  isActive: boolean;
  _count: {
    schools: number;
    lecturers: number;
  };
};

export function ZonesClient({ zones }: { zones: ZoneWithCounts[] }) {
  const [ConfirmModal, confirm] = useConfirm();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneWithCounts | null>(null);

  const [form, setForm] = useState({
    name: "",
    county: "",
    subCounty: "",
    ward: "",
    village: "",
    description: "",
    isActive: true,
  });

  const resetForm = () => setForm({ name: "", county: "", subCounty: "", ward: "", village: "", description: "", isActive: true });

  const handleAdd = async () => {
    if (!form.name || !form.county) {
      toast.error("Please fill in zone name and county.");
      return;
    }
    setLoading(true);
    try {
      await createZone({
        name: form.name,
        county: form.county,
        subCounty: form.subCounty || undefined,
        ward: form.ward || undefined,
        village: form.village || undefined,
        description: form.description || undefined,
        isActive: form.isActive,
      });
      toast.success("Zone added successfully!");
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to add zone.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingZone) return;
    setLoading(true);
    try {
      await updateZone(editingZone.id, {
        name: form.name,
        county: form.county,
        subCounty: form.subCounty || undefined,
        ward: form.ward || undefined,
        village: form.village || undefined,
        description: form.description || undefined,
        isActive: form.isActive,
      });
      toast.success("Zone updated!");
      setEditOpen(false);
      setEditingZone(null);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to update zone.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zone: ZoneWithCounts) => {
    if (zone._count.schools > 0 || zone._count.lecturers > 0) {
      toast.error("Cannot delete a zone with assigned schools or lecturers.");
      return;
    }
    const ok = await confirm(`Delete ${zone.name}?`, `Are you sure you want to delete ${zone.name}?`);
    if (!ok) return;
    try {
      await deleteZone(zone.id);
      toast.success("Zone deleted.");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete zone.");
    }
  };

  const handleBulkDelete = async (selected: ZoneWithCounts[]) => {
    if (selected.some((z) => z._count.schools > 0 || z._count.lecturers > 0)) {
      toast.error("Some selected zones have assigned schools or lecturers. Unassign them first.");
      return;
    }
    const ok = await confirm("Bulk Delete", `Are you sure you want to delete ${selected.length} zones?`);
    if (!ok) return;
    setLoading(true);
    try {
      const result = await bulkDeleteZones(selected.map((z) => z.id));
      toast.success(`Deleted ${result.deleted} zones. Skipped ${result.skipped}.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete zones.");
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
          if (h === "description") row.description = values[i];
        });
        return row;
      }).filter((r) => r.name && r.county);

      if (rows.length === 0) {
        toast.error("No valid rows found. Ensure CSV has columns: name, county");
        return;
      }

      const result = await bulkCreateZones(rows);
      toast.success(`Imported ${result.created} zones. Skipped ${result.skipped} duplicates.`);
      setCsvOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to import CSV.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (zone: ZoneWithCounts) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      county: zone.county,
      subCounty: zone.subCounty || "",
      ward: zone.ward || "",
      village: zone.village || "",
      description: zone.description || "",
      isActive: zone.isActive,
    });
    setEditOpen(true);
  };

  const columns: ColumnDef<ZoneWithCounts>[] = [
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
      header: "Zone Name",
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-primary">{row.original.name}</span>
          {row.original.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.description}</p>}
        </div>
      ),
    },
    {
      accessorKey: "county",
      header: "County",
    },
    {
      id: "stats",
      header: "Assignments",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" title="Schools in this zone">
            <School className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="secondary" className="bg-primary/5">{row.original._count.schools}</Badge>
          </div>
          <div className="flex items-center gap-1.5" title="Lecturers assigned">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="secondary" className="bg-primary/5">{row.original._count.lecturers}</Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"} className={row.original.isActive ? "bg-emerald-500" : ""}>
          {row.original.isActive ? "Active" : "Inactive"}
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
        <Label>Zone Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="E.g., Nairobi Zone A" />
      </div>
      
      <KenyaLocationPicker 
        value={{ county: form.county, subCounty: form.subCounty, ward: form.ward, village: form.village }} 
        onChange={(data) => setForm({ ...form, ...data })} 
        required 
      />

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          value={form.description} 
          onChange={(e) => setForm({ ...form, description: e.target.value })} 
          placeholder="Optional notes about this zone..."
          rows={3}
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch 
          id="isActive" 
          checked={form.isActive} 
          onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} 
        />
        <Label htmlFor="isActive">Active (can be assigned)</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Territory Management</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Supervision Zones
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage geographical zones for TP supervision assignments.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={zones}
        searchKey="name"
        searchPlaceholder="Search zones by name..."
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
                  <DialogTitle>Import Zones from CSV</DialogTitle>
                  <DialogDescription className="space-y-3">
                    <p>Upload a CSV with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">name, county, description</code></p>
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
                <Plus className="h-4 w-4 mr-2" /> Add Zone
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Zone</DialogTitle>
                  <DialogDescription>Create a new geographical supervision zone.</DialogDescription>
                </DialogHeader>
                {formFields}
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={loading}>
                    {loading ? "Adding..." : "Add Zone"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setEditingZone(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>Update supervision zone details.</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmModal />
    </div>
  );
}
