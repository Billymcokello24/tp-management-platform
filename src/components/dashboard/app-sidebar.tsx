"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  LayoutDashboard,
  Settings,
  FileText,
  School,
  Shuffle,
  LogOut,
  Bell,
  BarChart3,
  User,
  ClipboardCheck,
  MapPin,
  FolderOpen,
  Award,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { TMULogo } from "@/components/shared/tmu-logo";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, setOpenMobile } = useSidebar();
  const role = (session?.user as any)?.role || "STUDENT";
  const userName = session?.user?.name || "User";

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  const getNavItems = () => {
    switch (role) {
      case "ADMIN":
        return {
          main: [
            { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { title: "Students", href: "/admin/students", icon: Users },
            { title: "Lecturers", href: "/admin/lecturers", icon: BookOpen },
            { title: "Schools", href: "/admin/schools", icon: School },
            { title: "Assignments", href: "/admin/assignments", icon: Shuffle },
            { title: "Assessments", href: "/admin/assessments", icon: ClipboardCheck },
          ],
          secondary: [
            { title: "Reports", href: "/admin/reports", icon: BarChart3 },
            { title: "Notifications", href: "/admin/notifications", icon: Bell },
          ],
          system: [
            { title: "Settings", href: "/admin/settings", icon: Settings },
            { title: "Profile", href: "/admin/profile", icon: User },
          ],
        };
      case "LECTURER":
        return {
          main: [
            { title: "Dashboard", href: "/lecturer/dashboard", icon: LayoutDashboard },
            { title: "My Students", href: "/lecturer/students", icon: Users },
            { title: "Assessments", href: "/lecturer/assessments", icon: ClipboardCheck },
            { title: "Lesson Plans", href: "/lecturer/lesson-plans", icon: FileText },
          ],
          secondary: [
            { title: "Notifications", href: "/lecturer/notifications", icon: Bell },
          ],
          system: [
            { title: "Profile", href: "/lecturer/profile", icon: User },
          ],
        };
      case "STUDENT":
      default:
        return {
          main: [
            { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
            { title: "Lesson Plans", href: "/student/lesson-plans", icon: FileText },
            { title: "My School", href: "/student/school", icon: MapPin },
            { title: "Assessments", href: "/student/assessments", icon: ClipboardCheck },
          ],
          secondary: [
            { title: "Schemes of Work", href: "/student/schemes", icon: BookOpen },
            { title: "Resources", href: "/student/resources", icon: FolderOpen },
            { title: "Results", href: "/student/results", icon: Award },
          ],
          system: [
            { title: "Notifications", href: "/student/notifications", icon: Bell },
            { title: "Profile", href: "/student/profile", icon: User },
          ],
        };
    }
  };

  const nav = getNavItems();

  const isActive = (href: string) => {
    return pathname === href || (href !== `/${role.toLowerCase()}/dashboard` && pathname.startsWith(href));
  };

  return (
    <Sidebar variant="inset">
      {/* Logo / Brand */}
      <SidebarHeader className="h-16 flex items-center border-b border-sidebar-border px-5">
        <Link href={`/${role.toLowerCase()}/dashboard`} className="flex items-center gap-3">
          <TMULogo size="md" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground">TMU Portal</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Teaching Practice</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="py-4 px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1">Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={`rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={isActive(item.href) ? "text-primary" : ""} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 opacity-50" />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1">
            {role === "STUDENT" ? "Academic" : "Insights"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.secondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={`rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={isActive(item.href) ? "text-primary" : ""} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 opacity-50" />

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.system.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={`rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={isActive(item.href) ? "text-primary" : ""} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info + sign out */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{role}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
