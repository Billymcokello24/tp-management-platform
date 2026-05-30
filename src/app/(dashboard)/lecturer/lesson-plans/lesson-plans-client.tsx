"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  MapPin,
  Eye,
  Search,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

interface LessonPlan {
  id: string;
  subject: string;
  topic: string;
  classForm: string;
  date: string;
  status: string;
  createdAt: string;
}

interface StudentWithPlans {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  schoolCounty: string;
  lessonPlans: LessonPlan[];
}

export function LecturerLessonPlansClient({
  students,
}: {
  students: StudentWithPlans[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.schoolName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPlans = students.reduce(
    (sum, s) => sum + s.lessonPlans.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Academic Review
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Lesson Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Review lesson plans submitted by your assigned students.{" "}
            <span className="text-foreground font-semibold">
              {totalPlans} plan{totalPlans !== 1 ? "s" : ""}
            </span>{" "}
            across{" "}
            <span className="text-foreground font-semibold">
              {students.length} student{students.length !== 1 ? "s" : ""}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students or schools..."
          className="pl-10"
        />
      </div>

      {/* Student Cards */}
      {filtered.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-xl p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-1">No Students Found</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {search
              ? "No students match your search query."
              : "You don't have any assigned students yet. Students will appear here once they are assigned to you by the admin."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => {
            const isExpanded = expandedId === student.id;
            return (
              <Card
                key={student.id}
                className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Student Header Row */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : student.id)
                  }
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {student.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {student.schoolName}
                          {student.schoolCounty !== "N/A" &&
                            `, ${student.schoolCounty}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {student.lessonPlans.length} Plan
                      {student.lessonPlans.length !== 1 ? "s" : ""}
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Lesson Plans */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 border-t border-border/40">
                    {student.lessonPlans.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-6 text-center">
                        This student has not submitted any lesson plans yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="text-left py-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Subject
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Topic
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Class
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Date
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Status
                              </th>
                              <th className="text-right py-2 px-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.lessonPlans.map((lp) => (
                              <tr
                                key={lp.id}
                                className="border-b border-border/20 last:border-0 hover:bg-muted/20"
                              >
                                <td className="py-2.5 px-3 font-medium">
                                  {lp.subject}
                                </td>
                                <td className="py-2.5 px-3 text-muted-foreground">
                                  {lp.topic}
                                </td>
                                <td className="py-2.5 px-3 text-muted-foreground">
                                  {lp.classForm}
                                </td>
                                <td className="py-2.5 px-3 text-muted-foreground">
                                  {new Date(lp.date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  <Badge
                                    variant={
                                      lp.status === "APPROVED"
                                        ? "default"
                                        : lp.status === "SUBMITTED"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className={
                                      lp.status === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : ""
                                    }
                                  >
                                    {lp.status}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <Link
                                    href={`/student/lesson-plans/${lp.id}`}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-primary hover:text-primary/80"
                                    >
                                      <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
