"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getAssignments() {
  return prisma.student.findMany({
    where: { assignmentId: { not: null } },
    include: {
      user: { select: { name: true } },
      school: { select: { name: true, county: true, zone: { select: { name: true } } } },
      assignment: {
        include: {
          lecturer: {
            include: { user: { select: { name: true } }, zoneRef: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

import { haversineDistance } from "@/lib/geofence";

export async function generateRandomAssignments() {
  // 1. Fetch all active lecturers and their assignments (including schools to determine spatial location)
  const lecturers = await prisma.lecturer.findMany({
    include: { 
      assignments: { 
        include: { 
          students: { 
            include: { school: { select: { latitude: true, longitude: true } } } 
          } 
        } 
      } 
    },
  });

  if (lecturers.length === 0) {
    throw new Error("Cannot assign: No lecturers found in the system.");
  }

  // Ensure every lecturer has exactly ONE active assignment record
  const lecturerAssignmentMap = new Map<string, { 
    assignmentId: string; 
    currentLoad: number; 
    zoneId: string | null;
    centerLat: number | null;
    centerLng: number | null;
  }>();
  
  for (const lecturer of lecturers) {
    let assignment = lecturer.assignments.find((a) => !a.isLocked);
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: { lecturerId: lecturer.id },
        include: { students: { include: { school: { select: { latitude: true, longitude: true } } } } }
      }) as any;
    }
    
    // Calculate current load and spatial center
    const students = assignment!.students || [];
    const currentLoad = students.length;
    
    let centerLat = null;
    let centerLng = null;
    const schoolsWithGps = students.filter(s => s.school?.latitude && s.school?.longitude);
    if (schoolsWithGps.length > 0) {
      centerLat = schoolsWithGps.reduce((sum, s) => sum + s.school!.latitude!, 0) / schoolsWithGps.length;
      centerLng = schoolsWithGps.reduce((sum, s) => sum + s.school!.longitude!, 0) / schoolsWithGps.length;
    }

    lecturerAssignmentMap.set(lecturer.id, { 
      assignmentId: assignment!.id, 
      currentLoad,
      zoneId: lecturer.zoneId,
      centerLat,
      centerLng
    });
  }

  // 2. Fetch all unassigned students with their school's GPS data
  const unassignedStudents = await prisma.student.findMany({
    where: { assignmentId: null },
    include: { school: { select: { zoneId: true, latitude: true, longitude: true } } },
  });

  if (unassignedStudents.length === 0) {
    return { success: true, count: 0, message: "All students are already assigned." };
  }

  // 3. Group students by zone
  const studentsByZone = new Map<string, any[]>();
  const unzonedStudents: any[] = [];

  for (const student of unassignedStudents) {
    const zoneId = student.school?.zoneId;
    if (zoneId) {
      if (!studentsByZone.has(zoneId)) studentsByZone.set(zoneId, []);
      studentsByZone.get(zoneId)!.push(student);
    } else {
      unzonedStudents.push(student);
    }
  }

  const updates = [];
  let totalAssigned = 0;

  // 4. Distribute students zone by zone
  for (const [zoneId, students] of studentsByZone.entries()) {
    // Find lecturers assigned to this zone
    const zoneLecturers = Array.from(lecturerAssignmentMap.entries())
      .filter(([_, data]) => data.zoneId === zoneId)
      .map(([id, data]) => ({ id, ...data }));

    const shuffledStudents = shuffleArray(students);

    if (zoneLecturers.length > 0) {
      // Round-robin among zone lecturers
      for (let i = 0; i < shuffledStudents.length; i++) {
        const student = shuffledStudents[i];
        const lecturer = zoneLecturers[i % zoneLecturers.length];
        
        updates.push(
          prisma.student.update({
            where: { id: student.id },
            data: { assignmentId: lecturer.assignmentId },
          })
        );
        lecturer.currentLoad++;
        lecturerAssignmentMap.get(lecturer.id)!.currentLoad++;
        totalAssigned++;
        
        // Update spatial center dynamically
        if (student.school?.latitude && student.school?.longitude) {
          const lData = lecturerAssignmentMap.get(lecturer.id)!;
          if (lData.centerLat === null || lData.centerLng === null) {
            lData.centerLat = student.school.latitude;
            lData.centerLng = student.school.longitude;
          } else {
            lData.centerLat = (lData.centerLat! * (lData.currentLoad - 1) + student.school.latitude) / lData.currentLoad;
            lData.centerLng = (lData.centerLng! * (lData.currentLoad - 1) + student.school.longitude) / lData.currentLoad;
          }
        }
      }
    } else {
      // If no lecturers in this zone, push students to unzoned pool as fallback
      unzonedStudents.push(...shuffledStudents);
    }
  }

  // 5. Fallback for unzoned students using Spatial (Geofence/Haversine) logic
  if (unzonedStudents.length > 0) {
    const shuffledUnzoned = shuffleArray(unzonedStudents);
    
    // Convert map to array so we can sort by load or distance
    const allLecturers = Array.from(lecturerAssignmentMap.entries())
      .map(([id, data]) => ({ id, ...data }));

    for (const student of shuffledUnzoned) {
      let selectedLecturer = null;

      // If student has GPS, try to find the closest lecturer
      if (student.school?.latitude && student.school?.longitude) {
        let minDistance = Infinity;
        let closestLecturer = null;

        for (const lecturer of allLecturers) {
          if (lecturer.centerLat !== null && lecturer.centerLng !== null) {
            const distance = haversineDistance(
              student.school.latitude,
              student.school.longitude,
              lecturer.centerLat,
              lecturer.centerLng
            );
            // Weight the distance heavily, but slightly penalize heavily loaded lecturers
            // Distances are in meters. Penalize 1km per current student load.
            const weightedDistance = distance + (lecturer.currentLoad * 1000); 
            
            if (weightedDistance < minDistance) {
              minDistance = weightedDistance;
              closestLecturer = lecturer;
            }
          }
        }

        if (closestLecturer) {
          selectedLecturer = closestLecturer;
        }
      }

      // If no GPS or couldn't find closest, fallback to load balancing
      if (!selectedLecturer) {
        allLecturers.sort((a, b) => a.currentLoad - b.currentLoad);
        selectedLecturer = allLecturers[0];
      }

      updates.push(
        prisma.student.update({
          where: { id: student.id },
          data: { assignmentId: selectedLecturer.assignmentId },
        })
      );
      selectedLecturer.currentLoad++;
      lecturerAssignmentMap.get(selectedLecturer.id)!.currentLoad++;
      totalAssigned++;

      // Update spatial center dynamically
      if (student.school?.latitude && student.school?.longitude) {
        const lData = lecturerAssignmentMap.get(selectedLecturer.id)!;
        if (lData.centerLat === null || lData.centerLng === null) {
          lData.centerLat = student.school.latitude;
          lData.centerLng = student.school.longitude;
        } else {
          lData.centerLat = (lData.centerLat! * (lData.currentLoad - 1) + student.school.latitude) / lData.currentLoad;
          lData.centerLng = (lData.centerLng! * (lData.currentLoad - 1) + student.school.longitude) / lData.currentLoad;
        }
      }
    }
  }

  // Execute all updates in a transaction
  await prisma.$transaction(updates);

  revalidatePath("/admin/assignments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");

  return { 
    success: true, 
    count: totalAssigned, 
    message: `Successfully assigned ${totalAssigned} students using spatial/zone distribution.` 
  };
}

export async function resetAssignments() {
  // Clear the assignmentId for all students
  await prisma.student.updateMany({
    data: { assignmentId: null },
  });

  // Optional: delete unlocked assignment records (clean up)
  await prisma.assignment.deleteMany({
    where: { isLocked: false },
  });

  revalidatePath("/admin/students");

  return { success: true, message: "All unlocked assignments have been reset." };
}

export async function manualAssignStudents(studentIds: string[], lecturerId: string) {
  // First, find or create the assignment record for this lecturer
  let assignment = await prisma.assignment.findFirst({
    where: { lecturerId, isLocked: false },
  });

  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: { lecturerId },
    });
  }

  // Update all selected students
  await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { assignmentId: assignment.id },
  });

  revalidatePath("/admin/assignments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");

  return { success: true, message: `Successfully assigned ${studentIds.length} student(s).` };
}

export async function getAssignmentStats() {
  const total = await prisma.student.count();
  const assigned = await prisma.student.count({ where: { assignmentId: { not: null } } });
  
  return {
    total,
    assigned,
    unassigned: total - assigned,
  };
}
