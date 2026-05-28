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
      email,
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
  }
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });

  if (!student) throw new Error("Student not found");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.userId },
      data: { name: data.name, phone: data.phone || null },
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
          email,
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
  password?: string;
}) {
  const passwordHash = await bcryptjs.hash(data.password || "password123", 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      password: passwordHash,
      role: "LECTURER",
      lecturer: {
        create: {
          department: data.department,
          zone: data.zone || null,
          county: data.county || null,
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
  }
) {
  const lecturer = await prisma.lecturer.findUnique({
    where: { id: lecturerId },
    select: { userId: true },
  });

  if (!lecturer) throw new Error("Lecturer not found");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: lecturer.userId },
      data: { name: data.name, email: data.email, phone: data.phone || null },
    }),
    prisma.lecturer.update({
      where: { id: lecturerId },
      data: {
        department: data.department,
        zone: data.zone || null,
        county: data.county || null,
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
  rows: { name: string; email: string; department: string; zone?: string; county?: string; phone?: string; password?: string }[]
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
          email: row.email,
          phone: row.phone || null,
          password: currentPasswordHash,
          role: "LECTURER",
          lecturer: {
            create: {
              department: row.department,
              zone: row.zone || null,
              county: row.county || null,
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
      students: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function createSchool(data: {
  name: string;
  county: string;
  subCounty: string;
  principal?: string;
  phone?: string;
  email?: string;
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
    principal?: string;
    phone?: string;
    email?: string;
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
  rows: { name: string; county: string; subCounty: string; principal?: string; phone?: string; email?: string }[]
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
