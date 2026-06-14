"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, ClipboardCheck, GraduationCap, MapPin, UserCheck, AlertTriangle, CheckCircle2, Clock, CircleDashed, TrendingUp } from "lucide-react";

interface AssessmentSlot {
  id: string;
  totalMarks: number;
  grade: string;
  subject: string;
  lecturerName: string;
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

const scoreColor = (score: number | undefined) => {
  if (!score) return "text-muted-foreground";
  if (score >= 70) return "text-emerald-600 font-bold";
  if (score < 40) return "text-red-600 font-bold";
  return "text-foreground font-semibold";
};

const gradeBadge = (grade: string) => {
  if (grade === "A") return "bg-emerald-100 text-emerald-800";
  if (grade === "B") return "bg-blue-100 text-blue-800";
  if (grade === "C") return "bg-amber-100 text-amber-800";
  if (grade === "D" || grade === "E") return "bg-red-100 text-red-800";
  return "bg-slate-200 text-slate-800";
};

export function StudentDashboardClient({ stats, recentLessonPlans, school, lecturer, assessmentSlots, overallSummary }: DashboardProps) {
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header (Premium Welcome) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Student Dashboard</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {greeting}, Student
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Here is your Teaching Practice overview and progress.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed LPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLessonPlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending LPs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLessonPlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TP Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.progressPercentage}%</div>
            <Progress value={stats.progressPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Assessment Slots — A1S1, A1S2, A2S1, A2S2, A3S1, A3S2 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">My Assessment Scores</h2>
        </div>

        {/* Subject-grouped table layout */}
        <div className="space-y-4">
          {/* Subject 1 Row */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary">{overallSummary.s1Name}</CardTitle>
              <CardDescription className="text-xs">Subject Average: {overallSummary.s1Average > 0 ? `${overallSummary.s1Average}%` : "N/A"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "A1S1", slot: assessmentSlots.a1s1 },
                  { label: "A2S1", slot: assessmentSlots.a2s1 },
                  { label: "A3S1", slot: assessmentSlots.a3s1 },
                ].map(({ label, slot }) => (
                  <div key={label} className={`p-3 rounded-xl border-2 text-center transition-all ${
                    slot ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-dashed border-border/60 bg-muted/20"
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                    {slot ? (
                      <>
                        <div className={scoreColor(slot.totalMarks) + " text-2xl"}>{slot.totalMarks}%</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${gradeBadge(slot.grade)}`}>Grade: {slot.grade}</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg text-muted-foreground/50 font-semibold">—</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <CircleDashed className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/50 font-medium">Not Started</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject 2 Row */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary">{overallSummary.s2Name}</CardTitle>
              <CardDescription className="text-xs">Subject Average: {overallSummary.s2Average > 0 ? `${overallSummary.s2Average}%` : "N/A"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "A1S2", slot: assessmentSlots.a1s2 },
                  { label: "A2S2", slot: assessmentSlots.a2s2 },
                  { label: "A3S2", slot: assessmentSlots.a3s2 },
                ].map(({ label, slot }) => (
                  <div key={label} className={`p-3 rounded-xl border-2 text-center transition-all ${
                    slot ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-dashed border-border/60 bg-muted/20"
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                    {slot ? (
                      <>
                        <div className={scoreColor(slot.totalMarks) + " text-2xl"}>{slot.totalMarks}%</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${gradeBadge(slot.grade)}`}>Grade: {slot.grade}</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg text-muted-foreground/50 font-semibold">—</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <CircleDashed className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/50 font-medium">Not Started</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Student Summary */}
        <Card className="mt-4 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Overall TP Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{overallSummary.s1Name} Avg</div>
                <div className="text-2xl font-bold">{overallSummary.s1Average > 0 ? `${overallSummary.s1Average}%` : "N/A"}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{overallSummary.s2Name} Avg</div>
                <div className="text-2xl font-bold">{overallSummary.s2Average > 0 ? `${overallSummary.s2Average}%` : "N/A"}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TP Average</div>
                <div className="text-2xl font-bold text-primary">{overallSummary.finalTPAverage > 0 ? `${overallSummary.finalTPAverage}%` : "N/A"}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Final Grade</div>
                <div className="text-2xl font-bold">
                  <span className={`px-2.5 py-0.5 rounded-full ${gradeBadge(overallSummary.finalGrade)}`}>{overallSummary.finalGrade}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completion</div>
                <div className="text-2xl font-bold">{overallSummary.completionPercentage}%</div>
                <Progress value={overallSummary.completionPercentage} className="h-1.5 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-2 text-right">
          <a href="/student/assessments" className="text-sm text-primary hover:underline">
            View Full Assessment Report →
          </a>
        </div>
      </div>

      {/* School and Lecturer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              My School / Station
            </CardTitle>
          </CardHeader>
          <CardContent>
            {school ? (
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{school.name}</div>
                <div className="text-muted-foreground">{school.county}</div>
                <div className="text-muted-foreground">Principal: {school.principal}</div>
                <div className="text-muted-foreground">Phone: {school.phone}</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No school assigned. Set your station.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              My Supervisor (Lecturer)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lecturer ? (
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{lecturer.name}</div>
                <div className="text-muted-foreground">{lecturer.department}</div>
                <div className="text-muted-foreground">Email: {lecturer.email}</div>
                <div className="text-muted-foreground">Phone: {lecturer.phone}</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No supervisor assigned yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Lesson Plans */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Lesson Plans</CardTitle>
            <CardDescription>Your latest submitted lesson plans</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLessonPlans.length > 0 ? (
              <div className="space-y-3">
                {recentLessonPlans.map((lp) => (
                  <div key={lp.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium text-sm">{lp.topic}</div>
                      <div className="text-xs text-muted-foreground">{lp.subject} • {new Date(lp.date).toLocaleDateString()}</div>
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
                  View All Lesson Plans →
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
  );
}
