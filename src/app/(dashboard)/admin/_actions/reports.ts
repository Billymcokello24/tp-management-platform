"use server";

import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/geofence";

export async function getReportsData() {
  const [totalStudents, totalLecturers, assessments] = await Promise.all([
    prisma.student.count(),
    prisma.lecturer.count(),
    prisma.assessment.findMany({
      where: { status: "REVIEWED" },
      select: { totalMarks: true, performanceBand: true, student: { select: { course: true } } },
    }),
  ]);

  const grades = {
    "Distinction (70-100)": 0,
    "Credit (60-69)": 0,
    "Pass (50-59)": 0,
    "Fail (0-49)": 0,
  };

  const courseScores: Record<string, { total: number; count: number }> = {};

  assessments.forEach((a) => {
    // Grade distribution
    if (a.totalMarks >= 70) grades["Distinction (70-100)"]++;
    else if (a.totalMarks >= 60) grades["Credit (60-69)"]++;
    else if (a.totalMarks >= 50) grades["Pass (50-59)"]++;
    else grades["Fail (0-49)"]++;

    // Course averages
    const course = a.student.course || "Unknown";
    if (!courseScores[course]) courseScores[course] = { total: 0, count: 0 };
    courseScores[course].total += a.totalMarks;
    courseScores[course].count++;
  });

  const gradeDistribution = Object.entries(grades).map(([name, value]) => ({ name, value }));
  const averageByCourse = Object.entries(courseScores).map(([name, data]) => ({
    name: name.substring(0, 15) + (name.length > 15 ? "..." : ""),
    average: Math.round(data.total / data.count),
  }));

  const avgScore = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.totalMarks, 0) / assessments.length)
    : 0;

  return {
    totalStudents,
    totalLecturers,
    completedAssessments: assessments.length,
    avgScore,
    gradeDistribution,
    averageByCourse,
  };
}

export async function getLecturerAssessmentReports() {
  const lecturers = await prisma.lecturer.findMany({
    include: {
      user: { select: { name: true, email: true } },
      assessments: {
        where: { status: "REVIEWED" },
        include: {
          student: {
            include: { user: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return lecturers.map((lecturer) => {
    const assessments = lecturer.assessments;

    // Unique students assessed
    const studentSet = new Map<string, { id: string; name: string; admissionNumber: string }>();
    const subjectScores: Record<string, { total: number; count: number }> = {};

    assessments.forEach((a) => {
      if (!studentSet.has(a.studentId)) {
        studentSet.set(a.studentId, {
          id: a.studentId,
          name: a.student.user.name || "Unknown",
          admissionNumber: a.student.admissionNumber,
        });
      }

      const subject = a.subject || "Unspecified";
      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, count: 0 };
      }
      subjectScores[subject].total += a.totalMarks;
      subjectScores[subject].count++;
    });

    const subjectAverages = Object.entries(subjectScores).map(([subject, data]) => ({
      subject,
      averageScore: Math.round(data.total / data.count),
      assessmentCount: data.count,
    }));

    const totalAvg =
      assessments.length > 0
        ? Math.round(assessments.reduce((sum, a) => sum + a.totalMarks, 0) / assessments.length)
        : 0;

    return {
      lecturerId: lecturer.id,
      lecturerName: lecturer.user.name || "Unknown",
      lecturerEmail: lecturer.user.email,
      department: lecturer.department,
      totalAssessments: assessments.length,
      totalStudentsAssessed: studentSet.size,
      studentsAssessed: Array.from(studentSet.values()),
      subjectAverages,
      overallAverage: totalAvg,
    };
  });
}

// ── STUDENT COMPLETE TP REPORT ─────────────────────
export async function getStudentCompleteTPData(studentId?: string) {
  const where: any = {};
  if (studentId) where.id = studentId;

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      school: { select: { name: true, county: true, latitude: true, longitude: true, geofenceRadius: true } },
      assignment: {
        include: { lecturer: { include: { user: { select: { name: true, email: true } } } } },
      },
      assessments: {
        where: { status: "REVIEWED" },
        include: { lecturer: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { admissionNumber: "asc" },
  });

  return students.map((student) => {
    const s1 = student.subjects?.[0] || "Subject 1";
    const s2 = student.subjects?.[1] || "Subject 2";
    const assessments = student.assessments;

    const getSlot = (num: number, subj: string) =>
      assessments.find((a) => a.assessmentNumber === num && a.subject === subj) || null;

    const slots = {
      a1s1: getSlot(1, s1), a1s2: getSlot(1, s2),
      a2s1: getSlot(2, s1), a2s2: getSlot(2, s2),
      a3s1: getSlot(3, s1), a3s2: getSlot(3, s2),
    };

    const allScores = Object.values(slots).filter(Boolean).map((a: any) => a.totalMarks);
    const s1Scores = [slots.a1s1, slots.a2s1, slots.a3s1].filter(Boolean).map((a: any) => a.totalMarks);
    const s2Scores = [slots.a1s2, slots.a2s2, slots.a3s2].filter(Boolean).map((a: any) => a.totalMarks);

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const finalAvg = avg(allScores);
    let finalGrade = "N/A";
    if (finalAvg >= 70) finalGrade = "A (Distinction)";
    else if (finalAvg >= 60) finalGrade = "B (Credit)";
    else if (finalAvg >= 50) finalGrade = "C (Pass)";
    else if (finalAvg >= 40) finalGrade = "D (Pass)";
    else if (allScores.length > 0) finalGrade = "E (Fail)";

    const completedSlots = Object.values(slots).filter(Boolean).length;
    const completionPct = Math.round((completedSlots / 6) * 100);

    // GPS summary
    const gpsTracked = assessments.filter((a) => a.submissionLatitude != null);
    const gpsVerified = gpsTracked.filter((a) => a.isGeoVerified);

    return {
      studentId: student.id,
      studentName: student.user.name,
      admissionNumber: student.admissionNumber,
      course: student.course,
      school: student.school,
      lecturer: student.assignment?.lecturer
        ? { name: student.assignment.lecturer.user.name, email: student.assignment.lecturer.user.email, department: student.assignment.lecturer.department }
        : null,
      subjects: { s1, s2 },
      slots,
      summary: {
        s1Average: avg(s1Scores),
        s2Average: avg(s2Scores),
        assessmentAverage: finalAvg,
        finalGrade,
        completionPercentage: completionPct,
        completedSlots,
        totalSlots: 6,
      },
      gpsSummary: {
        totalTracked: gpsTracked.length,
        totalVerified: gpsVerified.length,
      },
      assessments: assessments.map((a) => ({
        id: a.id,
        assessmentNumber: a.assessmentNumber,
        subject: a.subject,
        totalMarks: a.totalMarks,
        grade: a.grade,
        performanceBand: a.performanceBand,
        lecturerName: a.lecturer.user.name,
        createdAt: a.createdAt.toISOString(),
        submissionLatitude: a.submissionLatitude,
        submissionLongitude: a.submissionLongitude,
        gpsAccuracy: a.gpsAccuracy,
        isGeoVerified: a.isGeoVerified,
        geoVerificationNote: a.geoVerificationNote,
        generalComments: a.generalComments,
        areasOfStrength: a.areasOfStrength,
        areasOfImprovement: a.areasOfImprovement,
      })),
    };
  });
}

export async function getLecturerLocationReports() {
  const assessments = await prisma.assessment.findMany({
    where: {
      status: "REVIEWED",
      submissionLatitude: { not: null },
      submissionLongitude: { not: null },
    },
    include: {
      lecturer: {
        include: { user: { select: { name: true, email: true } } },
      },
      student: {
        include: {
          user: { select: { name: true } },
          school: { select: { name: true, latitude: true, longitude: true, geofenceRadius: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by lecturer
  const lecturerMap = new Map<string, {
    lecturerId: string;
    lecturerName: string;
    lecturerEmail: string;
    department: string;
    assessments: {
      id: string;
      studentName: string;
      studentAdmission: string;
      subject: string;
      assessmentNumber: number;
      lecturerLat: number;
      lecturerLng: number;
      isGeoVerified: boolean;
      geoVerificationNote: string | null;
      schoolName: string | null;
      schoolLat: number | null;
      schoolLng: number | null;
      distanceFromSchool: number | null;
      withinGeofence: boolean | null;
    }[];
  }>();

  assessments.forEach((a) => {
    if (!lecturerMap.has(a.lecturerId)) {
      lecturerMap.set(a.lecturerId, {
        lecturerId: a.lecturerId,
        lecturerName: a.lecturer.user.name || "Unknown",
        lecturerEmail: a.lecturer.user.email,
        department: a.lecturer.department,
        assessments: [],
      });
    }

    const entry = lecturerMap.get(a.lecturerId)!;

    // Calculate distance from student school
    let distanceFromSchool: number | null = null;
    let withinGeofence: boolean | null = null;

    if (
      a.student.school?.latitude != null &&
      a.student.school?.longitude != null &&
      a.submissionLatitude != null &&
      a.submissionLongitude != null
    ) {
      distanceFromSchool = Math.round(
        haversineDistance(
          a.submissionLatitude,
          a.submissionLongitude,
          a.student.school.latitude,
          a.student.school.longitude
        )
      );
      const radius = a.student.school.geofenceRadius || 500;
      withinGeofence = distanceFromSchool <= radius;
    }

    entry.assessments.push({
      id: a.id,
      studentName: a.student.user.name || "Unknown",
      studentAdmission: a.student.admissionNumber,
      subject: a.subject || "Unspecified",
      assessmentNumber: a.assessmentNumber,
      lecturerLat: a.submissionLatitude!,
      lecturerLng: a.submissionLongitude!,
      isGeoVerified: a.isGeoVerified,
      geoVerificationNote: a.geoVerificationNote,
      schoolName: a.student.school?.name || null,
      schoolLat: a.student.school?.latitude || null,
      schoolLng: a.student.school?.longitude || null,
      distanceFromSchool,
      withinGeofence,
    });
  });

  // Build summary
  return Array.from(lecturerMap.values()).map((l) => {
    const totalWithSchool = l.assessments.filter((a) => a.schoolLat != null).length;
    const withinFence = l.assessments.filter((a) => a.withinGeofence === true).length;
    const outsideFence = l.assessments.filter((a) => a.withinGeofence === false).length;

    return {
      ...l,
      summary: {
        totalLocationTracked: l.assessments.length,
        totalWithSchoolGps: totalWithSchool,
        withinGeofence: withinFence,
        outsideGeofence: outsideFence,
        averageDistanceMeters:
          l.assessments
            .filter((a) => a.distanceFromSchool != null)
            .reduce((sum, a, _, arr) => sum + (a.distanceFromSchool || 0) / arr.length, 0),
      },
    };
  });
}

// ── LECTURER PERFORMANCE REPORT ─────────────────────
export async function getLecturerPerformanceData(lecturerId?: string) {
  const where: any = { status: "REVIEWED" };
  if (lecturerId) where.lecturerId = lecturerId;

  const assessments = await prisma.assessment.findMany({
    where,
    include: {
      lecturer: { include: { user: { select: { name: true, email: true } }, zoneRef: { select: { name: true } } } },
      student: { include: { user: { select: { name: true } }, school: { select: { name: true, county: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by lecturer
  const map = new Map<string, any>();
  for (const a of assessments) {
    if (!map.has(a.lecturerId)) {
      map.set(a.lecturerId, {
        lecturerId: a.lecturerId,
        lecturerName: a.lecturer.user.name,
        lecturerEmail: a.lecturer.user.email,
        zone: a.lecturer.zoneRef?.name || a.lecturer.zone || "Unzoned",
        department: a.lecturer.department,
        studentsAssessed: new Map(),
        subjectScores: {} as Record<string, number[]>,
        totalAssessments: 0,
      });
    }
    const entry = map.get(a.lecturerId)!;
    entry.totalAssessments++;
    if (!entry.studentsAssessed.has(a.studentId)) {
      entry.studentsAssessed.set(a.studentId, {
        studentId: a.studentId,
        studentName: a.student.user.name,
        school: a.student.school?.name || "N/A",
        schoolCounty: a.student.school?.county || "N/A",
        assessments: [],
      });
    }
    entry.studentsAssessed.get(a.studentId)!.assessments.push({
      id: a.id,
      assessmentNumber: a.assessmentNumber,
      subject: a.subject || "Unspecified",
      totalMarks: a.totalMarks,
      grade: a.grade || "N/A",
      createdAt: a.createdAt.toISOString(),
    });

    const subj = a.subject || "Unspecified";
    if (!entry.subjectScores[subj]) entry.subjectScores[subj] = [];
    entry.subjectScores[subj].push(a.totalMarks);
  }

  return Array.from(map.values()).map((l) => {
    const studentsAssessed = Array.from(l.studentsAssessed.values());
    const subjectAnalysis = Object.entries(l.subjectScores as Record<string, number[]>).map(([subject, scores]) => ({
      subject,
      count: scores.length,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passRate: Math.round((scores.filter((s) => s >= 50).length / scores.length) * 100),
    }));

    const allScores = Object.values(l.subjectScores).flat() as number[];
    const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    return {
      lecturerId: l.lecturerId,
      lecturerName: l.lecturerName,
      lecturerEmail: l.lecturerEmail,
      zone: l.zone,
      department: l.department,
      totalAssessments: l.totalAssessments,
      totalStudentsAssessed: studentsAssessed.length,
      overallAverage: overallAvg,
      completionRate: studentsAssessed.length > 0 ? Math.round((l.totalAssessments / (studentsAssessed.length * 6)) * 100) : 0,
      subjectAnalysis,
      studentsAssessed,
    };
  });
}

// ── GPS AUDIT REPORT ────────────────────────────────
export async function getGPSAuditData() {
  const assessments = await prisma.assessment.findMany({
    where: {
      status: "REVIEWED",
      submissionLatitude: { not: null },
    },
    include: {
      lecturer: { include: { user: { select: { name: true, email: true } } } },
      student: {
        include: {
          user: { select: { name: true } },
          school: { select: { name: true, latitude: true, longitude: true, geofenceRadius: true, county: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assessments.map((a) => {
    let distance: number | null = null;
    let withinGeofence: boolean | null = null;
    if (a.submissionLatitude && a.submissionLongitude && a.student.school?.latitude && a.student.school?.longitude) {
      distance = Math.round(haversineDistance(a.submissionLatitude, a.submissionLongitude, a.student.school.latitude, a.student.school.longitude));
      withinGeofence = distance <= (a.student.school.geofenceRadius || 500);
    }

    return {
      id: a.id,
      assessmentDate: a.createdAt.toISOString(),
      lecturerName: a.lecturer.user.name,
      lecturerEmail: a.lecturer.user.email,
      studentName: a.student.user.name,
      studentAdmission: a.student.admissionNumber,
      subject: a.subject || "Unspecified",
      assessmentNumber: a.assessmentNumber,
      schoolName: a.student.school?.name || "N/A",
      schoolLat: a.student.school?.latitude || null,
      schoolLng: a.student.school?.longitude || null,
      lecturerLat: a.submissionLatitude,
      lecturerLng: a.submissionLongitude,
      gpsAccuracy: a.gpsAccuracy,
      distance,
      withinGeofence,
      isGeoVerified: a.isGeoVerified,
      geoVerificationNote: a.geoVerificationNote,
    };
  });
}

// ── SCHOOL PERFORMANCE REPORT ────────────────────────
export async function getSchoolPerformanceData() {
  const schools = await prisma.school.findMany({
    include: {
      students: {
        include: {
          user: { select: { name: true } },
          assessments: { where: { status: "REVIEWED" }, select: { totalMarks: true, subject: true } },
          assignment: { include: { lecturer: { include: { user: { select: { name: true } } } } } },
        },
      },
      zone: { select: { name: true } },
    },
  });

  return schools.map((s) => {
    const assessed = s.students.filter((st) => st.assessments.length > 0);
    const allScores = assessed.flatMap((st) => st.assessments.map((a) => a.totalMarks));
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    
    // Subject performance
    const subjectMap: Record<string, number[]> = {};
    assessed.forEach((st) => st.assessments.forEach((a) => {
      const subj = a.subject || "Unspecified";
      if (!subjectMap[subj]) subjectMap[subj] = [];
      subjectMap[subj].push(a.totalMarks);
    }));
    const subjectPerf = Object.entries(subjectMap).map(([subject, scores]) => ({
      subject,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }));
    const bestSubject = subjectPerf.sort((a, b) => b.average - a.average)[0];
    const worstSubject = subjectPerf.sort((a, b) => a.average - b.average)[0];

    // Unique lecturers
    const lecturers = new Set<string>();
    assessed.forEach((st) => { if (st.assignment?.lecturer) lecturers.add(st.assignment.lecturer.user.name); });

    return {
      schoolId: s.id,
      schoolName: s.name,
      zone: s.zone?.name || "Unzoned",
      county: s.county,
      totalStudents: s.students.length,
      studentsAssessed: assessed.length,
      completionRate: s.students.length > 0 ? Math.round((assessed.length / s.students.length) * 100) : 0,
      averageScore: avgScore,
      topSubject: bestSubject?.subject || "N/A",
      lowestSubject: worstSubject?.subject || "N/A",
      subjectPerformance: subjectPerf,
      assignedLecturers: Array.from(lecturers),
    };
  });
}

// ── ZONE PERFORMANCE REPORT ─────────────────────────
export async function getZonePerformanceData() {
  const zones = await prisma.zone.findMany({
    include: {
      schools: {
        include: {
          students: {
            include: {
              assessments: { where: { status: "REVIEWED" }, select: { totalMarks: true, isGeoVerified: true, submissionLatitude: true } },
            },
          },
        },
      },
      lecturers: { select: { id: true } },
    },
  });

  return zones.map((z) => {
    const allStudents = z.schools.flatMap((s) => s.students);
    const assessed = allStudents.filter((st) => st.assessments.length > 0);
    const allScores = assessed.flatMap((st) => st.assessments.map((a) => a.totalMarks));
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    
    const totalAssessments = assessed.reduce((sum, st) => sum + st.assessments.length, 0);
    const gpsTracked = assessed.flatMap((st) => st.assessments.filter((a) => a.submissionLatitude != null));
    const gpsVerified = gpsTracked.filter((a) => a.isGeoVerified);

    return {
      zoneId: z.id,
      zoneName: z.name,
      county: z.county,
      totalSchools: z.schools.length,
      totalLecturers: z.lecturers.length,
      totalStudents: allStudents.length,
      studentsAssessed: assessed.length,
      completionRate: allStudents.length > 0 ? Math.round((assessed.length / allStudents.length) * 100) : 0,
      averageScore: avgScore,
      locationComplianceRate: gpsTracked.length > 0 ? Math.round((gpsVerified.length / gpsTracked.length) * 100) : 0,
      totalAssessments,
    };
  });
}
