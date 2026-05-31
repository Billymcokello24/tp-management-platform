"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Send, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { saveLessonPlan } from "../../_actions/lesson-plans";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LessonStep {
  id: string;
  teacherActivity: string;
  learnerActivity: string;
  resources: string;
  time: string;
}

export function BuilderClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    subject: "", classForm: "", stream: "", topic: "", subTopic: "", date: "", startTime: "", endTime: "", duration: ""
  });
  
  const [content, setContent] = useState({
    objectives: "", introduction: "", conclusion: "", assessment: "", assignment: "", reflection: "", resources: ""
  });

  const [methods, setMethods] = useState<string[]>([]);
  const methodOptions = ["Discussion", "Demonstration", "Question & Answer", "Group Work", "Lecture Method", "Problem Solving", "Experiment", "Field Work"];

  const [steps, setSteps] = useState<LessonStep[]>([
    { id: "1", teacherActivity: "", learnerActivity: "", resources: "", time: "" }
  ]);

  const toggleMethod = (method: string) => {
    if (methods.includes(method)) setMethods(methods.filter(m => m !== method));
    else setMethods([...methods, method]);
  };

  const addStep = () => {
    setSteps([...steps, { id: Math.random().toString(36).substring(7), teacherActivity: "", learnerActivity: "", resources: "", time: "" }]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof LessonStep, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (status: "DRAFT" | "SUBMITTED") => {
    // Basic validation if submitting
    if (status === "SUBMITTED") {
      if (!basicInfo.subject || !basicInfo.topic || !basicInfo.date) {
        toast.error("Please fill in the essential Basic Information (Subject, Topic, Date) before submitting.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...basicInfo,
        ...content,
        methods,
        developmentSteps: steps,
        status,
      };
      
      const res = await saveLessonPlan(payload);
      if (res.success) {
        toast.success(status === "DRAFT" ? "Draft saved successfully!" : "Lesson plan submitted!");
        router.push("/student/lesson-plans");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save lesson plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="sm" className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Lesson Plan Builder</h1>
        <p className="text-muted-foreground mt-1 font-medium">Create a professional digital lesson plan.</p>
      </div>

      <Accordion defaultValue={["basic-info"]} className="w-full space-y-4">
        {/* Basic Info */}
        <AccordionItem value="basic-info" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
            <div className="text-left">
              <h3 className="font-semibold text-lg">1. Basic Information</h3>
              <p className="text-sm font-normal text-muted-foreground mt-1">Class details, date, and time.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="e.g. Mathematics" value={basicInfo.subject} onChange={e => setBasicInfo({...basicInfo, subject: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Class / Grade</Label>
                <Input placeholder="e.g. Form 3" value={basicInfo.classForm} onChange={e => setBasicInfo({...basicInfo, classForm: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Stream</Label>
                <Input placeholder="e.g. East" value={basicInfo.stream} onChange={e => setBasicInfo({...basicInfo, stream: e.target.value})} />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Strand / Topics</Label>
                <Input placeholder="e.g. Algebra" value={basicInfo.topic} onChange={e => setBasicInfo({...basicInfo, topic: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Sub Strand</Label>
                <Input placeholder="e.g. Linear Equations" value={basicInfo.subTopic} onChange={e => setBasicInfo({...basicInfo, subTopic: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={basicInfo.date} onChange={e => setBasicInfo({...basicInfo, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Start & End Time</Label>
                <div className="flex gap-2">
                  <Input type="time" value={basicInfo.startTime} onChange={e => setBasicInfo({...basicInfo, startTime: e.target.value})} />
                  <Input type="time" value={basicInfo.endTime} onChange={e => setBasicInfo({...basicInfo, endTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input placeholder="e.g. 40 mins" value={basicInfo.duration} onChange={e => setBasicInfo({...basicInfo, duration: e.target.value})} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Objectives & Intro */}
        <AccordionItem value="objectives-intro" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
            <div className="text-left">
              <h3 className="font-semibold text-lg">2. Outcomes & Introduction</h3>
              <p className="text-sm font-normal text-muted-foreground mt-1">What learners will achieve and how the lesson starts.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Expected learning outcomes</Label>
              <p className="text-sm text-muted-foreground">What should the learners be able to do by the end of the lesson?</p>
              <Textarea 
                placeholder="1. Define...&#10;2. Explain...&#10;3. Calculate..." 
                rows={4}
                value={content.objectives}
                onChange={e => setContent({...content, objectives: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Introduction (Set Induction)</Label>
              <p className="text-sm text-muted-foreground">How will you introduce the topic and activate prior knowledge?</p>
              <Textarea 
                placeholder="Review previous lesson by asking learners to..." 
                rows={3}
                value={content.introduction}
                onChange={e => setContent({...content, introduction: e.target.value})}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Lesson Development */}
        <AccordionItem value="development" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
            <div className="text-left flex items-center justify-between w-full pr-4">
              <div>
                <h3 className="font-semibold text-lg">3. Lesson Development</h3>
                <p className="text-sm font-normal text-muted-foreground mt-1">The main teaching process step-by-step.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground px-2">
              <div className="col-span-4">Teacher Activity</div>
              <div className="col-span-4">Learner Activity</div>
              <div className="col-span-2">Resources</div>
              <div className="col-span-1">Time</div>
              <div className="col-span-1 text-center">Del</div>
            </div>
            
            {steps.map((step, index) => (
              <div key={step.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-muted/30 p-4 md:p-2 rounded-lg border md:border-0 md:bg-transparent">
                <div className="space-y-2 md:col-span-4 md:space-y-0">
                  <Label className="md:hidden">Teacher Activity</Label>
                  <Textarea placeholder="Explains the formula..." rows={3} value={step.teacherActivity} onChange={(e) => updateStep(step.id, 'teacherActivity', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-4 md:space-y-0">
                  <Label className="md:hidden">Learner Activity</Label>
                  <Textarea placeholder="Listen and take notes..." rows={3} value={step.learnerActivity} onChange={(e) => updateStep(step.id, 'learnerActivity', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2 md:space-y-0">
                  <Label className="md:hidden">Resources</Label>
                  <Input placeholder="Chalkboard" value={step.resources} onChange={(e) => updateStep(step.id, 'resources', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-1 md:space-y-0">
                  <Label className="md:hidden">Time</Label>
                  <Input placeholder="10m" value={step.time} onChange={(e) => updateStep(step.id, 'time', e.target.value)} />
                </div>
                <div className="md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                  <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50" disabled={steps.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addStep} size="sm" variant="outline" className="w-full mt-4 border-dashed"><Plus className="h-4 w-4 mr-2" /> Add Lesson Step</Button>
          </AccordionContent>
        </AccordionItem>

        {/* Methods & Resources */}
        <AccordionItem value="methods-resources" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
            <div className="text-left">
              <h3 className="font-semibold text-lg">4. Methods & Resources</h3>
              <p className="text-sm font-normal text-muted-foreground mt-1">Teaching strategies and learning materials.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Teaching Methods</Label>
              <div className="flex flex-wrap gap-2">
                {methodOptions.map(method => (
                  <Badge 
                    key={method} 
                    variant={methods.includes(method) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm ${methods.includes(method) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => toggleMethod(method)}
                  >
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Learning Resources</Label>
              <Textarea placeholder="Textbook page 45, projector..." rows={3} value={content.resources} onChange={e => setContent({...content, resources: e.target.value})} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Assessment & Conclusion */}
        <AccordionItem value="assessment-conclusion" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
            <div className="text-left">
              <h3 className="font-semibold text-lg">5. Assessment & Conclusion</h3>
              <p className="text-sm font-normal text-muted-foreground mt-1">How you evaluate learning and end the lesson.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Assessment Methods</Label>
              <Textarea placeholder="Oral questions, exercise..." rows={3} value={content.assessment} onChange={e => setContent({...content, assessment: e.target.value})} />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Conclusion / Summary</Label>
              <Textarea placeholder="Teacher summarizes key points..." rows={3} value={content.conclusion} onChange={e => setContent({...content, conclusion: e.target.value})} />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Assignment / Homework</Label>
              <Textarea placeholder="Solve questions 1-5..." rows={2} value={content.assignment} onChange={e => setContent({...content, assignment: e.target.value})} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Self Reflection */}
        <AccordionItem value="reflection" className="border rounded-xl bg-primary/5 overflow-hidden border-primary/20">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10">
            <div className="text-left">
              <h3 className="font-semibold text-lg text-primary">6. Self Reflection</h3>
              <p className="text-sm font-normal text-primary/70 mt-1">To be filled AFTER the lesson has been taught.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <Textarea placeholder="What went well? What challenges were faced?" rows={4} value={content.reflection} onChange={e => setContent({...content, reflection: e.target.value})} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 sm:left-64 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex items-center justify-end gap-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Button variant="outline" size="lg" onClick={() => handleSubmit("DRAFT")} disabled={loading}>
          <Save className="h-4 w-4 mr-2" /> Save Draft
        </Button>
        <Button size="lg" onClick={() => handleSubmit("SUBMITTED")} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
          <Send className="h-4 w-4 mr-2" /> Submit Lesson Plan
        </Button>
      </div>
    </div>
  );
}
