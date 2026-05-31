"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { db } from "@/lib/db";
import { useSync } from "@/hooks/use-sync";
import { useLiveQuery } from "dexie-react-hooks";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const { isSyncing, syncAll } = useSync();

  // Monitor pending items in the queue
  const pendingCount = useLiveQuery(
    () => db.syncQueue.count(),
    []
  ) || 0;

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Automatically trigger sync when coming online
      syncAll();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncAll]);

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null; // Don't show anything if fully synced and online
  }

  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm backdrop-blur-md transition-all ${
      !isOnline 
        ? "bg-amber-100/90 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800" 
        : "bg-background/90 text-foreground border-border"
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline</span>
        </>
      ) : (
        <>
          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
          <span>Online</span>
        </>
      )}

      {(pendingCount > 0 || isSyncing) && (
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-current/20">
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>
            {isSyncing ? "Syncing..." : `${pendingCount} pending`}
          </span>
        </div>
      )}
    </div>
  );
}
