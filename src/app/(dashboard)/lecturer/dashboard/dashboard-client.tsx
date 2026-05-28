"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Clock, FileText, TrendingUp, Award, Calendar } from "lucide-react";
import Link from "next/link";

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
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 sm:p-10 shadow-lg border border-primary/20">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 transform rotate-12 translate-x-8 -translate-y-8" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/20 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Faculty Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {greeting}, <span className="text-primary-foreground/90">Supervisor</span>
            </h1>
            <p className="text-primary-foreground/80 max-w-xl text-sm md:text-base font-medium">
              Oversee your assigned teacher trainees, review their lesson plans, and manage final assessments efficiently.
            </p>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 shadow-xl rounded-2xl px-6 py-5 flex flex-col items-center justify-center shrink-0 min-w-[160px]">
            <div className="text-3xl font-black tracking-tight mb-1">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">My Trainees</p>
                <div className="text-5xl font-black text-foreground drop-shadow-sm">{stats.totalAssigned}</div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
                  <TrendingUp className="h-3 w-3" /> Active Roster
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                <Users className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Assessments Done</p>
                <div className="text-5xl font-black text-foreground drop-shadow-sm">{stats.completedAssessments}</div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                  <ClipboardCheck className="h-3 w-3" /> Completed
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                <Award className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Pending Reviews</p>
                <div className="text-5xl font-black text-foreground drop-shadow-sm">{stats.pendingAssessments}</div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md">
                  <Clock className="h-3 w-3" /> Requires Action
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                <Calendar className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Assessments (Takes up 2 columns) */}
        <Card className="lg:col-span-2 border-border/50 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Recent Evaluations
            </CardTitle>
            <CardDescription className="text-sm font-medium">Latest graded teaching practice sessions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-border/40">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                        <span className="font-bold text-primary text-lg">{activity.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-base text-foreground">{activity.studentName}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                          Evaluated on {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 sm:ml-auto">
                      <div className="text-right">
                        <p className="text-2xl font-black text-foreground">{activity.totalMarks}<span className="text-sm text-muted-foreground font-semibold">/100</span></p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{activity.status}</p>
                      </div>
                      <Link href={`/lecturer/assessments/${activity.id}`}>
                        <button className="h-10 px-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No assessments yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  You haven't completed any student assessments. They will appear here once graded.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Quick Actions
            </CardTitle>
            <CardDescription className="text-sm font-medium">Tools to manage your workload</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 bg-gradient-to-b from-card to-muted/20">
            <div className="grid gap-4">
              <Link href="/lecturer/students" className="group flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Trainees</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">View all assigned students and record new assessments.</div>
                </div>
              </Link>
              
              <Link href="/lecturer/lesson-plans" className="group flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground group-hover:text-primary transition-colors">Review Submissions</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">Approve or reject lesson plans and schemes of work.</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
