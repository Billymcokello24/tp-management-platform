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
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 overflow-hidden sm:p-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("/bg.jpg")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/95 dark:from-background dark:via-background/95 dark:to-background" />
      </div>

      <div className="w-[90%] mx-auto max-w-md z-10 relative flex flex-col justify-center min-h-screen sm:min-h-0 px-4 py-12 sm:p-0">
        <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-bottom-8 fade-in duration-700">
          {children}
        </div>
        
        {/* PWA bottom safe area text */}
        <div className="text-center mt-auto sm:mt-8 pt-8 pb-[env(safe-area-inset-bottom)] text-xs font-medium text-slate-500">
          © {new Date().getFullYear()} Tom Mboya University
        </div>
      </div>
    </div>
  );
}
