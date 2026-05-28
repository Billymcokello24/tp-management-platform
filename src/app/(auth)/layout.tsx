import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | TP Management Platform",
  description: "Login and Registration for Teaching Practice Platform",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
