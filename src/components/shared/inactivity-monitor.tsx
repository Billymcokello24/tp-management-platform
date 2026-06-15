"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const INACTIVITY_SECONDS = 7 * 60; // 7 minutes
const WARNING_SECONDS = 60; // show warning 1 minute before expiry

export function InactivityMonitor() {
  const { data: session, status } = useSession();
  const [secondsLeft, setSecondsLeft] = useState(INACTIVITY_SECONDS);
  const [showWarning, setShowWarning] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const signedOutRef = useRef(false);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsLeft(INACTIVITY_SECONDS);
    setShowWarning(false);
  }, []);

  // Activity listeners
  useEffect(() => {
    if (status !== "authenticated") return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const onActivity = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [status, resetTimer]);

  // Countdown timer
  useEffect(() => {
    if (status !== "authenticated") return;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, INACTIVITY_SECONDS - elapsed);
      setSecondsLeft(remaining);

      if (remaining <= WARNING_SECONDS && remaining > 0) {
        setShowWarning(true);
      }

      if (remaining <= 0 && !signedOutRef.current) {
        signedOutRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        signOut({ callbackUrl: "/login" });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  if (status !== "authenticated" || !showWarning) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-amber-50 border border-amber-300 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L12 3 2.697 16.126z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800">Session Expiring</h4>
            <p className="text-xs text-amber-700 mt-1">
              You will be logged out in{" "}
              <span className="font-bold">
                {minutes}m {secs.toString().padStart(2, "0")}s
              </span>{" "}
              due to inactivity.
            </p>
            <button
              onClick={resetTimer}
              className="mt-2 text-xs font-semibold text-amber-700 underline hover:text-amber-900"
            >
              I&apos;m still here — keep me signed in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
