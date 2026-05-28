"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, School, Shuffle, ClipboardCheck, FileText, TrendingUp, GraduationCap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#e2e8f0", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface DashboardProps {
  stats: {
    totalStudents: number;
    totalLecturers: number;
    totalSchools: number;
    assignedStudents: number;
    pendingAssignments: number;
    completedAssessments: number;
    pendingAssessments: number;
    avgScore: number;
  };
  chartData: {
    assessmentsPerLecturer: { name: string; assessments: number }[];
    studentsPerCounty: { name: string; students: number }[];
    assignmentCompletion: { name: string; value: number }[];
  };
  activity: {
    recentAssessments: any[];
    recentLessonPlans: any[];
  };
}

const statCards = [
  { key: "totalStudents", label: "Total Students", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { key: "totalLecturers", label: "Lecturers", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "totalSchools", label: "Schools", icon: School, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { key: "assignedStudents", label: "Assigned", icon: Shuffle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { key: "pendingAssignments", label: "Pending Assigns", icon: FileText, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { key: "completedAssessments", label: "Completed", icon: ClipboardCheck, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
  { key: "pendingAssessments", label: "Pending Reviews", icon: TrendingUp, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  { key: "avgScore", label: "Avg TP Score", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10", suffix: "%" },
] as const;

export function AdminDashboardClient({ stats, chartData, activity }: DashboardProps) {
  // Get time of day for greeting
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Institutional Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {greeting}, <span className="text-primary">Admin</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            <span className="mx-2 text-border">•</span> 
            <span className="text-primary/80">Oversight Active</span>
          </p>
        </div>
        
        {/* Optional right-side accent (like a clock or sync status) */}
        <div className="bg-card border border-border/50 shadow-sm rounded-2xl px-6 py-4 flex flex-col items-center justify-center shrink-0">
          <div className="text-2xl font-bold tracking-tight">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            Operational Sync
          </div>
        </div>
      </div>

      {/* Stat Cards - Premium Layout */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.key} className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <div className="text-4xl font-extrabold text-foreground">
                    {stats[card.key as keyof typeof stats]}
                    <span className="text-2xl text-muted-foreground/50 ml-1">
                      {"suffix" in card ? card.suffix : ""}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground/70">REGISTRY</p>
                </div>
                <div className={`p-3.5 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Assessments per Lecturer */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Assessments per Lecturer</CardTitle>
            <CardDescription>Number of completed assessments by each supervisor</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.assessmentsPerLecturer.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.assessmentsPerLecturer}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "currentColor" }} />
                  <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="assessments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No assessment data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Completion */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Assignment Completion</CardTitle>
            <CardDescription>Proportion of students assigned to supervisors</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.assignmentCompletion.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData.assignmentCompletion}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={(props: any) => `${props.name || ""} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  >
                    {chartData.assignmentCompletion.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No students registered yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students per County */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Students per County</CardTitle>
            <CardDescription>Distribution of students across counties</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.studentsPerCounty.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.studentsPerCounty} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tick={{ fill: "currentColor" }} />
                  <YAxis type="category" dataKey="name" className="text-xs" width={100} tick={{ fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="students" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No school data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.recentAssessments.length === 0 && activity.recentLessonPlans.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-10">
                  No recent activity found.
                </div>
              ) : (
                <>
                  {activity.recentAssessments.map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{a.lecturer?.user?.name} assessed {a.student?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">Score: {a.totalMarks}/100 · {a.status}</p>
                      </div>
                    </div>
                  ))}
                  {activity.recentLessonPlans.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.student?.user?.name} submitted a lesson plan</p>
                        <p className="text-xs text-muted-foreground">{p.subject} · {p.status}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
