import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SessionProvider } from "@/components/shared/session-provider";
import { TMULogo } from "@/components/shared/tmu-logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen min-w-0 bg-background overflow-x-hidden">
          {/* Top Header Bar */}
          <header className="h-16 border-b border-border/60 bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9" />
              <div className="flex items-center gap-2">
                <TMULogo size="sm" className="hidden sm:block md:hidden" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:block md:hidden">TMU</span>
                <span className="text-muted-foreground/40 hidden sm:block md:hidden">|</span>
                <span className="text-sm font-medium text-foreground/80 hidden sm:inline">Teaching Practice Portal</span>
                <span className="text-sm font-medium text-foreground/80 sm:hidden">TP Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  TP
                </div>
              </div>
            </div>
          </header>
          {/* Main Content Area */}
          <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-auto">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </SessionProvider>
  );
}
