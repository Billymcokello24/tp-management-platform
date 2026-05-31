"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Upload, Save, FileSpreadsheet, Eye, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { saveSchemeOfWork, deleteSchemeOfWork } from "../_actions/schemes";
import { useConfirm } from "@/hooks/use-confirm";

interface SchemeRow {
  week: string;
  lesson: string;
  topic: string;
  subTopic: string;
  objectives: string;
  activities: string;
  resources: string;
  remarks: string;
}

const EMPTY_ROW: SchemeRow = { week: "", lesson: "", topic: "", subTopic: "", objectives: "", activities: "", resources: "", remarks: "" };

export function SchemesClient({ initialSchemes }: { initialSchemes: any[] }) {
  const [ConfirmModal, confirm] = useConfirm();
  const [schemes, setSchemes] = useState(initialSchemes);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [rows, setRows] = useState<SchemeRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const addRow = () => {
    const newRows = [...rows, { ...EMPTY_ROW }];
    setRows(newRows);
    setExpandedRow(newRows.length - 1);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
    if (expandedRow === index) setExpandedRow(null);
    else if (expandedRow !== null && expandedRow > index) setExpandedRow(expandedRow - 1);
  };

  const updateRow = (index: number, field: keyof SchemeRow, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      if (lines.length > 1) {
        const parsedRows: SchemeRow[] = lines.slice(1).filter(l => l.trim().length > 0).map(line => {
          const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
          return {
            week: values[0] || "",
            lesson: values[1] || "",
            topic: values[2] || "",
            subTopic: values[3] || "",
            objectives: values[4] || "",
            activities: values[5] || "",
            resources: values[6] || "",
            remarks: values[7] || "",
          };
        });
        setRows(parsedRows);
        toast.success(`Successfully parsed ${parsedRows.length} rows from CSV.`);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const header = "Week,Lesson,Strand/Topics,SubStrand,Expected Learning Outcomes,LearningActivities,Resources,Remarks\n";
    const example = '1,1,Algebra,Linear Equations,"By the end of the lesson the learner should be able to solve linear equations","Group discussions and individual practice","Mathematics Textbook pg 45, Chalkboard","Completed successfully"\n';
    const blob = new Blob([header + example], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "scheme_of_work_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!title || !subject || rows.length === 0) {
      toast.error("Please provide title, subject, and at least one entry.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveSchemeOfWork({ title, subject, term, content: rows });
      toast.success("Scheme of work saved successfully!");
      setTitle("");
      setSubject("");
      setRows([]);
      setExpandedRow(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to save scheme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm("Delete Scheme", "Are you sure you want to delete this scheme?");
    if (!ok) return;
    try {
      await deleteSchemeOfWork(id);
      setSchemes(schemes.filter(s => s.id !== id));
      toast.success("Deleted successfully.");
    } catch (error: any) {
      toast.error("Failed to delete.");
    }
  };

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
            Create structured schemes manually or upload via CSV.
          </p>
        </div>
      </div>

      {/* Editor Card */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-primary/5 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Scheme Editor
              </CardTitle>
              <CardDescription className="mt-1">Fill in the details below or import from a CSV file.</CardDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="rounded-xl">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Template
              </Button>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Button variant="secondary" size="sm" className="rounded-xl pointer-events-none">
                  <Upload className="w-4 h-4 mr-2" /> Bulk CSV
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Title / Class</Label>
              <Input placeholder="e.g. Form 2 Mathematics" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Subject</Label>
              <Input placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Term</Label>
              <select
                className="flex h-11 w-full items-center rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
          </div>

          {/* Entries - Card-based instead of table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Weekly Entries ({rows.length})
              </h3>
            </div>

            {rows.length === 0 ? (
              <div className="border-2 border-dashed border-border/60 rounded-2xl py-12 text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No entries yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">Add rows manually or upload a CSV template.</p>
                <Button variant="outline" onClick={addRow} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Add First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((row, i) => (
                  <Card key={i} className={`transition-all duration-200 ${expandedRow === i ? 'border-primary/40 shadow-md' : 'border-border/50 hover:border-primary/20'}`}>
                    {/* Row Header - Always Visible */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer select-none"
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">W{row.week || (i + 1)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{row.topic || "Untitled Strand"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {row.subTopic ? `${row.subTopic} · ` : ""}Lesson {row.lesson || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={(e) => { e.stopPropagation(); removeRow(i); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {expandedRow === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Row Content - Expandable */}
                    {expandedRow === i && (
                      <CardContent className="pt-0 pb-5 px-4 space-y-4 border-t border-border/40">
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Week</Label>
                            <Input value={row.week} onChange={(e) => updateRow(i, "week", e.target.value)} placeholder="e.g. 1" className="h-11 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lesson</Label>
                            <Input value={row.lesson} onChange={(e) => updateRow(i, "lesson", e.target.value)} placeholder="e.g. 1" className="h-11 rounded-xl" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strand / Topics</Label>
                            <Input value={row.topic} onChange={(e) => updateRow(i, "topic", e.target.value)} placeholder="e.g. Algebra" className="h-11 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sub Strand</Label>
                            <Input value={row.subTopic} onChange={(e) => updateRow(i, "subTopic", e.target.value)} placeholder="e.g. Linear Equations" className="h-11 rounded-xl" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expected Learning Outcomes</Label>
                          <Textarea
                            value={row.objectives}
                            onChange={(e) => updateRow(i, "objectives", e.target.value)}
                            placeholder="By the end of the lesson, the learner should be able to..."
                            rows={3}
                            className="rounded-xl resize-y"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Learning Activities</Label>
                          <Textarea
                            value={row.activities}
                            onChange={(e) => updateRow(i, "activities", e.target.value)}
                            placeholder="Group discussions, demonstrations, practice exercises..."
                            rows={3}
                            className="rounded-xl resize-y"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resources</Label>
                            <Textarea
                              value={row.resources}
                              onChange={(e) => updateRow(i, "resources", e.target.value)}
                              placeholder="Textbooks, chalkboard, charts..."
                              rows={2}
                              className="rounded-xl resize-y"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Remarks</Label>
                            <Textarea
                              value={row.remarks}
                              onChange={(e) => updateRow(i, "remarks", e.target.value)}
                              placeholder="Lesson completed successfully..."
                              rows={2}
                              className="rounded-xl resize-y"
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
            <Button variant="outline" onClick={addRow} className="rounded-xl h-11">
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rows.length === 0} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm h-11">
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? "Saving..." : "Save Scheme"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>My Schemes</CardTitle>
          <CardDescription>Previously saved schemes of work.</CardDescription>
        </CardHeader>
        <CardContent>
          {schemes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>You have not saved any schemes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schemes.map((scheme) => {
                const contentArray = Array.isArray(scheme.content) ? scheme.content : [];
                return (
                  <div key={scheme.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{scheme.title}</p>
                        <p className="text-xs text-muted-foreground">{scheme.subject} · {scheme.term} · {contentArray.length} entries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${scheme.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {scheme.status}
                      </span>
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => {
                        setRows(contentArray as SchemeRow[]);
                        setTitle(scheme.title);
                        setSubject(scheme.subject);
                        setTerm(scheme.term);
                        setExpandedRow(0);
                        toast.info("Scheme loaded into editor.");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleDelete(scheme.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmModal />
    </div>
  );
}
