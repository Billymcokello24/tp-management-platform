export default function LecturerNotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
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
            Updates and announcements from the TP Coordinator.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">You have no new notifications.</p>
      </div>
    </div>
  );
}
