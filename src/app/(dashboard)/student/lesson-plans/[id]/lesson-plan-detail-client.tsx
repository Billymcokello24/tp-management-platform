"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function LessonPlanDetailClient({ plan }: { plan: any }) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Non-printable header */}
      <div className="flex items-center justify-between no-print mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lesson Plans
        </Button>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
          <Printer className="h-4 w-4 mr-2" /> Print / Save as PDF
        </Button>
      </div>

      {/* The Printable Document */}
      <div className="print-container bg-white text-black p-8 sm:p-12 min-h-[1056px] border border-slate-200 shadow-sm mx-auto max-w-4xl font-serif">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Tom Mboya University</h1>
          <h2 className="text-lg font-semibold uppercase">Teaching Practice Lesson Plan</h2>
        </div>

        {/* Basic Info Table */}
        <table className="w-full text-sm mb-6 border-collapse">
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50 w-1/4">Name of Teacher</td>
              <td className="border border-slate-300 p-2 w-1/4">{plan.student.user.name}</td>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50 w-1/4">School</td>
              <td className="border border-slate-300 p-2 w-1/4">{plan.student.school?.name || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50">Subject</td>
              <td className="border border-slate-300 p-2">{plan.subject}</td>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50">Class / Form</td>
              <td className="border border-slate-300 p-2">{plan.classForm} {plan.stream ? `(${plan.stream})` : ""}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50">Topic</td>
              <td className="border border-slate-300 p-2">{plan.topic}</td>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50">Sub-topic</td>
              <td className="border border-slate-300 p-2">{plan.subTopic || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50">Date</td>
              <td className="border border-slate-300 p-2">{new Date(plan.date).toLocaleDateString()}</td>
              <td className="border border-slate-300 p-2 font-semibold bg-slate-50">Time & Duration</td>
              <td className="border border-slate-300 p-2">{plan.startTime || "-"} to {plan.endTime || "-"} ({plan.duration || "-"})</td>
            </tr>
          </tbody>
        </table>

        {/* Lesson Objectives */}
        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">1. Lesson Objectives</h3>
          <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.objectives}</div>
        </div>

        {/* Introduction */}
        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">2. Introduction / Set Induction</h3>
          <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.introduction}</div>
        </div>

        {/* Dynamic Steps Table */}
        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm mb-2">3. Lesson Development</h3>
          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-300 p-2 text-left w-1/12">Time</th>
                <th className="border border-slate-300 p-2 text-left w-4/12">Teacher Activity</th>
                <th className="border border-slate-300 p-2 text-left w-4/12">Learner Activity</th>
                <th className="border border-slate-300 p-2 text-left w-3/12">Resources</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(plan.developmentSteps) && plan.developmentSteps.map((step: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-slate-300 p-2 font-mono text-xs">{step.time}</td>
                  <td className="border border-slate-300 p-2 whitespace-pre-wrap">{step.teacherActivity}</td>
                  <td className="border border-slate-300 p-2 whitespace-pre-wrap">{step.learnerActivity}</td>
                  <td className="border border-slate-300 p-2">{step.resources}</td>
                </tr>
              ))}
              {(!plan.developmentSteps || plan.developmentSteps.length === 0) && (
                <tr>
                  <td colSpan={4} className="border border-slate-300 p-4 text-center italic text-slate-500">No lesson steps provided.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Methods & Resources */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">4. Teaching Methods</h3>
            <ul className="list-disc pl-5 text-sm text-slate-800">
              {plan.methods?.map((m: string) => <li key={m}>{m}</li>)}
              {(!plan.methods || plan.methods.length === 0) && <li className="italic">None specified</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">5. Teaching/Learning Resources</h3>
            <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.resources}</div>
          </div>
        </div>

        {/* Assessment & Conclusion */}
        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">6. Assessment Methods</h3>
          <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.assessment || "None specified"}</div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">7. Conclusion / Summary</h3>
          <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.conclusion}</div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-200 pb-1">8. Assignment / Homework</h3>
          <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.assignment || "None"}</div>
        </div>

        {/* Reflection */}
        <div className="mb-6 p-4 border-2 border-slate-300 bg-slate-50">
          <h3 className="font-bold uppercase text-sm mb-2 border-b border-slate-300 pb-1">Self Reflection (Post-Lesson)</h3>
          <div className="whitespace-pre-wrap text-sm text-slate-800">{plan.reflection || "Pending..."}</div>
        </div>
        
        {/* Supervisor Comments (if any) */}
        {plan.reviewComment && (
          <div className="mt-8 p-4 border border-red-200 bg-red-50 text-red-900 rounded-sm">
            <h3 className="font-bold uppercase text-sm mb-2">Supervisor Remarks</h3>
            <div className="whitespace-pre-wrap text-sm">{plan.reviewComment}</div>
          </div>
        )}
      </div>
    </div>
  );
}
