"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Download, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const mockSchemes = [
  { id: 1, subject: "Mathematics", form: "Form 2", term: "Term 2", status: "Approved", date: "2026-05-10" },
  { id: 2, subject: "Physics", form: "Form 3", term: "Term 2", status: "Pending", date: "2026-05-25" },
];

export default function StudentSchemesPage() {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Academic Planning</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Schemes of Work
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Upload and manage your termly teaching schemes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Scheme</CardTitle>
            <CardDescription>Submit a new scheme of work for review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsUploading(true); setTimeout(() => setIsUploading(false), 1000); }}>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select defaultValue="mathematics">
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class / Form</Label>
                <Select defaultValue="form2">
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form1">Form 1</SelectItem>
                    <SelectItem value="form2">Form 2</SelectItem>
                    <SelectItem value="form3">Form 3</SelectItem>
                    <SelectItem value="form4">Form 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select defaultValue="term2">
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term1">Term 1</SelectItem>
                    <SelectItem value="term2">Term 2</SelectItem>
                    <SelectItem value="term3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document (PDF/DOCX)</Label>
                <Input type="file" className="h-11 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 rounded-xl" disabled={isUploading}>
                {isUploading ? "Uploading..." : <><Upload className="h-4 w-4 mr-2" /> Submit Scheme</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>Previously uploaded schemes and their approval status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 h-11">Document</TableHead>
                      <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 h-11">Class</TableHead>
                      <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 h-11">Status</TableHead>
                      <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 h-11 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSchemes.map((scheme) => (
                      <TableRow key={scheme.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{scheme.subject}</p>
                              <p className="text-xs text-muted-foreground">{scheme.term} · {scheme.date}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{scheme.form}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1.5 text-xs font-semibold ${scheme.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {scheme.status === 'Approved' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {scheme.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
