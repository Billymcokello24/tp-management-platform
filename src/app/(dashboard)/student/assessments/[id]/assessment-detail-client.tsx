"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AssessmentSlot {
  assessmentNumber: number;
  subject: string;
  status: string;
  createdAt: string;
  lecturerName: string;
}

export function StudentAssessmentDetailClient({ assessments }: { assessments: any[] }) {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No assessment records found.
      </div>
    );
  }

  const student = assessments[0]?.student;

  const getS1 = () => student?.subjects?.[0] || "Subject 1";
  const getS2 = () => student?.subjects?.[1] || "Subject 2";

  const a1s1 = assessments.find((a: any) => a.assessmentNumber === 1 && a.subject === getS1());
  const a1s2 = assessments.find((a: any) => a.assessmentNumber === 1 && a.subject === getS2());
  const a2s1 = assessments.find((a: any) => a.assessmentNumber === 2 && a.subject === getS1());
  const a2s2 = assessments.find((a: any) => a.assessmentNumber === 2 && a.subject === getS2());
  const a3s1 = assessments.find((a: any) => a.assessmentNumber === 3 && a.subject === getS1());
  const a3s2 = assessments.find((a: any) => a.assessmentNumber === 3 && a.subject === getS2());

  const slots = [
    { label: `Assessment 1 - ${getS1()}`, key: "A1S1", data: a1s1 },
    { label: `Assessment 1 - ${getS2()}`, key: "A1S2", data: a1s2 },
    { label: `Assessment 2 - ${getS1()}`, key: "A2S1", data: a2s1 },
    { label: `Assessment 2 - ${getS2()}`, key: "A2S2", data: a2s2 },
    { label: `Assessment 3 - ${getS1()}`, key: "A3S1", data: a3s1 },
    { label: `Assessment 3 - ${getS2()}`, key: "A3S2", data: a3s2 },
  ];

  const completedCount = slots.filter((s) => s.data).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <Link
        href="/student/assessments"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Assessments
      </Link>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Assessment Progress</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {student?.user?.name || "Student"} — Progress Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Admission: {student?.admissionNumber} &middot; Course: {student?.course}
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Overall Completion</h2>
          <span className="text-2xl font-extrabold text-primary">{completedCount}/6</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 6) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount === 0
            ? "No assessments completed yet"
            : completedCount === 6
              ? "All assessments completed!"
              : `${completedCount} out of 6 assessments completed`}
        </p>
      </div>

      {/* Assessment slots */}
      <div className="grid gap-4">
        {slots.map((slot) => (
          <div
            key={slot.key}
            className={`border rounded-lg p-5 transition-colors ${
              slot.data
                ? "bg-card border-emerald-200 dark:border-emerald-800"
                : "bg-muted/30 border-dashed"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-4 w-4 rounded-full flex-shrink-0 ${
                    slot.data ? "bg-emerald-500" : "bg-muted-foreground/20"
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-sm">{slot.label}</h3>
                  {slot.data ? (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Completed on {new Date(slot.data.createdAt).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assessed by: {slot.data.lecturerName || slot.data.lecturer?.user?.name || "N/A"}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground">Not yet completed</p>
                      <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{slot.key}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
