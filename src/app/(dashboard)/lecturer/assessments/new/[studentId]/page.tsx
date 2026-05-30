import { notFound } from "next/navigation";
import { getStudentForAssessment } from "../../../_actions/assessments";
import { AssessmentFormClient } from "./assessment-form-client";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function NewAssessmentPage({ params }: PageProps) {
  const { studentId } = await params;

  try {
    const { student, lecturerId } = await getStudentForAssessment(studentId);
    
    const serializedStudent = {
      id: student.id,
      name: student.user.name,
      admissionNumber: student.admissionNumber,
      course: student.course,
      schoolName: student.school?.name || "N/A",
      schoolLatitude: student.school?.latitude ?? null,
      schoolLongitude: student.school?.longitude ?? null,
      schoolGeofenceRadius: student.school?.geofenceRadius ?? 500,
    };

    return <AssessmentFormClient student={serializedStudent} lecturerId={lecturerId} />;
  } catch (error) {
    // If student not found or unauthorized
    notFound();
  }
}
