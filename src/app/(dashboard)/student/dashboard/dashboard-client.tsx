"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, ClipboardCheck, MapPin, UserCheck, CheckCircle2, CircleDashed } from "lucide-react";

interface AssessmentSlot {
  id: string;
  subject: string;
}

interface DashboardProps {
  stats: {
    completedLessonPlans: number;
    pendingLessonPlans: number;
    completedAssessments: number;
    currentScore: number;
    progressPercentage: number;
  };
  recentLessonPlans: {
    id: string;
    topic: string;
    subject: string;
    status: string;
    date: string;
  }[];
  school: { name: string; county: string; principal: string; phone: string } | null;
  lecturer: { name: string; department: string; email: string; phone: string } | null;
  assessmentSlots: Record<string, AssessmentSlot | null>;
  overallSummary: {
    s1Name: string;
    s2Name: string;
    s1Average: number;
    s2Average: number;
    assessmentAverage: number;
    finalTPAverage: number;
    finalGrade: string;
    completionPercentage: number;
  };
}

export function StudentDashboardClient({ 
  stats, 
  recentLessonPlans, 
  school, 
  lecturer, 
  assessmentSlots, 
  overallSummary 
}: DashboardProps) {
  const completedAssessments = stats.completedAssessments;
  const completedLPs = stats.completedLessonPlans;
  const lpTarget = 15;
  const assessmentTarget = 6;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Dashboard</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">My Teaching Practice</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Track your TP progress at a glance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lesson Plans</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLPs}/{lpTarget}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min((completedLPs / lpTarget) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments}/{assessmentTarget}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min((completedAssessments / assessmentTarget) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">TP Completion</p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">School</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{school?.name || "Not Assigned"}</div>
            <p className="text-xs text-muted-foreground">{school?.county || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Assessment Progress</CardTitle>
            <CardDescription>Your completed teaching practice assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Subject 1 Row */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-3">{overallSummary.s1Name}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "A1S1", slot: assessmentSlots.a1s1 },
                  { label: "A2S1", slot: assessmentSlots.a2s1 },
                  { label: "A3S1", slot: assessmentSlots.a3s1 },
                ].map(({ label, slot }) => (
                  <div key={label} className={`p-4 rounded-xl border-2 text-center transition-all ${
                    slot ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-dashed border-border/60 bg-muted/20"
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
                    {slot ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <CircleDashed className="h-6 w-6 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground/50 font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subject 2 Row */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">{overallSummary.s2Name}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "A1S2", slot: assessmentSlots.a1s2 },
                  { label: "A2S2", slot: assessmentSlots.a2s2 },
                  { label: "A3S2", slot: assessmentSlots.a3s2 },
                ].map(({ label, slot }) => (
                  <div key={label} className={`p-4 rounded-xl border-2 text-center transition-all ${
                    slot ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-dashed border-border/60 bg-muted/20"
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
                    {slot ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <CircleDashed className="h-6 w-6 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground/50 font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mini progress bar at bottom */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Overall Assessment Progress</span>
                <span className="text-xs font-bold">{completedAssessments}/{assessmentTarget}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min((completedAssessments / assessmentTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Lecturer Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Supervisor</CardTitle>
            </CardHeader>
            <CardContent>
              {lecturer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{lecturer.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{lecturer.department}</p>
                  <p className="text-xs text-muted-foreground">{lecturer.email}</p>
                  <p className="text-xs text-muted-foreground">{lecturer.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No supervisor assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* School Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Teaching Station</CardTitle>
            </CardHeader>
            <CardContent>
              {school ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{school.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{school.county}</p>
                  <p className="text-xs text-muted-foreground">Principal: {school.principal}</p>
                  <p className="text-xs text-muted-foreground">{school.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No school assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Lesson Plans */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Lesson Plans</CardTitle>
              <CardDescription>Your latest submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLessonPlans.length > 0 ? (
                <div className="space-y-3">
                  {recentLessonPlans.map((lp) => (
                    <div key={lp.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium text-sm">{lp.topic}</div>
                        <div className="text-xs text-muted-foreground">{lp.subject} &bull; {new Date(lp.date).toLocaleDateString()}</div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          lp.status === "APPROVED" ? "bg-green-100 text-green-800" : 
                          lp.status === "DRAFT" ? "bg-slate-200 text-slate-800" : 
                          "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {lp.status}
                      </div>
                    </div>
                  ))}
                  <a href="/student/lesson-plans" className="text-sm text-primary hover:underline block text-center mt-4">
                    View All Lesson Plans &rarr;
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No lesson plans created yet.</p>
                  <a href="/student/lesson-plans/new" className="text-primary hover:underline mt-2 inline-block">Create your first lesson plan</a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
