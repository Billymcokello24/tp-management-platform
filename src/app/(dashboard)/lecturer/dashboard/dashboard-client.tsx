"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Clock, FileText } from "lucide-react";

interface LecturerDashboardProps {
  stats: {
    totalAssigned: number;
    completedAssessments: number;
    pendingAssessments: number;
  };
  recentActivity: {
    id: string;
    studentName: string;
    status: string;
    totalMarks: number;
    date: string;
  }[];
}

export function LecturerDashboardClient({ stats, recentActivity }: LecturerDashboardProps) {
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Faculty Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {greeting}, <span className="text-primary">Supervisor</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            <span className="mx-2 text-border">•</span> 
            <span className="text-primary/80">Active</span>
          </p>
        </div>
        
        {/* Optional right-side accent */}
        <div className="bg-card border border-border/50 shadow-sm rounded-2xl px-6 py-4 flex flex-col items-center justify-center shrink-0">
          <div className="text-2xl font-bold tracking-tight">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            Online
          </div>
        </div>
      </div>

      {/* Stat Cards - Premium Layout */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">My Students</p>
                <div className="text-4xl font-extrabold text-foreground">{stats.totalAssigned}</div>
                <p className="text-xs font-medium text-muted-foreground/70">REGISTRY</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-blue-600" />
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
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Reviews</p>
                <div className="text-4xl font-extrabold text-foreground">{stats.pendingAssessments}</div>
                <p className="text-xs font-medium text-muted-foreground/70">ACTION REQUIRED</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Your latest assessment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">Assessed {activity.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()} · Score: {activity.totalMarks}/100
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent assessments found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you perform frequently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <a href="/lecturer/students" className="flex items-center gap-3 p-3 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">View My Students</div>
                  <div className="text-xs text-muted-foreground">See all assigned candidates</div>
                </div>
              </a>
              <a href="/lecturer/lesson-plans" className="flex items-center gap-3 p-3 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Review Lesson Plans</div>
                  <div className="text-xs text-muted-foreground">Check pending student submissions</div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
