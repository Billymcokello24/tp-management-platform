"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, GraduationCap, Link as LinkIcon } from "lucide-react";

const resources = [
  { id: 1, title: "Teaching Practice Manual 2026", type: "PDF Document", size: "2.4 MB", icon: BookOpen, category: "Official Guidelines" },
  { id: 2, title: "Standard Lesson Plan Template", type: "Word Document", size: "45 KB", icon: FileText, category: "Templates" },
  { id: 3, title: "Assessment Rubric Guide", type: "PDF Document", size: "1.1 MB", icon: GraduationCap, category: "Assessment" },
  { id: 4, title: "Scheme of Work Template", type: "Excel Document", size: "120 KB", icon: FileText, category: "Templates" },
];

const externalLinks = [
  { id: 1, title: "Ministry of Education Syllabus", url: "#", description: "Official KICD syllabus portal for secondary schools." },
  { id: 2, title: "Teachers Service Commission (TSC)", url: "#", description: "Teacher registration and professional code of conduct." },
];

export default function StudentResourcesPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Library</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Teaching Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Download official templates, manuals, and curriculum guides.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((res) => (
          <Card key={res.id} className="relative overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <res.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-muted/50 text-muted-foreground px-2 py-1 rounded-md">
                  {res.category}
                </span>
              </div>
              <CardTitle className="text-lg leading-tight">{res.title}</CardTitle>
              <CardDescription>{res.type} · {res.size}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button className="w-full h-11 bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl transition-colors">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* External Links */}
      <div className="mt-12">
        <h2 className="text-xl font-bold tracking-tight mb-4">External Portals</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {externalLinks.map((link) => (
            <a key={link.id} href={link.url} className="block group">
              <div className="p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
