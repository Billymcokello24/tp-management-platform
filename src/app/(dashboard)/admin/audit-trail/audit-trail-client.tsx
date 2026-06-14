"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, LogIn, FileText, ClipboardCheck, UserPlus, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";

export function AuditTrailClient({ data }: { data: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Build unified timeline from audit logs + model activity
  const timeline: {
    id: string;
    type: string;
    action: string;
    message: string;
    actor?: string;
    actorRole?: string;
    timestamp: string;
    entity: string;
    entityId?: string;
    metadata?: any;
  }[] = [];

  // Add dedicated audit logs
  data.auditLogs.forEach((log: any) => {
    timeline.push({
      id: log.id,
      type: "audit",
      action: log.action,
      message: log.message,
      actor: log.userId || undefined,
      actorRole: log.userRole || undefined,
      timestamp: log.createdAt,
      entity: log.entity,
      entityId: log.entityId,
      metadata: log.metadata,
    });
  });

  // Add user registrations
  data.recentUsers.forEach((u: any) => {
    timeline.push({
      id: `user-${u.id}`,
      type: "model",
      action: "USER_REGISTERED",
      message: `${u.name} (${u.email}) registered as ${u.role}`,
      timestamp: u.createdAt,
      entity: "User",
      entityId: u.id,
    });
  });

  // Add assessments (only reviewed ones as significant events)
  data.recentAssessments.forEach((a: any) => {
    if (a.status === "REVIEWED") {
      timeline.push({
        id: `assessment-${a.id}`,
        type: "model",
        action: "ASSESSMENT_COMPLETED",
        message: `${a.student?.user?.name || "Student"} assessed in ${a.subject || "N/A"} — ${a.totalMarks}/100`,
        actor: a.lecturer?.user?.name || undefined,
        timestamp: a.createdAt,
        entity: "Assessment",
        entityId: a.id,
      });
    }
  });

  // Add lesson plans
  data.recentLessonPlans.forEach((lp: any) => {
    const action = lp.status === "SUBMITTED" ? "LESSON_PLAN_SUBMITTED" : lp.status === "APPROVED" ? "LESSON_PLAN_APPROVED" : "LESSON_PLAN_CREATED";
    timeline.push({
      id: `lp-${lp.id}`,
      type: "model",
      action,
      message: `"${lp.topic}" for ${lp.subject} — ${lp.status}`,
      actor: lp.student?.user?.name || undefined,
      timestamp: lp.createdAt,
      entity: "LessonPlan",
      entityId: lp.id,
    });
  });

  // Add assignments
  data.recentAssignments.forEach((as: any) => {
    const studentNames = as.students?.map((s: any) => s.user?.name).join(", ") || "N/A";
    timeline.push({
      id: `assign-${as.id}`,
      type: "model",
      action: "STUDENTS_ASSIGNED",
      message: `${as.lecturer?.user?.name || "Lecturer"} assigned students: ${studentNames}`,
      timestamp: as.createdAt,
      entity: "Assignment",
      entityId: as.id,
    });
  });

  // Sort by timestamp descending
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter
  const filtered = timeline.filter((e) => {
    const matchesSearch =
      e.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.actor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === "" || e.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Unique actions for filter
  const actions = Array.from(new Set(timeline.map((e) => e.action))).sort();

  const actionIcon = (action: string) => {
    if (action.includes("LOGIN")) return <LogIn className="h-4 w-4 text-blue-500" />;
    if (action.includes("ASSESSMENT")) return <ClipboardCheck className="h-4 w-4 text-emerald-500" />;
    if (action.includes("LESSON_PLAN")) return <FileText className="h-4 w-4 text-amber-500" />;
    if (action.includes("ASSIGN")) return <UserPlus className="h-4 w-4 text-purple-500" />;
    if (action.includes("REGISTER")) return <Users className="h-4 w-4 text-cyan-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const actionBadge = (action: string) => {
    const colors: Record<string, string> = {
      USER_LOGIN: "bg-blue-100 text-blue-800",
      USER_REGISTERED: "bg-cyan-100 text-cyan-800",
      ASSESSMENT_SUBMITTED: "bg-emerald-100 text-emerald-800",
      ASSESSMENT_COMPLETED: "bg-emerald-100 text-emerald-800",
      LESSON_PLAN_SUBMITTED: "bg-amber-100 text-amber-800",
      LESSON_PLAN_APPROVED: "bg-green-100 text-green-800",
      LESSON_PLAN_CREATED: "bg-orange-100 text-orange-800",
      STUDENT_ASSIGNED: "bg-purple-100 text-purple-800",
      STUDENTS_ASSIGNED: "bg-purple-100 text-purple-800",
    };
    return colors[action] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">System Audit</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Complete history of all system activities — logins, assessments, lesson plans, assignments, and more.
          </p>
        </div>
        <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {filtered.length} events recorded
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 no-print flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events, actors, entities..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-background max-w-[220px]">
          <option value="">All Actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
          ))}
        </select>
        {(searchTerm || filterAction) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setFilterAction(""); setPage(1); }}>Clear All</Button>
        )}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        {[
          { label: "Total Events", value: timeline.length, icon: <Clock className="h-4 w-4" /> },
          { label: "Logins", value: timeline.filter((e) => e.action.includes("LOGIN")).length, icon: <LogIn className="h-4 w-4 text-blue-500" /> },
          { label: "Assessments", value: timeline.filter((e) => e.action.includes("ASSESSMENT")).length, icon: <ClipboardCheck className="h-4 w-4 text-emerald-500" /> },
          { label: "Lesson Plans", value: timeline.filter((e) => e.action.includes("LESSON_PLAN")).length, icon: <FileText className="h-4 w-4 text-amber-500" /> },
        ].map((kpi) => (
          <Card key={kpi.label}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs font-medium">{kpi.label}</CardTitle>{kpi.icon}</CardHeader><CardContent><div className="text-xl font-bold">{kpi.value}</div></CardContent></Card>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>All system events in chronological order. {filtered.length} total, showing page {page} of {totalPages || 1}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paginated.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                <div className="mt-0.5 shrink-0">{actionIcon(event.action)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${actionBadge(event.action)}`}>
                      {event.action.replace(/_/g, " ")}
                    </span>
                    {event.actor && (
                      <span className="text-xs text-muted-foreground">
                        by <span className="font-medium text-foreground">{event.actor}</span>
                        {event.actorRole && <span className="text-muted-foreground"> ({event.actorRole})</span>}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{event.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>{new Date(event.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    <span>•</span>
                    <span>{event.entity}</span>
                    {event.entityId && <span className="font-mono text-[9px]">({event.entityId.slice(0, 8)}...)</span>}
                  </div>
                </div>
              </div>
            ))}
            {paginated.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No audit events found{searchTerm ? " matching your filters." : "."}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)}>««</Button>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>«</Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let n: number;
                  if (totalPages <= 7) n = i + 1;
                  else if (page <= 4) n = i + 1;
                  else if (page >= totalPages - 3) n = totalPages - 6 + i;
                  else n = page - 3 + i;
                  return <Button key={n} variant={n === page ? "default" : "outline"} size="sm" onClick={() => setPage(n)} className="min-w-[36px]">{n}</Button>;
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>»</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
