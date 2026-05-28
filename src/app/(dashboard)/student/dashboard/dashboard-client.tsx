"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, ClipboardCheck, GraduationCap, MapPin, UserCheck, AlertTriangle } from "lucide-react";

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
}

export function StudentDashboardClient({ stats, recentLessonPlans, school, lecturer }: DashboardProps) {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {greeting}, <span className="text-primary">Trainee</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            <span className="mx-2 text-border">•</span> 
            <span className="text-primary/80">TP Session Active</span>
          </p>
        </div>
        
        {/* Optional right-side accent */}
        <div className="bg-card border border-border/50 shadow-sm rounded-2xl px-6 py-4 flex flex-col items-center justify-center shrink-0">
          <div className="text-2xl font-bold tracking-tight">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            Session Tracked
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <Card className="bg-primary text-primary-foreground border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold">Overall TP Progress</h2>
              <p className="text-primary-foreground/80 text-sm">Based on submitted lesson plans and completed assessments.</p>
            </div>
            <div className="text-4xl font-bold">{stats.progressPercentage}%</div>
          </div>
          <Progress value={stats.progressPercentage} className="h-3 bg-primary-foreground/20 [&>div]:bg-white" />
        </CardContent>
      </Card>

      {/* Stat Cards - Premium Layout */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Completed Plans</p>
                <div className="text-4xl font-extrabold text-foreground">{stats.completedLessonPlans}</div>
                <p className="text-xs font-medium text-muted-foreground/70">SUBMITTED</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending / Drafts</p>
                <div className="text-4xl font-extrabold text-foreground">{stats.pendingLessonPlans}</div>
                <p className="text-xs font-medium text-muted-foreground/70">TO REVIEW</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assessments Done</p>
                <div className="text-4xl font-extrabold text-foreground">{stats.completedAssessments}</div>
                <p className="text-xs font-medium text-muted-foreground/70">COMPLETED</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 group-hover:scale-110 transition-transform duration-300">
                <ClipboardCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current TP Score</p>
                <div className="text-4xl font-extrabold text-foreground">{stats.currentScore > 0 ? `${stats.currentScore}%` : "N/A"}</div>
                <p className="text-xs font-medium text-muted-foreground/70">AVERAGE</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placement Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Assigned School
              </CardTitle>
            </CardHeader>
            <CardContent>
              {school ? (
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-muted-foreground">Name:</span> {school.name}</p>
                  <p><span className="font-semibold text-muted-foreground">County:</span> {school.county}</p>
                  <p><span className="font-semibold text-muted-foreground">Principal:</span> {school.principal}</p>
                  <p><span className="font-semibold text-muted-foreground">Contact:</span> {school.phone}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 text-sm p-3 bg-amber-50 rounded-md">
                  <AlertTriangle className="h-4 w-4" /> Not yet placed in a school.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" /> Assigned Supervisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lecturer ? (
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-muted-foreground">Name:</span> {lecturer.name}</p>
                  <p><span className="font-semibold text-muted-foreground">Department:</span> {lecturer.department}</p>
                  <p><span className="font-semibold text-muted-foreground">Email:</span> {lecturer.email}</p>
                  <p><span className="font-semibold text-muted-foreground">Phone:</span> {lecturer.phone}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 text-sm p-3 bg-amber-50 rounded-md">
                  <AlertTriangle className="h-4 w-4" /> No supervisor assigned yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Lesson Plans</CardTitle>
            <CardDescription>Your latest submissions and drafts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLessonPlans.length > 0 ? (
              <div className="space-y-4">
                {recentLessonPlans.map((lp) => (
                  <div key={lp.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium">{lp.topic}</p>
                      <p className="text-xs text-muted-foreground">{lp.subject} • {new Date(lp.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      lp.status === "APPROVED" ? "bg-green-100 text-green-800" : 
                      lp.status === "DRAFT" ? "bg-slate-200 text-slate-800" : 
                      "bg-blue-100 text-blue-800"
                    }`}>
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
