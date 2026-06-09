"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { LessonPlanDetailClient } from "../../../student/lesson-plans/[id]/lesson-plan-detail-client";
import { reviewLessonPlan } from "../../_actions/lesson-plans";

export function LecturerLessonPlanApprovalClient({ plan }: { plan: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(plan.reviewComment || "");

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      await reviewLessonPlan(plan.id, status, comment);
      toast.success(`Lesson plan ${status.toLowerCase()} successfully`);
      router.push("/lecturer/lesson-plans");
    } catch (e: any) {
      toast.error(e.message || "Failed to update lesson plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <LessonPlanDetailClient plan={plan} />
      
      <div className="max-w-5xl mx-auto">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Supervisor Review
            </CardTitle>
            <CardDescription>Leave remarks and approve or reject this lesson plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Supervisor Remarks</Label>
              <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Enter feedback for the student..." 
                rows={4} 
                className="bg-background"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={() => handleReview("REJECTED")} 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                Reject Plan
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={() => handleReview("APPROVED")} 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Approve Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
