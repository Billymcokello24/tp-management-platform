import { getStudentSchoolData } from "../_actions/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Building, Clock } from "lucide-react";
import { SchoolSelectorClient as StationSelectorClient } from "./station-selector-client";
import { prisma } from "@/lib/prisma";

export default async function StudentSchoolPage() {
  const school = await getStudentSchoolData();
  const availableSchools = await prisma.school.findMany({
    select: { id: true, name: true, county: true },
    orderBy: { name: "asc" }
  });

  const PageHeader = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Placement</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          My Station Placement
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Information about your teaching practice institution.
        </p>
      </div>
    </div>
  );

  if (!school) {
    return (
      <div className="space-y-6 w-[90%] mx-auto pb-20" style={{ width: '90%' }}>
        <PageHeader />
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 mb-6">
          <CardContent className="pt-6">
            <p className="text-amber-800 dark:text-amber-300 text-center font-medium">You have not been placed in a station yet. Please select your station below.</p>
          </CardContent>
        </Card>
        <StationSelectorClient currentSchool={school} availableSchools={availableSchools} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-[90%] mx-auto pb-20" style={{ width: '90%' }}>
      <PageHeader />

      <StationSelectorClient currentSchool={school} availableSchools={availableSchools} />

      {school && (
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> {school.name}
              </CardTitle>
              <CardDescription>Official placement details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Location</p>
                  <p>{school.county} County</p>
                  <p className="text-sm text-muted-foreground">{school.subCounty} Sub-county</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-primary text-sm">P</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Principal</p>
                  <p>{school.principal || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Phone</p>
                  <p>{school.phone || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Email</p>
                  <p>{school.email || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Teaching Allocation
              </CardTitle>
              <CardDescription>Your assigned subjects and classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 text-center">
                <p className="text-muted-foreground mb-4">Your timetable has not been uploaded yet.</p>
                <p className="text-sm">Please arrange your teaching subjects with your cooperating teacher once you report to the station.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
