"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, TrendingUp, Users, BookOpen, GraduationCap } from "lucide-react";
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

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

interface ReportsData {
  totalStudents: number;
  totalLecturers: number;
  completedAssessments: number;
  avgScore: number;
  gradeDistribution: { name: string; value: number }[];
  averageByCourse: { name: string; average: number }[];
}

export function ReportsClient({ data }: { data: ReportsData }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-printable header controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Analytics</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Performance Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Aggregate Teaching Practice analytics and trends.
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="bg-card rounded-xl shrink-0">
          <Printer className="mr-2 h-4 w-4" /> Print Summary Report (PDF)
        </Button>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Tom Mboya University</h1>
        <h2 className="text-xl font-semibold uppercase text-muted-foreground">Teaching Practice Summary Report</h2>
        <p className="text-sm text-muted-foreground mt-2">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Lecturers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLecturers}</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Reviews</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedAssessments}</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average TP Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="print:shadow-none print:border-none print-avoid-break">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Breakdown of student performance grades</CardDescription>
          </CardHeader>
          <CardContent>
            {data.gradeDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={(props: any) => `${props.name} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {data.gradeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none print-avoid-break">
          <CardHeader>
            <CardTitle>Average Score by Course</CardTitle>
            <CardDescription>Comparative performance across degree programs</CardDescription>
          </CardHeader>
          <CardContent>
            {data.averageByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.averageByCourse} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
