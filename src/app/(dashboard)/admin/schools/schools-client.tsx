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
import { Plus, Pencil, Trash2, Users, Upload, Download, MapPin, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createSchool, updateSchool, deleteSchool, bulkCreateSchools, bulkDeleteSchools } from "../_actions/crud";
import { useConfirm } from "@/hooks/use-confirm";
import { KenyaLocationPicker } from "@/components/shared/kenya-location-picker";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./location-picker"), { ssr: false, loading: () => <div className="h-[250px] bg-muted w-full animate-pulse rounded-md mt-2"></div> });
const SchoolMap = dynamic(() => import("@/components/shared/school-map"), { ssr: false, loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl mt-2 border border-border"></div> });

interface SchoolRow {
  id: string;
  name: string;
  county: string;
  subCounty: string;
  principal: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  geofenceRadius: number;
  subjects: string[];
  zoneId: string | null;
  zoneName: string | null;
  studentsAssigned: number;
  fullyAssessed: number;
  inProgress: number;
}

interface ZoneOption {
  id: string;
  name: string;
}

export function SchoolsClient({ schools, zones, globalMetrics }: { schools: SchoolRow[], zones: ZoneOption[], globalMetrics?: any }) {
  const [ConfirmModal, confirm] = useConfirm();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolRow | null>(null);

  const [form, setForm] = useState({
    name: "",
    county: "",
    subCounty: "",
    ward: "",
    village: "",
    principal: "",
    phone: "",
    email: "",
    address: "",
    latitude: "",
    longitude: "",
    geofenceRadius: "500",
    subjects: "",
    zoneId: "",
  });

  const resetForm = () => setForm({ 
    name: "", county: "", subCounty: "", ward: "", village: "", principal: "", phone: "", email: "", 
    address: "", latitude: "", longitude: "", geofenceRadius: "500", subjects: "", zoneId: "" 
  });

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
        ward: form.ward || undefined,
        village: form.village || undefined,
        principal: form.principal || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        geofenceRadius: parseInt(form.geofenceRadius) || 500,
        subjects: form.subjects ? form.subjects.split(",").map(s => s.trim()).filter(Boolean) : [],
        zoneId: form.zoneId || undefined,
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
        ward: form.ward || undefined,
        village: form.village || undefined,
        principal: form.principal || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        geofenceRadius: parseInt(form.geofenceRadius) || 500,
        subjects: form.subjects ? form.subjects.split(",").map(s => s.trim()).filter(Boolean) : [],
        zoneId: form.zoneId || undefined,
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
    const ok = await confirm(`Delete ${school.name}?`, `Are you sure you want to delete ${school.name}?`);
    if (!ok) return;
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
    const ok = await confirm("Bulk Delete", `Are you sure you want to delete ${selected.length} schools?`);
    if (!ok) return;
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
          if (h === "address") row.address = values[i];
          if (h === "latitude") row.latitude = values[i] ? parseFloat(values[i]) : undefined;
          if (h === "longitude") row.longitude = values[i] ? parseFloat(values[i]) : undefined;
          if (h === "subjects") row.subjects = values[i] ? values[i].split(";").map((s: string) => s.trim()) : [];
          
          // Match zone by name if provided in CSV
          if (h === "zone") {
             const matchedZone = zones.find(z => z.name.toLowerCase() === values[i]?.toLowerCase());
             if (matchedZone) row.zoneId = matchedZone.id;
          }
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
      ward: (school as any).ward || "",
      village: (school as any).village || "",
      principal: school.principal || "",
      phone: school.phone || "",
      email: school.email || "",
      address: school.address || "",
      latitude: school.latitude ? school.latitude.toString() : "",
      longitude: school.longitude ? school.longitude.toString() : "",
      geofenceRadius: school.geofenceRadius.toString(),
      subjects: school.subjects.join(", "),
      zoneId: school.zoneId || "",
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
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.name}</span>
          <div className="flex items-center gap-2 mt-1">
            {row.original.zoneName && (
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                {row.original.zoneName}
              </Badge>
            )}
            {row.original.latitude && row.original.longitude && (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                <MapPin className="h-3 w-3 mr-1" /> GPS Active
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    { accessorKey: "county", header: "County" },
    { accessorKey: "subCounty", header: "Sub-County" },
    {
      accessorKey: "studentsAssigned",
      header: "Students & Progress",
      cell: ({ row }) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">{row.original.studentsAssigned} Total</Badge>
          </div>
          {row.original.studentsAssigned > 0 && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{row.original.fullyAssessed} Done</Badge>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">{row.original.inProgress} Active</Badge>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/schools/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
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
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
      <div className="space-y-2">
        <Label>School Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nairobi High School" />
      </div>
      
      <div className="space-y-2">
        <Label>Supervision Zone</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={form.zoneId}
          onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
        >
          <option value="">-- No Zone Assigned --</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
      </div>

      <KenyaLocationPicker
        value={{ county: form.county, subCounty: form.subCounty, ward: form.ward, village: form.village }}
        onChange={(data) => setForm({ ...form, ...data })}
        required
      />

      <div className="space-y-2">
        <Label>Teaching Subjects Offered (comma separated)</Label>
        <Input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Mathematics, Physics, Chemistry" />
      </div>

      <div className="pt-2 border-t">
        <h4 className="text-sm font-semibold mb-2">GPS Location (For Geofencing)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-1.286389" />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="36.817223" />
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label>Geofence Radius (m)</Label>
            <Input type="number" value={form.geofenceRadius} onChange={(e) => setForm({ ...form, geofenceRadius: e.target.value })} placeholder="500" />
          </div>
        </div>

        <LocationPicker 
          lat={form.latitude} 
          lng={form.longitude} 
          onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })} 
        />
      </div>

      <div className="pt-2 border-t">
        <h4 className="text-sm font-semibold mb-2">Contact Details</h4>
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
        <div className="space-y-2">
          <Label>Physical Address</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 School Lane" />
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Placement Registry</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            School Management
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage all TP placement schools, zones, and GPS coordinates.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <SchoolMap schools={schools} />
      </div>

      {/* ── Quick Insights ── */}
      {globalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Global Average Score</p>
            <p className={`text-2xl font-bold ${globalMetrics.averageSchoolScore >= 70 ? 'text-emerald-600' : 'text-primary'}`}>{globalMetrics.averageSchoolScore}%</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">Top Performing Student</p>
            {globalMetrics.bestStudent ? (
              <>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 truncate">{globalMetrics.bestStudent.name}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500 truncate">{globalMetrics.bestStudent.score}% — {globalMetrics.bestStudent.school}</p>
              </>
            ) : <p className="text-sm text-muted-foreground">N/A</p>}
          </div>
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <p className="text-xs font-semibold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1">Needs Improvement</p>
            {globalMetrics.lowestStudent ? (
              <>
                <p className="text-lg font-bold text-red-700 dark:text-red-300 truncate">{globalMetrics.lowestStudent.name}</p>
                <p className="text-xs font-medium text-red-600 dark:text-red-500 truncate">{globalMetrics.lowestStudent.score}% — {globalMetrics.lowestStudent.school}</p>
              </>
            ) : <p className="text-sm text-muted-foreground">N/A</p>}
          </div>
        </div>
      )}

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
                    <p>Upload a CSV with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">name, county, subCounty, zone, subjects, latitude, longitude, principal, phone, email</code></p>
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Note: Subjects should be separated by semicolons (;) in the CSV.</p>
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
            <DialogDescription>Update school details, zone, and GPS coordinates.</DialogDescription>
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
