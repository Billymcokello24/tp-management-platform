"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, User } from "lucide-react";

export default function LecturerProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const handleSave = () => {
    toast.success("Profile updated successfully.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Account</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Manage your supervisor account details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-10 w-10" />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name || "Lecturer Name"} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" defaultValue={user?.email || "lecturer@tmu.ac.ke"} disabled />
              <p className="text-xs text-muted-foreground">Contact IT support to change your email address.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h3 className="font-medium mb-4">Change Password</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
          <Save className="mr-2 h-4 w-4" /> Save Profile
        </Button>
      </div>
    </div>
  );
}
