import { Role } from "@prisma/client";

export type { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface DashboardStat {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}
