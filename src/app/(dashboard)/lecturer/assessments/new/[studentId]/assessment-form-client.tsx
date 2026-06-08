"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, MapPin, Loader2, ShieldCheck, ShieldAlert, RefreshCw, WifiOff, Lock, CheckCircle2, Circle, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { submitAssessment } from "../../../_actions/assessments";
import { useGeolocation } from "@/hooks/use-geolocation";
import { checkGeofence } from "@/lib/geofence";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";

interface SerializedAssessment {
  id: string;
  status: string;
  assessmentNumber: number;
  subject: string | null;
  totalMarks: number;
  grade: string;
  performanceBand: string;
  createdAt: string;
  [key: string]: any;
}

const MARK_FIELDS = [
  "schemeOfWorkMark","lessonPlanObjectives","lessonPlanActivities","lessonPlanSequence",
  "introductionMark","logicalPresentation","contentRelevance","contentAdequacy",
  "teachingStrategies","teachingSkills","contentMastery","communicationMark",
  "chalkboardUse","resourceTiming","resourceAppropriateness","resourceInnovativeness",
  "learnerControl","learnerParticipation","groupWork","teacherLearnerRapport",
  "closureSkills","concludingActivities","assignmentMark","personalityMark","selfAppraisalMark",
];

const DEFAULT_MARKS: Record<string, number> = Object.fromEntries(MARK_FIELDS.map(f => [f, 0]));

export function AssessmentFormClient({ student, lecturerId, existingAssessments }: {
  student: any; lecturerId: string; existingAssessments: SerializedAssessment[];
}) {
  const router = useRouter();
  const geo = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);

  // Default subjects if not provided
  const subjects = student.subjects && student.subjects.length > 0 ? student.subjects : ["Subject 1", "Subject 2"];
  const s1 = subjects[0];
  const s2 = subjects[1] || "Subject 2";

  // State for which assessment slot is currently being worked on
  const [currentAssnNum, setCurrentAssnNum] = useState<string>("1");
  const [currentSubject, setCurrentSubject] = useState<string>(s1);

  // ── Progression Logic ──
  const submitted = existingAssessments.filter(a => a.status === "REVIEWED");
  
  // Find a draft for the currently selected slot, or any draft if none selected
  const activeDraft = existingAssessments.find(a => a.status === "DRAFT" && a.assessmentNumber === parseInt(currentAssnNum) && a.subject === currentSubject);
  const anyDraft = existingAssessments.find(a => a.status === "DRAFT");

  // Determine initial selection based on what's missing or what's a draft
  useEffect(() => {
    if (activeDraft) {
        // already matching
        return;
    }
    if (anyDraft) {
        setCurrentAssnNum(anyDraft.assessmentNumber.toString());
        if (anyDraft.subject) setCurrentSubject(anyDraft.subject);
        return;
    }
    // Auto-select next available slot
    if (!submitted.find(a => a.assessmentNumber === 1 && a.subject === s1)) { setCurrentAssnNum("1"); setCurrentSubject(s1); }
    else if (!submitted.find(a => a.assessmentNumber === 1 && a.subject === s2)) { setCurrentAssnNum("1"); setCurrentSubject(s2); }
    else if (!submitted.find(a => a.assessmentNumber === 2 && a.subject === s1)) { setCurrentAssnNum("2"); setCurrentSubject(s1); }
    else if (!submitted.find(a => a.assessmentNumber === 2 && a.subject === s2)) { setCurrentAssnNum("2"); setCurrentSubject(s2); }
  }, [submitted, anyDraft, activeDraft, s1, s2]);

  // Determine if the current slot is already submitted
  const isCurrentSlotSubmitted = submitted.find(a => a.assessmentNumber === parseInt(currentAssnNum) && a.subject === currentSubject);

  const completedCount = submitted.length;
  const allDone = completedCount >= 4;

  // Initialize marks from draft if it exists for this slot, else default
  useEffect(() => {
    if (activeDraft) {
        setMarks(Object.fromEntries(MARK_FIELDS.map(f => [f, activeDraft[f] || 0])));
        setComments({
            areasOfStrength: activeDraft.areasOfStrength || "",
            areasOfImprovement: activeDraft.areasOfImprovement || "",
            generalComments: activeDraft.generalComments || "",
        });
    } else {
        setMarks({ ...DEFAULT_MARKS });
        setComments({ areasOfStrength: "", areasOfImprovement: "", generalComments: "" });
    }
  }, [currentAssnNum, currentSubject, activeDraft]);

  const [marks, setMarks] = useState<Record<string, number>>({ ...DEFAULT_MARKS });
  const [comments, setComments] = useState({ areasOfStrength: "", areasOfImprovement: "", generalComments: "" });

  const totalMarks = useMemo(() => Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0), [marks]);

  // Geofence
  const schoolHasGPS = student.schoolLatitude !== null && student.schoolLongitude !== null;
  const geofenceResult = (schoolHasGPS && geo.position)
    ? checkGeofence(geo.position.latitude, geo.position.longitude, student.schoolLatitude, student.schoolLongitude, student.schoolGeofenceRadius)
    : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, max: number) => {
    let val = parseInt(e.target.value) || 0;
    if (val > max) val = max;
    if (val < 0) val = 0;
    setMarks({ ...marks, [e.target.name]: val });
  };

  const buildGPSData = () => {
    let gpsData: any = { isGeoVerified: false, geoVerificationNote: "No GPS data available" };
    if (geo.position) {
      gpsData.submissionLatitude = geo.position.latitude;
      gpsData.submissionLongitude = geo.position.longitude;
      const locLabel = geo.position.locationName || `${geo.position.latitude.toFixed(5)}, ${geo.position.longitude.toFixed(5)}`;
      if (geofenceResult) {
        gpsData.isGeoVerified = geofenceResult.isInside;
        gpsData.geoVerificationNote = geofenceResult.isInside
          ? `Verified at ${locLabel} — ${geofenceResult.distanceFormatted} from school. Accuracy: ${Math.round(geo.position.accuracy)}m.`
          : `Outside geofence at ${locLabel} — ${geofenceResult.distanceFormatted} from school. Accuracy: ${Math.round(geo.position.accuracy)}m.`;
      } else {
        gpsData.geoVerificationNote = `Location: ${locLabel}. School has no GPS coordinates configured.`;
      }
    } else if (geo.error) {
      gpsData.geoVerificationNote = `GPS error: ${geo.error}`;
    }
    return gpsData;
  };

  const handleSaveDraft = async () => {
    if (isCurrentSlotSubmitted) { toast.error("This assessment slot is already submitted."); return; }
    setSavingDraft(true);
    try {
      const payload = { 
        id: activeDraft?.id, 
        studentId: student.id, 
        lecturerId, 
        status: "DRAFT", 
        assessmentNumber: parseInt(currentAssnNum),
        subject: currentSubject,
        checkInTime: checkInTime?.toISOString(), 
        ...marks, ...comments, ...buildGPSData() 
      };
      await submitAssessment(payload);
      toast.success("Draft saved!");
      router.refresh();
    } catch (e: any) { toast.error(e.message || "Failed to save draft"); }
    finally { setSavingDraft(false); }
  };

  const handleSubmit = async () => {
    if (isCurrentSlotSubmitted) { toast.error("This assessment slot is already submitted."); return; }
    if (totalMarks > 100) { toast.error("Total marks cannot exceed 100"); return; }
    if (schoolHasGPS && geofenceResult && !geofenceResult.isInside) {
      toast.error(`You must be physically present at the assigned school. (${student.schoolGeofenceRadius}m radius)`);
      return;
    }
    if (schoolHasGPS && !isCheckedIn) { toast.error("Please click 'Check In' to verify your location."); return; }

    setLoading(true);
    try {
      const payload = { 
        id: activeDraft?.id, 
        studentId: student.id, 
        lecturerId, 
        status: "REVIEWED", 
        assessmentNumber: parseInt(currentAssnNum),
        subject: currentSubject,
        checkInTime: checkInTime?.toISOString() || new Date().toISOString(), 
        ...marks, ...comments, ...buildGPSData() 
      };
      const res = await submitAssessment(payload);
      if (res.success) { 
        toast.success(`Assessment submitted!`); 
        router.push(`/lecturer/assessments/${res.id}`); 
      }
    } catch (e: any) { toast.error(e.message || "Failed to submit"); }
    finally { setLoading(false); }
  };

  const InputRow = ({ label, name, max, disabled }: { label: string; name: string; max: number; disabled?: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
      <Label htmlFor={name} className="flex-1 font-normal text-xs sm:text-sm">{label} <span className="text-muted-foreground">(Max {max})</span></Label>
      <div className="w-20 sm:w-24">
        <Input id={name} name={name} type="number" min="0" max={max} value={(marks as any)[name] || ""} onChange={(e) => handleChange(e, max)} className="text-center font-mono" disabled={disabled} />
      </div>
    </div>
  );

  // ── Step tracker items (A1S1, A1S2, A2S1, A2S2) ──
  const slots = [
      { id: '1', num: 1, sub: s1, label: 'A1S1' },
      { id: '2', num: 1, sub: s2, label: 'A1S2' },
      { id: '3', num: 2, sub: s1, label: 'A2S1' },
      { id: '4', num: 2, sub: s2, label: 'A2S2' }
  ];

  const slotStatus = slots.map((slot, index) => {
      const existing = submitted.find(a => a.assessmentNumber === slot.num && a.subject === slot.sub);
      const isDraft = existingAssessments.find(a => a.status === "DRAFT" && a.assessmentNumber === slot.num && a.subject === slot.sub);
      
      if (existing) return { ...slot, state: "completed" as const, score: existing.totalMarks, grade: existing.grade, dbId: existing.id, isDraft: false };
      
      // Active if it matches current selection
      if (currentAssnNum === slot.num.toString() && currentSubject === slot.sub) {
          return { ...slot, state: "active" as const, score: null, grade: null, dbId: isDraft?.id || null, isDraft: !!isDraft };
      }
      
      return { ...slot, state: "pending" as const, score: null, grade: null, dbId: null, isDraft: !!isDraft };
  });

  return (
    <div className="space-y-6 w-[90%] mx-auto pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="sm" className="mb-2"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      </div>

      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Assess Student</h1>
        <p className="text-muted-foreground mt-1 font-medium text-sm">Tom Mboya University Teaching Practice Rubric for {student.name}.</p>
      </div>

      {/* Student info bar */}
      <div className="bg-primary/5 p-3 sm:p-4 rounded-2xl border border-primary/20 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div><span className="font-semibold text-muted-foreground">Student:</span> {student.name}</div>
        <div><span className="font-semibold text-muted-foreground">Adm No:</span> {student.admissionNumber}</div>
        <div><span className="font-semibold text-muted-foreground">Course:</span> {student.course}</div>
      </div>

      {/* ── 4-SLOT ASSESSMENT TRACKER ── */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Assessment Progression</CardTitle>
          <CardDescription className="text-xs">Each student requires 4 assessments (First & Second Assessment for two subjects).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {slotStatus.map((step, i) => (
              <button
                key={step.id}
                onClick={() => {
                    if (step.state === "completed") {
                        setViewingIdx(viewingIdx === i ? null : i);
                    } else {
                        setCurrentAssnNum(step.num.toString());
                        setCurrentSubject(step.sub);
                        setViewingIdx(null);
                    }
                }}
                className={`flex-1 flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                  step.state === "completed" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 hover:shadow-md" :
                  step.state === "active" ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm" :
                  "border-border/40 bg-muted/30 hover:bg-muted/50"
                }`}
              >
                {step.state === "completed" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> :
                 step.state === "active" ? <Circle className="h-5 w-5 text-primary" /> :
                 <Circle className="h-5 w-5 text-muted-foreground/50" />}
                <span className="text-xs font-bold">{step.label}</span>
                <span className="text-[9px] truncate max-w-full text-muted-foreground" title={step.sub}>{step.sub}</span>
                {step.state === "completed" && <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{step.score}/100 ({step.grade})</span>}
                {step.state === "active" && <span className="text-[10px] font-semibold text-primary">{step.isDraft ? "Draft" : "Assessing"}</span>}
                {step.state === "pending" && <span className="text-[10px] text-muted-foreground">{step.isDraft ? "Draft saved" : "Pending"}</span>}
              </button>
            ))}
          </div>

          {/* Viewing a completed assessment inline */}
          {viewingIdx !== null && slotStatus[viewingIdx]?.state === "completed" && (
            <div className="mt-4 p-4 rounded-xl bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">{slotStatus[viewingIdx].label}: Assessment {slotStatus[viewingIdx].num} — {slotStatus[viewingIdx].sub}</h4>
                <Button variant="ghost" size="sm" onClick={() => setViewingIdx(null)}><ChevronUp className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Score: {slotStatus[viewingIdx].score}/100 ({slotStatus[viewingIdx].grade})</p>
              <Link href={`/lecturer/assessments/${slotStatus[viewingIdx].dbId}`}>
                <Button variant="outline" size="sm" className="mt-2"><Eye className="h-4 w-4 mr-2" /> View Full Report</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ALL DONE STATE ── */}
      {allDone ? (
        <Card className="border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-4" />
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">All 4 Assessments Completed</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              General Average: <span className="font-bold text-foreground">{Math.round(submitted.reduce((s, a) => s + a.totalMarks, 0) / 4)}/100</span>
            </p>
            <Button variant="outline" className="mt-6" onClick={() => router.push("/lecturer/students")}>← Back to Students</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Assessment Selection & Label */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
              <div className="flex-1 space-y-1">
                  <Label className="text-xs text-primary font-bold uppercase tracking-wider">Assessment Number</Label>
                  <Select value={currentAssnNum} onValueChange={(val) => setCurrentAssnNum(val || "1")} disabled={isCurrentSlotSubmitted}>
                      <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Assessment" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="1">First Assessment</SelectItem>
                          <SelectItem value="2">Second Assessment</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="flex-1 space-y-1">
                  <Label className="text-xs text-primary font-bold uppercase tracking-wider">Subject</Label>
                  <Select value={currentSubject} onValueChange={(val) => setCurrentSubject(val || "")} disabled={isCurrentSlotSubmitted}>
                      <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                          {subjects.map((sub: string) => (
                              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
          </div>
          
          {isCurrentSlotSubmitted && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                      <p className="font-semibold text-sm">This assessment is already submitted.</p>
                      <p className="text-xs mt-1">Select a pending slot above to continue assessing.</p>
                  </div>
              </div>
          )}

          {!isCurrentSlotSubmitted && (
            <>
              {/* ── GPS / Geofence ── */}
              <Card className="border-2 border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Location Verification</CardTitle>
                  <CardDescription className="text-xs">Your GPS location is recorded for accountability and audit purposes.</CardDescription>
                </CardHeader>
                <CardContent>
                  {geo.loading ? (
                    <div className="flex items-center gap-3 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Acquiring GPS signal...</span></div>
                  ) : geo.error ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-amber-600"><WifiOff className="h-4 w-4" /><div><p className="text-sm font-medium">GPS Unavailable</p><p className="text-xs text-muted-foreground mt-0.5">{geo.error}</p></div></div>
                      <Button variant="outline" size="sm" onClick={geo.refresh}><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry</Button>
                    </div>
                  ) : geo.position ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{geo.position.locationName || "Resolving..."}</span>
                          <span className="text-[10px] font-mono">({geo.position.latitude.toFixed(4)}, {geo.position.longitude.toFixed(4)}) ±{Math.round(geo.position.accuracy)}m</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={geo.refresh} className="h-7 px-2"><RefreshCw className="h-3 w-3" /></Button>
                      </div>
                      {schoolHasGPS && geofenceResult ? (
                        geofenceResult.isInside ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                              <div><p className="text-sm font-semibold">Location Verified</p><p className="text-xs opacity-80 mt-0.5">You are {geofenceResult.distanceFormatted} from {student.schoolName}.</p></div>
                            </div>
                            {!isCheckedIn ? (
                              <Button onClick={() => { setIsCheckedIn(true); setCheckInTime(new Date()); toast.success("Checked in!"); }} className="w-full sm:w-auto"><MapPin className="h-4 w-4 mr-2" /> Check In</Button>
                            ) : (
                              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Checked in at: {checkInTime?.toLocaleTimeString()}</div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                            <div><p className="text-sm font-semibold">Outside School Geofence</p><p className="text-xs opacity-80 mt-0.5">You are {geofenceResult.distanceFormatted} away. You must be physically present.</p></div>
                          </div>
                        )
                      ) : !schoolHasGPS ? (
                        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800">
                          <MapPin className="h-5 w-5 flex-shrink-0" />
                          <div><p className="text-sm font-semibold">GPS Captured</p><p className="text-xs opacity-80 mt-0.5">School GPS not configured. Your location is still recorded.</p></div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* ── RUBRIC FORM ── */}
              <Accordion defaultValue={["preparation"]} className="w-full space-y-4">
                
                {/* A. Preparation */}
                <AccordionItem value="preparation" className="border rounded-xl bg-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                    <div className="text-left w-full flex items-center justify-between pr-4">
                      <div>
                        <h3 className="font-semibold text-lg">A. Preparation (12 Marks)</h3>
                        <p className="text-sm font-normal text-muted-foreground mt-1">Scheme of work and lesson planning.</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <InputRow label="Scheme of Work" name="schemeOfWorkMark" max={2} />
                    <InputRow label="Lesson Plan: Objectives" name="lessonPlanObjectives" max={4} />
                    <InputRow label="Lesson Plan: Activities" name="lessonPlanActivities" max={2} />
                    <InputRow label="Lesson Plan: Sequence" name="lessonPlanSequence" max={4} />
                  </AccordionContent>
                </AccordionItem>

                {/* B. Presentation */}
                <AccordionItem value="presentation" className="border rounded-xl bg-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                    <div className="text-left w-full flex items-center justify-between pr-4">
                      <div>
                        <h3 className="font-semibold text-lg">B. Presentation (80 Marks)</h3>
                        <p className="text-sm font-normal text-muted-foreground mt-1">Introduction, development, communication, and management.</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 space-y-8">
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">1. Introduction (5)</h4><InputRow label="Set Induction Skills" name="introductionMark" max={5} /></div>
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">2. Lesson Development (30)</h4>
                      <InputRow label="Logical Presentations" name="logicalPresentation" max={5} />
                      <InputRow label="Relevance of Content" name="contentRelevance" max={5} />
                      <InputRow label="Adequacy of Content" name="contentAdequacy" max={5} />
                      <InputRow label="Teaching Strategies" name="teachingStrategies" max={5} />
                      <InputRow label="Teaching Skills" name="teachingSkills" max={5} />
                      <InputRow label="Mastery of Content" name="contentMastery" max={5} />
                    </div>
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">3. Communication (5)</h4><InputRow label="Verbal & Non-verbal" name="communicationMark" max={5} /></div>
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">4. Resource Materials (15)</h4>
                      <InputRow label="Chalkboard Layout & Use" name="chalkboardUse" max={3} />
                      <InputRow label="Timing and Attractiveness" name="resourceTiming" max={3} />
                      <InputRow label="Appropriateness" name="resourceAppropriateness" max={4} />
                      <InputRow label="Innovativeness" name="resourceInnovativeness" max={5} />
                    </div>
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">5. Classroom Management (20)</h4>
                      <InputRow label="Control of Learners" name="learnerControl" max={5} />
                      <InputRow label="Learner Participation" name="learnerParticipation" max={5} />
                      <InputRow label="Group Work / Individual Diff." name="groupWork" max={4} />
                      <InputRow label="Teacher/Learner Rapport" name="teacherLearnerRapport" max={5} />
                    </div>
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">6. Conclusion (5)</h4>
                      <InputRow label="Closure Skills" name="closureSkills" max={2} />
                      <InputRow label="Concluding Activities" name="concludingActivities" max={2} />
                      <InputRow label="Assignment" name="assignmentMark" max={1} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* C & D. Personality and Appraisal */}
                <AccordionItem value="personality-appraisal" className="border rounded-xl bg-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                    <div className="text-left w-full flex items-center justify-between pr-4">
                      <div>
                        <h3 className="font-semibold text-lg">C & D. Personality & Appraisal (8 Marks)</h3>
                        <p className="text-sm font-normal text-muted-foreground mt-1">Teacher traits and self-appraisal.</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">C. Teacher Personality (5)</h4><InputRow label="Confidence, Dressing, Mannerisms" name="personalityMark" max={5} /></div>
                    <div><h4 className="font-bold text-sm mb-3 bg-muted/50 p-2 rounded-lg">D. Self Appraisal (3)</h4><InputRow label="Use of Previous Comments" name="selfAppraisalMark" max={3} /></div>
                  </AccordionContent>
                </AccordionItem>

                {/* Evaluator Comments */}
                <AccordionItem value="comments" className="border rounded-xl bg-primary/5 overflow-hidden border-primary/20">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10">
                    <div className="text-left w-full flex items-center justify-between pr-4">
                      <div>
                        <h3 className="font-semibold text-lg text-primary">Evaluator Comments</h3>
                        <p className="text-sm font-normal text-primary/70 mt-1">Qualitative feedback on performance.</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                    <div className="space-y-2"><Label>Areas of Strength</Label><Textarea value={comments.areasOfStrength} onChange={(e) => setComments({...comments, areasOfStrength: e.target.value})} placeholder="E.g., Excellent classroom presence..." rows={3} /></div>
                    <div className="space-y-2"><Label>Areas of Improvement</Label><Textarea value={comments.areasOfImprovement} onChange={(e) => setComments({...comments, areasOfImprovement: e.target.value})} placeholder="E.g., Needs better time management..." rows={3} /></div>
                    <div className="space-y-2"><Label>General Comments</Label><Textarea value={comments.generalComments} onChange={(e) => setComments({...comments, generalComments: e.target.value})} placeholder="Overall feedback..." rows={4} /></div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>

              {/* ── Sticky Submit Bar ── */}
              <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-3 sm:p-4 -mx-6 px-4 sm:-mx-8 sm:px-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
                <div>
                  <p className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">Assessing: A{currentAssnNum} — {currentSubject}</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${totalMarks >= 70 ? "text-emerald-600" : totalMarks < 40 ? "text-red-500" : "text-primary"}`}>
                    {totalMarks} <span className="text-lg sm:text-xl text-muted-foreground font-normal">/ 100</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {geo.position && geofenceResult && (
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${geofenceResult.isInside ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"}`}>
                      {geofenceResult.isInside ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                      {geofenceResult.distanceFormatted}
                    </div>
                  )}
                  <Button variant="outline" onClick={handleSaveDraft} disabled={savingDraft} className="flex-1 sm:flex-none rounded-xl">
                    {savingDraft ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Draft
                  </Button>
                  <Button size="lg" onClick={handleSubmit} disabled={loading} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm font-semibold">
                    {loading ? "Submitting..." : `Submit Assessment`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
