import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Communications</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Send announcements and manage system notifications.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-10">
            The notification center will be available in the next update. You will be able to send targeted announcements to lecturers and students, manage deadlines, and track read receipts.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
