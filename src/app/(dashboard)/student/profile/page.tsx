"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, User, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/(dashboard)/_actions/profile";
import { useState } from "react";

export default function StudentProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success(res.message);
        // Refresh session data internally so the header updates
        if (formData.get("name")) {
          await update({ name: formData.get("name") });
        }
        // Clear password fields
        (document.getElementById("currentPassword") as HTMLInputElement).value = "";
        (document.getElementById("newPassword") as HTMLInputElement).value = "";
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (e) {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

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
            Manage your student account details.
          </p>
        </div>
      </div>

      <form action={handleSave}>
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
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={user?.name || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Contact IT support to change your email address.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={(user as any)?.phone || ""} />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="font-medium mb-4">Change Password</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
