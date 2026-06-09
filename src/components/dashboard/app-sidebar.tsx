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
  const userEmail = session?.user?.email || "";

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
            { title: "Stations", href: "/admin/stations", icon: School },
            { title: "Zones", href: "/admin/zones", icon: MapPin },
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
            { title: "Schemes of Work", href: "/lecturer/schemes", icon: BookOpen },
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
            { title: "My Station", href: "/student/station", icon: MapPin },
            { title: "Assessments", href: "/student/assessments", icon: ClipboardCheck },
          ],
          secondary: [
            { title: "Schemes of Work", href: "/student/schemes", icon: BookOpen },
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

  const renderNavItem = (item: { title: string; href: string; icon: any }) => {
    const active = isActive(item.href);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          render={<Link href={item.href} />}
          isActive={active}
          tooltip={isMobile ? undefined : item.title}
          className={`
            rounded-md transition-colors duration-150
            h-10 px-4
            ${active
              ? "bg-accent text-accent-foreground font-medium hover:bg-accent/90 hover:text-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-foreground font-normal"
            }
          `}
        >
          <item.icon className={`!h-4 !w-4 shrink-0 ${active ? "text-accent-foreground" : "text-muted-foreground"}`} />
          <span className="text-[13px]">{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Sidebar variant="sidebar" className="border-r-0 shadow-sm">
      {/* Header — Logo + Brand */}
      <SidebarHeader className="flex flex-row items-center gap-3 px-6 py-4 border-b border-sidebar-border">
        <Link href={`/${role.toLowerCase()}/dashboard`} className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 shrink-0 overflow-hidden">
            <TMULogo size="sm" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="font-bold text-[14px] text-sidebar-foreground truncate text-slate-700">TMU Portal</span>
            <span className="text-[10px] font-medium text-slate-400 truncate">Teaching Practice</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-4 pb-2 bg-white">
        {/* Core Navigation */}
        <SidebarGroup className="p-0 mb-4">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-2 h-auto">
            Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.main.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="p-0 mb-4">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-2 h-auto">
            {role === "STUDENT" ? "Academic" : "Insights"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.secondary.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup className="p-0 mb-4">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-2 h-auto">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.system.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — User info + Sign out */}
      <SidebarFooter className="px-4 py-4 bg-white mt-auto">
        <div className="flex items-start gap-2 mb-3 px-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[12px] font-bold text-white tracking-wide">
              {getInitials(userName)}
            </span>
          </div>
          <div className="flex-1 min-w-0 leading-tight flex flex-col justify-center">
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{userEmail || role.toLowerCase()}</p>
          </div>
        </div>
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md h-9 text-[#ef4444] hover:text-[#ef4444] hover:bg-red-50/50 px-2 justify-start font-normal"
            >
              <LogOut className="!h-4 !w-4 mr-2" />
              <span className="text-[13px]">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
