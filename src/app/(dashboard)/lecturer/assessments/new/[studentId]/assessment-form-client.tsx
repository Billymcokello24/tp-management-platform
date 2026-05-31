"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ArrowLeft, MapPin, Loader2, ShieldCheck, ShieldAlert, RefreshCw, WifiOff } from "lucide-react";
import { submitAssessment } from "../../../_actions/assessments";
import { useGeolocation } from "@/hooks/use-geolocation";
import { checkGeofence } from "@/lib/geofence";

export function AssessmentFormClient({ student, lecturerId }: { student: any; lecturerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const geo = useGeolocation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  // Determine geofence status
  const schoolHasGPS = student.schoolLatitude !== null && student.schoolLongitude !== null;
  const geofenceResult = (schoolHasGPS && geo.position)
    ? checkGeofence(
        geo.position.latitude,
        geo.position.longitude,
        student.schoolLatitude,
        student.schoolLongitude,
        student.schoolGeofenceRadius
      )
    : null;

  const canAssess = schoolHasGPS && geofenceResult?.isInside;

  const [marks, setMarks] = useState({
    schemeOfWorkMark: 0,
    lessonPlanObjectives: 0,
    lessonPlanActivities: 0,
    lessonPlanSequence: 0,
    introductionMark: 0,
    logicalPresentation: 0,
    contentRelevance: 0,
    contentAdequacy: 0,
    teachingStrategies: 0,
    teachingSkills: 0,
    contentMastery: 0,
    communicationMark: 0,
    chalkboardUse: 0,
    resourceTiming: 0,
    resourceAppropriateness: 0,
    resourceInnovativeness: 0,
    learnerControl: 0,
    learnerParticipation: 0,
    groupWork: 0,
    teacherLearnerRapport: 0,
    closureSkills: 0,
    concludingActivities: 0,
    assignmentMark: 0,
    personalityMark: 0,
    selfAppraisalMark: 0,
  });

  const [comments, setComments] = useState({
    areasOfStrength: "",
    areasOfImprovement: "",
    generalComments: "",
  });

  const totalMarks = Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, max: number) => {
    let val = parseInt(e.target.value) || 0;
    if (val > max) val = max; // Enforce max constraints
    if (val < 0) val = 0;
    setMarks({ ...marks, [e.target.name]: val });
  };

  const handleSubmit = async () => {
    if (totalMarks > 100) {
      toast.error("Total marks cannot exceed 100");
      return;
    }

    // Build GPS verification data
    let gpsData: {
      submissionLatitude?: number;
      submissionLongitude?: number;
      isGeoVerified: boolean;
      geoVerificationNote: string;
    } = {
      isGeoVerified: false,
      geoVerificationNote: "No GPS data available",
    };

    if (geo.position) {
      gpsData.submissionLatitude = geo.position.latitude;
      gpsData.submissionLongitude = geo.position.longitude;

      const locLabel = geo.position.locationName || `${geo.position.latitude.toFixed(5)}, ${geo.position.longitude.toFixed(5)}`;

      if (geofenceResult) {
        gpsData.isGeoVerified = geofenceResult.isInside;
        gpsData.geoVerificationNote = geofenceResult.isInside
          ? `Verified at ${locLabel} — ${geofenceResult.distanceFormatted} from school (within ${student.schoolGeofenceRadius}m radius). Accuracy: ${Math.round(geo.position.accuracy)}m.`
          : `Outside geofence at ${locLabel} — ${geofenceResult.distanceFormatted} from school (${student.schoolGeofenceRadius}m radius). Accuracy: ${Math.round(geo.position.accuracy)}m.`;
      } else {
        gpsData.geoVerificationNote = `Location: ${locLabel}. School has no GPS coordinates configured.`;
      }
    } else if (geo.error) {
      gpsData.geoVerificationNote = `GPS error: ${geo.error}`;
    }

    // STRICT GEOFENCE LOCK
    if (schoolHasGPS && geofenceResult && !geofenceResult.isInside) {
      toast.error(`You must be physically present at the assigned school before submitting this assessment. (${student.schoolGeofenceRadius}m radius)`);
      return;
    }
    
    if (schoolHasGPS && !isCheckedIn) {
      toast.error("Please click 'Check In' to verify your location before assessing.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        studentId: student.id,
        lecturerId,
        checkInTime: checkInTime ? checkInTime.toISOString() : new Date().toISOString(),
        ...marks,
        ...comments,
        ...gpsData,
      };
      
      const res = await submitAssessment(payload);
      if (res.success) {
        toast.success("Assessment submitted successfully!");
        router.push(`/lecturer/assessments/${res.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit assessment");
    } finally {
      setLoading(false);
    }
  };

  const InputRow = ({ label, name, max }: { label: string, name: string, max: number }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
      <Label htmlFor={name} className="flex-1 font-normal">{label} (Max {max})</Label>
      <div className="w-24 flex items-center gap-2">
        <Input 
          id={name}
          name={name}
          type="number"
          min="0"
          max={max}
          value={(marks as any)[name] || ""}
          onChange={(e) => handleChange(e, max)}
          className="text-center font-mono"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="sm" className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Assess Student</h1>
        <p className="text-muted-foreground mt-1 font-medium">Complete the Tom Mboya Teaching Practice Rubric for {student.name}.</p>
      </div>

      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex flex-wrap gap-x-8 gap-y-2">
        <div><span className="font-semibold text-muted-foreground text-sm">Student:</span> {student.name}</div>
        <div><span className="font-semibold text-muted-foreground text-sm">Adm No:</span> {student.admissionNumber}</div>
        <div><span className="font-semibold text-muted-foreground text-sm">Course:</span> {student.course}</div>
      </div>

      {/* ── GPS / Geofence Status Card ── */}
      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Verification
          </CardTitle>
          <CardDescription className="text-xs">
            Your GPS location is recorded for accountability and audit purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {geo.loading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Acquiring GPS signal...</span>
            </div>
          ) : geo.error ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-600">
                <WifiOff className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">GPS Unavailable</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{geo.error}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={geo.refresh}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : geo.position ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{geo.position.locationName || "Resolving location..."}</span>
                  <span className="text-[10px] font-mono ml-1">({geo.position.latitude.toFixed(4)}, {geo.position.longitude.toFixed(4)}) ±{Math.round(geo.position.accuracy)}m</span>
                </div>
                <Button variant="ghost" size="sm" onClick={geo.refresh} className="h-7 px-2">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>

                {schoolHasGPS && geofenceResult ? (
                  geofenceResult.isInside ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Location Verified</p>
                          <p className="text-xs opacity-80 mt-0.5">You are {geofenceResult.distanceFormatted} from {student.schoolName} (within {student.schoolGeofenceRadius}m radius).</p>
                        </div>
                      </div>
                      
                      {!isCheckedIn ? (
                        <Button 
                          onClick={() => {
                            setIsCheckedIn(true);
                            setCheckInTime(new Date());
                            toast.success("Successfully checked in at the school.");
                          }}
                          className="w-full sm:w-auto"
                        >
                          <MapPin className="h-4 w-4 mr-2" /> Check In
                        </Button>
                      ) : (
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Checked in at: {checkInTime?.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                      <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">Outside School Geofence</p>
                        <p className="text-xs opacity-80 mt-0.5">You are {geofenceResult.distanceFormatted} away from {student.schoolName}. You must be physically present at the assigned school before submitting this assessment.</p>
                      </div>
                    </div>
                  )
              ) : !schoolHasGPS ? (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">GPS Captured</p>
                    <p className="text-xs opacity-80 mt-0.5">School GPS coordinates not yet configured. Your location is still recorded for records.</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="transition-all duration-300">
        <Card>
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>A. Preparation (12 Marks)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <InputRow label="Scheme of Work" name="schemeOfWorkMark" max={2} />
          <InputRow label="Lesson Plan: Objectives" name="lessonPlanObjectives" max={4} />
          <InputRow label="Lesson Plan: Activities" name="lessonPlanActivities" max={2} />
          <InputRow label="Lesson Plan: Sequence" name="lessonPlanSequence" max={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>B. Presentation (80 Marks)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">1. Introduction (5)</h4>
            <InputRow label="Set Induction Skills" name="introductionMark" max={5} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">2. Lesson Development (30)</h4>
            <InputRow label="Logical Presentations of Contents" name="logicalPresentation" max={5} />
            <InputRow label="Relevance of Content" name="contentRelevance" max={5} />
            <InputRow label="Adequacy of Content to Time" name="contentAdequacy" max={5} />
            <InputRow label="Teaching Strategies & Methods" name="teachingStrategies" max={5} />
            <InputRow label="Teaching Skills (Motivation, Questioning)" name="teachingSkills" max={5} />
            <InputRow label="Mastery of Content" name="contentMastery" max={5} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">3. Communication (5)</h4>
            <InputRow label="Verbal & Non-verbal Communication" name="communicationMark" max={5} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">4. Resource Materials (15)</h4>
            <InputRow label="Chalkboard Layout & Use" name="chalkboardUse" max={3} />
            <InputRow label="Timing and Attractiveness" name="resourceTiming" max={3} />
            <InputRow label="Appropriateness" name="resourceAppropriateness" max={4} />
            <InputRow label="Innovativeness & Originality" name="resourceInnovativeness" max={5} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">5. Classroom Management (20)</h4>
            <InputRow label="Control and Knowledge of Learners" name="learnerControl" max={5} />
            <InputRow label="Learner Participation" name="learnerParticipation" max={5} />
            <InputRow label="Group Work / Individual Differences" name="groupWork" max={4} />
            <InputRow label="Teacher/Learner Rapport" name="teacherLearnerRapport" max={5} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">6. Conclusion (5)</h4>
            <InputRow label="Closure Skills (Review, Questions)" name="closureSkills" max={2} />
            <InputRow label="Concluding Activities (Evaluation)" name="concludingActivities" max={2} />
            <InputRow label="Assignment" name="assignmentMark" max={1} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>C. Teacher Personality (5 Marks)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <InputRow label="Confidence, Dressing, Mannerisms" name="personalityMark" max={5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>D. Self Appraisal (3 Marks)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <InputRow label="Use of Previous Comments" name="selfAppraisalMark" max={3} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Evaluator Comments</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Areas of Strength</Label>
            <Textarea 
              value={comments.areasOfStrength}
              onChange={(e) => setComments({...comments, areasOfStrength: e.target.value})}
              placeholder="E.g., Excellent classroom presence..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Areas of Improvement</Label>
            <Textarea 
              value={comments.areasOfImprovement}
              onChange={(e) => setComments({...comments, areasOfImprovement: e.target.value})}
              placeholder="E.g., Needs to manage time better during group work..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>General Comments</Label>
            <Textarea 
              value={comments.generalComments}
              onChange={(e) => setComments({...comments, generalComments: e.target.value})}
              placeholder="Overall feedback..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-4 -mx-6 px-6 sm:-mx-8 sm:px-8 mt-8 flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Total Score</p>
          <p className={`text-3xl font-bold ${totalMarks >= 70 ? "text-emerald-600" : totalMarks < 40 ? "text-red-500" : "text-primary"}`}>
            {totalMarks} <span className="text-xl text-muted-foreground font-normal">/ 100</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Geofence micro-badge in the submit bar */}
          {geo.position && geofenceResult && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              geofenceResult.isInside 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            }`}>
              {geofenceResult.isInside ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {geofenceResult.distanceFormatted}
            </div>
          )}
          <Button size="lg" onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm font-semibold">
            {loading ? "Submitting..." : <><Save className="h-4 w-4 mr-2" /> Submit Final Assessment</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
