import { notFound } from "next/navigation";
import Link from "next/link";
import { getAssessmentsByStudentId } from "../../_actions/assessments";
import { AssessmentDetailClient } from "./assessment-detail-client";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // First, check if the ID passed is actually an Assessment ID (for backward compatibility with old links)
  let targetStudentId = id;
  const possibleAssessment = await prisma.assessment.findUnique({
    where: { id },
    select: { studentId: true }
  });
  
  if (possibleAssessment) {
    targetStudentId = possibleAssessment.studentId;
  }
  
  // Now fetch all assessments for the resolved studentId
  const assessments = await getAssessmentsByStudentId(targetStudentId);

  if (!assessments || assessments.length === 0) {
    const studentInfo = await prisma.student.findUnique({
      where: { id: targetStudentId },
      include: { user: true, school: true }
    });

    if (!studentInfo) {
      notFound();
    }

    return (
      <div className="flex flex-col items-center justify-center p-12 mt-10 bg-card border rounded-2xl shadow-sm text-center max-w-2xl mx-auto">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-muted-foreground">!</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">No Assessments Yet</h2>
        <p className="text-muted-foreground mb-6">
          The student <strong>{studentInfo.user?.name || "Unknown"}</strong> has not received any assessments yet.
        </p>
        <Link href="/admin/students" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Back to Students
        </Link>
      </div>
    );
  }

  return <AssessmentDetailClient assessments={assessments} />;
}
