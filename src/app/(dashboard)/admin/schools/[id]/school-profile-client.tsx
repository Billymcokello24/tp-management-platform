"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, Mail, Phone, User, GraduationCap, Map } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface StudentInfo {
  id: string;
  name: string | null;
  email: string | null;
  admissionNumber: string;
  completedAssessments: number;
  lecturers: { name: string | null; email: string | null }[];
}

interface SchoolProfile {
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
  zoneName: string | null;
  studentsAssigned: number;
  fullyAssessed: number;
  inProgress: number;
}

export function SchoolProfileClient({ 
  school, 
  students 
}: { 
  school: SchoolProfile; 
  students: StudentInfo[]; 
}) {

  const studentColumns: ColumnDef<StudentInfo>[] = [
    {
      accessorKey: "name",
      header: "Student Name",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{row.original.admissionNumber}</p>
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-sm">{row.original.email || "—"}</span>
    },
    {
      id: "lecturers",
      header: "Assigned Supervisor(s)",
      cell: ({ row }) => {
        if (row.original.lecturers.length === 0) {
          return <Badge variant="secondary" className="text-[10px]">Unassigned</Badge>;
        }
        return (
          <div className="flex flex-col gap-1">
            {row.original.lecturers.map((lec, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{lec.name}</span>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "completedAssessments",
      header: "Progress",
      cell: ({ row }) => {
        const completed = row.original.completedAssessments;
        return (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i <= completed ? "bg-emerald-500" : "bg-muted-foreground/20"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{completed}/3</span>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/admin/assessments/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
            View Report
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/admin/schools">
          <Button variant="ghost" className="gap-2 -ml-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {school.zoneName ? `Zone: ${school.zoneName}` : "Unzoned"}
              </Badge>
              <Badge variant="secondary">{school.county} County</Badge>
            </div>
            
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {school.name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-2">
                <Map className="h-4 w-4" />
                {school.subCounty} Sub-County
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-muted/50 p-4 rounded-xl text-center min-w-[120px]">
              <div className="text-3xl font-black text-foreground">{school.studentsAssigned}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Total Students</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl text-center min-w-[120px] border border-emerald-100">
              <div className="text-3xl font-black text-emerald-700">{school.fullyAssessed}</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">Fully Assessed</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Principal
            </span>
            <p className="text-sm font-medium">{school.principal || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Contact Phone
            </span>
            <p className="text-sm font-medium">{school.phone || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
            <p className="text-sm font-medium">{school.email || "Not provided"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Geofencing
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {school.latitude && school.longitude ? (
                <>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">GPS Active</Badge>
                  <span className="text-xs font-medium">{school.geofenceRadius}m</span>
                </>
              ) : (
                <Badge variant="secondary" className="text-[10px]">No Coordinates</Badge>
              )}
            </div>
          </div>
        </div>

        {school.subjects && school.subjects.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
              Teaching Subjects
            </span>
            <div className="flex flex-wrap gap-2">
              {school.subjects.map((sub, idx) => (
                <Badge key={idx} variant="secondary">{sub}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Roster Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Assigned Students & Supervisors</h2>
        </div>
        
        <div className="bg-card border rounded-xl overflow-hidden">
          <DataTable
            columns={studentColumns}
            data={students}
            searchKey="name"
            searchPlaceholder="Search students..."
          />
        </div>
      </div>
    </div>
  );
}
