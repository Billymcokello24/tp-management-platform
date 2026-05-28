import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, FileCheck2 } from "lucide-react";
import { TMULogo } from "@/components/shared/tmu-logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50">
      {/* Light Theme Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("/bg.jpg")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/95" />
      </div>

      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-200/50 bg-white/60 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-3">
          <TMULogo size="lg" />
          <span className="text-2xl font-extrabold tracking-tight text-[#1e3a8a] drop-shadow-sm">TMU TP Platform</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button className="bg-[#9A1E31] hover:bg-[#7A1726] text-white font-semibold px-6 rounded-full shadow-md transition-all">
              Log in to Portal
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-32 z-10 relative">
        <div className="bg-[#eab308]/15 border border-[#eab308]/40 text-[#b45309] px-5 py-2 rounded-full text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-sm">
          Streamlining University Practicums
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#1e3a8a] max-w-5xl mb-8 leading-tight drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Teaching Practice Management <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] via-[#9A1E31] to-[#eab308]">Reimagined.</span>
        </h1>
        
        <p className="text-lg sm:text-2xl text-slate-700 max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 font-medium leading-relaxed">
          The all-in-one institutional platform empowering administrators, equipping lecturers, and guiding student teachers through their entire practicum journey.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-32 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
          <Link href="/login">
            <Button size="lg" className="h-14 px-10 text-lg font-bold bg-[#9A1E31] hover:bg-[#7A1726] text-white rounded-full shadow-[0_10px_25px_-5px_rgba(154,30,49,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(154,30,49,0.4)] hover:-translate-y-1 transition-all duration-300 group">
              Access Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-6xl w-full text-left relative z-10">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-start gap-5 hover:-translate-y-2 hover:bg-white hover:border-[#1d4ed8]/30 transition-all duration-500 group">
            <div className="bg-[#1d4ed8]/10 text-[#1d4ed8] p-4 rounded-2xl group-hover:bg-[#1d4ed8] group-hover:text-white transition-colors shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e3a8a]">Smart Allocations</h3>
            <p className="text-slate-600 font-medium leading-relaxed">Automated, equitable assignment of lecturers to student teachers based on regions and institutional workload balancing.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-start gap-5 hover:-translate-y-2 hover:bg-white hover:border-[#eab308]/50 transition-all duration-500 group">
            <div className="bg-[#eab308]/15 text-[#b45309] p-4 rounded-2xl group-hover:bg-[#eab308] group-hover:text-white transition-colors shadow-inner">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e3a8a]">Digital Assessments</h3>
            <p className="text-slate-600 font-medium leading-relaxed">Fully digitized rubric scoring, automatic grade calculations, and comprehensive high-fidelity PDF report generation.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-start gap-5 hover:-translate-y-2 hover:bg-white hover:border-[#9A1E31]/40 transition-all duration-500 group">
            <div className="bg-[#9A1E31]/10 text-[#9A1E31] p-4 rounded-2xl group-hover:bg-[#9A1E31] group-hover:text-white transition-colors shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e3a8a]">Real-time Feedback</h3>
            <p className="text-slate-600 font-medium leading-relaxed">Built-in submission systems for students to draft lesson plans, submit portfolios, and receive actionable insights instantly.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-slate-500 border-t border-slate-200 bg-slate-50 relative z-10">
        <p className="font-medium text-sm">© 2026 Tom Mboya University | Teaching Practice Management Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
