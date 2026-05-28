"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Configuration</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            System Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Configure academic parameters and system rules.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic Configuration</CardTitle>
            <CardDescription>Set the current academic year and TP semester.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input defaultValue="2025/2026" />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input defaultValue="Semester 2" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>TP Commencement Date</Label>
              <Input type="date" defaultValue="2026-05-01" />
            </div>
            <div className="space-y-2">
              <Label>Assessment Deadline Date</Label>
              <Input type="date" defaultValue="2026-08-30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grading & Assessment Rules</CardTitle>
            <CardDescription>Configure grading boundaries and constraints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Distinction Minimum</Label>
                <Input type="number" defaultValue="70" />
              </div>
              <div className="space-y-2">
                <Label>Credit Minimum</Label>
                <Input type="number" defaultValue="60" />
              </div>
              <div className="space-y-2">
                <Label>Pass Minimum</Label>
                <Input type="number" defaultValue="50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Maximum Assessments per Lecturer</Label>
              <Input type="number" defaultValue="15" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
            <Save className="mr-2 h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
