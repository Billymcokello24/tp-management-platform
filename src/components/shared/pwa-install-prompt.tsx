"use client";

import { useState, useEffect, useRef } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      // Show after a short delay
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    deferredPrompt.current = null;
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] z-[9999] animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="relative bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient accent top line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <img
                src="/tmu-logo.png?v=2"
                alt="TMU Logo"
                className="h-9 w-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm leading-tight">
                Install TMU TP Platform
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Install this app on your device for a faster, native experience — works offline too.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleInstall}
              className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
