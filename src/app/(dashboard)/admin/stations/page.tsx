import { getSchools, getZones } from "../_actions/crud";
import { SchoolsClient as StationsClient } from "./stations-client";

export default async function SchoolsPage() {
  const schools = await getSchools();
  const zones = await getZones();

  let globalBestStudent: any = null;
  let globalLowestStudent: any = null;
  let totalScoreSum = 0;
  let totalAssessmentsCount = 0;

  const serialized = schools.map((s) => {
    let fullyAssessed = 0;
    let inProgress = 0;
    
    // Process student assessments
    s.students.forEach((student: any) => {
      const completedCount = student.assessments?.length || 0;
      if (completedCount >= 3) fullyAssessed++;
      else if (completedCount > 0) inProgress++;

      if (completedCount > 0) {
        const studentAvg = student.assessments.reduce((sum: number, a: any) => sum + a.totalMarks, 0) / completedCount;
        totalScoreSum += student.assessments.reduce((sum: number, a: any) => sum + a.totalMarks, 0);
        totalAssessmentsCount += completedCount;

        if (!globalBestStudent || studentAvg > globalBestStudent.score) {
          globalBestStudent = { name: student.user.name, score: Math.round(studentAvg), school: s.name };
        }
        if (!globalLowestStudent || studentAvg < globalLowestStudent.score) {
          globalLowestStudent = { name: student.user.name, score: Math.round(studentAvg), school: s.name };
        }
      }
    });

    return {
      id: s.id,
      name: s.name,
      county: s.county,
      subCounty: s.subCounty,
      principal: s.principal,
      phone: s.phone,
      email: s.email,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      geofenceRadius: s.geofenceRadius,
      subjects: s.subjects,
      zoneId: s.zoneId,
      zoneName: s.zone?.name || null,
      studentsAssigned: s.students.length,
      fullyAssessed,
      inProgress,
    };
  });

  const serializedZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
  }));

  const globalMetrics = {
    bestStudent: globalBestStudent,
    lowestStudent: globalLowestStudent,
    averageSchoolScore: totalAssessmentsCount > 0 ? Math.round(totalScoreSum / totalAssessmentsCount) : 0,
  };

  return <StationsClient schools={serialized} zones={serializedZones} globalMetrics={globalMetrics} />;
}
