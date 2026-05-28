"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Award, FileText, ClipboardCheck, MessageSquare } from "lucide-react";

export default function StudentResultsPage() {
  const isFinalized = true; // Mock status
  const finalScore = 84;

  const assessments = [
    { id: 1, date: "2026-06-15", score: 82, status: "Finalized", feedback: "Good lesson delivery, but needs more focus on time management during group activities." },
    { id: 2, date: "2026-07-02", score: 86, status: "Finalized", feedback: "Excellent use of teaching aids. Class control has improved significantly since the first assessment." },
  ];

  return (
    <div className="space-y-8 pb-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Performance</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            TP Results
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Your final Teaching Practice scores and supervisor feedback.
          </p>
        </div>
      </div>

      {!isFinalized ? (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
          <CardContent className="pt-6 text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">Results Pending</h2>
            <p className="text-amber-800 dark:text-amber-300 max-w-md mx-auto">
              Your final Teaching Practice results have not been finalized yet. Please check back after all assessments are completed and verified by the TP Coordinator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Final Score Hero */}
          <Card className="bg-primary text-primary-foreground border-0 shadow-lg overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
              <Award className="w-64 h-64" />
            </div>
            <CardContent className="pt-8 pb-10 px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    <CheckCircle className="h-4 w-4" /> Finalized & Approved
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold">Congratulations!</h2>
                  <p className="text-primary-foreground/80 max-w-md text-base">
                    You have successfully completed your Teaching Practice. Your overall performance was outstanding.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center justify-center bg-background text-foreground rounded-full w-40 h-40 shadow-2xl border-4 border-primary-foreground/20">
                  <span className="text-5xl font-extrabold tracking-tighter text-primary">{finalScore}%</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Final Score</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Assessments */}
          <h3 className="text-xl font-bold tracking-tight mt-10 mb-4">Assessment Breakdowns</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {assessments.map((assessment, i) => (
              <Card key={assessment.id} className="relative overflow-hidden group">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Assessment {i + 1}</CardTitle>
                      <CardDescription>Conducted on {assessment.date}</CardDescription>
                    </div>
                    <div className="text-2xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                      {assessment.score}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" /> Supervisor Feedback
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl italic border border-border/50">
                        "{assessment.feedback}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graduation Readyness */}
          <Card className="mt-8">
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <GraduationCap className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold">Academic Clearance</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your TP results have been forwarded to the Senate for graduation clearance. No further action is required on your part.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Add missing lucide-react imports that were used
import { Clock, CheckCircle } from "lucide-react";
