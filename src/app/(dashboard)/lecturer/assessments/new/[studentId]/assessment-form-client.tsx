"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Using standard controlled inputs to make the total calculation trivial.
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { submitAssessment } from "../../../_actions/assessments";

export function AssessmentFormClient({ student, lecturerId }: { student: any; lecturerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const payload = {
        studentId: student.id,
        lecturerId,
        ...marks,
        ...comments
      };
      
      const res = await submitAssessment(payload);
      if (res.success) {
        toast.success("Assessment submitted successfully!");
        router.push(`/lecturer/assessments/${res.id}`); // redirect to view the PDF
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

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-4 -mx-6 px-6 sm:-mx-8 sm:px-8 mt-8 flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Total Score</p>
          <p className={`text-3xl font-bold ${totalMarks >= 70 ? "text-emerald-600" : totalMarks < 40 ? "text-red-500" : "text-primary"}`}>
            {totalMarks} <span className="text-xl text-muted-foreground font-normal">/ 100</span>
          </p>
        </div>
        <Button size="lg" onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm font-semibold">
          {loading ? "Submitting..." : <><Save className="h-4 w-4 mr-2" /> Submit Final Assessment</>}
        </Button>
      </div>
    </div>
  );
}
