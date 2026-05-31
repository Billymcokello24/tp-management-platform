"use server";

import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { revalidatePath } from "next/cache";

// ── Students ──────────────────────────────────────

export async function getStudents() {
  return prisma.student.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      school: { select: { id: true, name: true, county: true } },
      assignment: {
        include: {
          lecturer: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStudent(data: {
  name: string;
  admissionNumber: string;
  email?: string;
  phone?: string;
  course: string;
  subjects: string[];
  schoolId?: string;
  password?: string;
}) {
  const email = data.email || `${data.admissionNumber.replace(/\//g, "-").toLowerCase()}@student.tmu.ac.ke`;
  const passwordHash = await bcryptjs.hash(data.password || "password123", 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: email.toLowerCase().trim(),
      phone: data.phone || null,
      password: passwordHash,
      role: "STUDENT",
      student: {
        create: {
          admissionNumber: data.admissionNumber,
          course: data.course,
          subjects: data.subjects,
          schoolId: data.schoolId || null,
        },
      },
    },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
}

export async function updateStudent(
  studentId: string,
  data: {
    name: string;
    admissionNumber: string;
    phone?: string;
    course: string;
    subjects: string[];
    schoolId?: string;
    password?: string;
  }
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });

  if (!student) throw new Error("Student not found");

  const updateData: any = { name: data.name, phone: data.phone || null };
  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcryptjs.hash(data.password, 10);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.userId },
      data: updateData,
    }),
    prisma.student.update({
      where: { id: studentId },
      data: {
        admissionNumber: data.admissionNumber,
        course: data.course,
        subjects: data.subjects,
        schoolId: data.schoolId || null,
      },
    }),
  ]);

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
}

export async function deleteStudent(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });

  if (!student) throw new Error("Student not found");

  // Deleting the User cascades to Student
  await prisma.user.delete({ where: { id: student.userId } });

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
}

export async function bulkDeleteStudents(studentIds: string[]) {
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    select: { userId: true },
  });

  const userIds = students.map((s) => s.userId);
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
}

export async function bulkCreateStudents(
  rows: { name: string; admissionNumber: string; course: string; subjects: string; phone?: string; password?: string; school?: string }[]
) {
  const defaultPasswordHash = await bcryptjs.hash("password123", 10);
  let created = 0;
  let skipped = 0;
  
  const allSchools = await prisma.school.findMany({ select: { id: true, name: true } });
  const schoolMap = new Map(allSchools.map((s) => [s.name.toLowerCase(), s.id]));

  for (const row of rows) {
    const email = `${row.admissionNumber.replace(/\//g, "-").toLowerCase()}@student.tmu.ac.ke`;

    const existing = await prisma.student.findUnique({
      where: { admissionNumber: row.admissionNumber },
    });

    if (existing) {
      skipped++;
      continue;
    }

    try {
      let schoolId = null;
      if (row.school) {
        schoolId = schoolMap.get(row.school.toLowerCase()) || null;
      }

      const currentPasswordHash = row.password ? await bcryptjs.hash(row.password, 10) : defaultPasswordHash;
      await prisma.user.create({
        data: {
          name: row.name,
          email: email.toLowerCase().trim(),
          phone: row.phone || null,
          password: currentPasswordHash,
          role: "STUDENT",
          student: {
            create: {
              admissionNumber: row.admissionNumber,
              course: row.course,
              subjects: row.subjects.split(",").map((s) => s.trim()),
              schoolId,
            },
          },
        },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  return { created, skipped };
}

// ── Lecturers ──────────────────────────────────────

export async function getLecturers() {
  return prisma.lecturer.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      zoneRef: true,
      assignments: {
        include: { students: true },
      },
      assessments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLecturer(data: {
  name: string;
  email: string;
  phone?: string;
  department: string;
  zone?: string;
  county?: string;
  subCounty?: string;
  ward?: string;
  village?: string;
  zoneId?: string;
  password?: string;
}) {
  const passwordHash = await bcryptjs.hash(data.password || "password123", 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      password: passwordHash,
      role: "LECTURER",
      lecturer: {
        create: {
          department: data.department,
          zone: data.zone || null,
          county: data.county || null,
          subCounty: data.subCounty || null,
          ward: data.ward || null,
          village: data.village || null,
          zoneId: data.zoneId || null,
        },
      },
    },
  });

  revalidatePath("/admin/lecturers");
  revalidatePath("/admin/dashboard");
}

export async function updateLecturer(
  lecturerId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    department: string;
    zone?: string;
    county?: string;
    subCounty?: string;
    ward?: string;
    village?: string;
    zoneId?: string;
    password?: string;
  }
) {
  const lecturer = await prisma.lecturer.findUnique({
    where: { id: lecturerId },
    select: { userId: true },
  });

  if (!lecturer) throw new Error("Lecturer not found");

  const updateData: any = { name: data.name, email: data.email.toLowerCase().trim(), phone: data.phone || null };
  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcryptjs.hash(data.password, 10);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: lecturer.userId },
      data: updateData,
    }),
    prisma.lecturer.update({
      where: { id: lecturerId },
      data: {
        department: data.department,
        zone: data.zone || null,
        county: data.county || null,
        subCounty: data.subCounty || null,
        ward: data.ward || null,
        village: data.village || null,
        zoneId: data.zoneId || null,
      },
    }),
  ]);

  revalidatePath("/admin/lecturers");
  revalidatePath("/admin/dashboard");
}

export async function deleteLecturer(lecturerId: string) {
  const lecturer = await prisma.lecturer.findUnique({
    where: { id: lecturerId },
    select: { userId: true },
  });

  if (!lecturer) throw new Error("Lecturer not found");

  await prisma.user.delete({ where: { id: lecturer.userId } });

  revalidatePath("/admin/lecturers");
  revalidatePath("/admin/dashboard");
}

export async function bulkDeleteLecturers(lecturerIds: string[]) {
  const lecturers = await prisma.lecturer.findMany({
    where: { id: { in: lecturerIds } },
    select: { userId: true },
  });

  const userIds = lecturers.map((s) => s.userId);
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  revalidatePath("/admin/lecturers");
  revalidatePath("/admin/dashboard");
}

export async function bulkCreateLecturers(
  rows: { name: string; email: string; department: string; zone?: string; county?: string; zoneId?: string; phone?: string; password?: string }[]
) {
  const defaultPasswordHash = await bcryptjs.hash("password123", 10);
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await prisma.user.findUnique({
      where: { email: row.email },
    });

    if (existing) {
      skipped++;
      continue;
    }

    try {
      const currentPasswordHash = row.password ? await bcryptjs.hash(row.password, 10) : defaultPasswordHash;
      await prisma.user.create({
        data: {
          name: row.name,
          email: row.email.toLowerCase().trim(),
          phone: row.phone || null,
          password: currentPasswordHash,
          role: "LECTURER",
          lecturer: {
            create: {
              department: row.department,
              zone: row.zone || null,
              county: row.county || null,
              zoneId: row.zoneId || null,
            },
          },
        },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/lecturers");
  revalidatePath("/admin/dashboard");
  return { created, skipped };
}

// ── Schools ──────────────────────────────────────

export async function getSchools() {
  return prisma.school.findMany({
    include: {
      students: {
        include: {
          user: { select: { name: true } },
          assessments: {
            where: { status: "REVIEWED" },
            select: { id: true, totalMarks: true }
          }
        }
      },
      zone: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function createSchool(data: {
  name: string;
  county: string;
  subCounty: string;
  ward?: string;
  village?: string;
  principal?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  subjects?: string[];
  zoneId?: string;
}) {
  await prisma.school.create({ data });

  revalidatePath("/admin/schools");
  revalidatePath("/admin/dashboard");
}

export async function updateSchool(
  schoolId: string,
  data: {
    name: string;
    county: string;
    subCounty: string;
    ward?: string;
    village?: string;
    principal?: string;
    phone?: string;
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    geofenceRadius?: number;
    subjects?: string[];
    zoneId?: string;
  }
) {
  await prisma.school.update({
    where: { id: schoolId },
    data,
  });

  revalidatePath("/admin/schools");
  revalidatePath("/admin/dashboard");
}

export async function deleteSchool(schoolId: string) {
  await prisma.school.delete({ where: { id: schoolId } });

  revalidatePath("/admin/schools");
  revalidatePath("/admin/dashboard");
}

export async function bulkDeleteSchools(schoolIds: string[]) {
  await prisma.school.deleteMany({ where: { id: { in: schoolIds } } });
  revalidatePath("/admin/schools");
  revalidatePath("/admin/dashboard");
}

export async function bulkCreateSchools(
  rows: { 
    name: string; 
    county: string; 
    subCounty: string; 
    principal?: string; 
    phone?: string; 
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    geofenceRadius?: number;
    subjects?: string[];
    zoneId?: string;
  }[]
) {
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await prisma.school.findFirst({
      where: { name: { equals: row.name, mode: "insensitive" } },
    });

    if (existing) {
      skipped++;
      continue;
    }

    try {
      await prisma.school.create({
        data: {
          name: row.name,
          county: row.county,
          subCounty: row.subCounty,
          principal: row.principal || null,
          phone: row.phone || null,
          email: row.email || null,
          address: row.address || null,
          latitude: row.latitude || null,
          longitude: row.longitude || null,
          geofenceRadius: row.geofenceRadius || 500,
          subjects: row.subjects || [],
          zoneId: row.zoneId || null,
        },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/schools");
  revalidatePath("/admin/dashboard");
  return { created, skipped };
}

// ── Zones ────────────────────────────────────────

export async function getZones() {
  return prisma.zone.findMany({
    include: {
      _count: {
        select: { schools: true, lecturers: true }
      }
    },
    orderBy: { name: "asc" },
  });
}

export async function createZone(data: {
  name: string;
  county: string;
  subCounty?: string;
  ward?: string;
  village?: string;
  description?: string;
  isActive?: boolean;
}) {
  await prisma.zone.create({ data });

  revalidatePath("/admin/zones");
  revalidatePath("/admin/dashboard");
}

export async function updateZone(
  zoneId: string,
  data: {
    name: string;
    county: string;
    subCounty?: string;
    ward?: string;
    village?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  await prisma.zone.update({
    where: { id: zoneId },
    data,
  });

  revalidatePath("/admin/zones");
  revalidatePath("/admin/dashboard");
}

export async function deleteZone(zoneId: string) {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: {
      _count: {
        select: { schools: true, lecturers: true }
      }
    }
  });

  if (!zone) throw new Error("Zone not found");

  if (zone._count.schools > 0 || zone._count.lecturers > 0) {
    throw new Error("Cannot delete a zone with assigned schools or lecturers.");
  }

  await prisma.zone.delete({ where: { id: zoneId } });

  revalidatePath("/admin/zones");
  revalidatePath("/admin/dashboard");
}

export async function bulkDeleteZones(zoneIds: string[]) {
  const zones = await prisma.zone.findMany({
    where: { id: { in: zoneIds } },
    include: {
      _count: {
        select: { schools: true, lecturers: true }
      }
    }
  });

  const safeToDelete = zones
    .filter(z => z._count.schools === 0 && z._count.lecturers === 0)
    .map(z => z.id);

  if (safeToDelete.length === 0) {
    throw new Error("None of the selected zones can be deleted because they have assigned schools or lecturers.");
  }

  await prisma.zone.deleteMany({ where: { id: { in: safeToDelete } } });
  
  revalidatePath("/admin/zones");
  revalidatePath("/admin/dashboard");
  
  return { deleted: safeToDelete.length, skipped: zoneIds.length - safeToDelete.length };
}

export async function bulkCreateZones(
  rows: { name: string; county: string; description?: string }[]
) {
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await prisma.zone.findFirst({
      where: { name: { equals: row.name, mode: "insensitive" } },
    });

    if (existing) {
      skipped++;
      continue;
    }

    try {
      await prisma.zone.create({
        data: {
          name: row.name,
          county: row.county,
          description: row.description || null,
        },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/zones");
  revalidatePath("/admin/dashboard");
  return { created, skipped };
}
