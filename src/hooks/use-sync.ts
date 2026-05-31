"use client";

import { useState, useCallback } from "react";
import { db } from "@/lib/db";
import { toast } from "sonner";
// We would import the actual server actions here once implemented
// import { syncLessonPlan, syncAssessment, syncSupervisionLog } from "@/app/(dashboard)/_actions/sync";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncAll = useCallback(async () => {
    if (!navigator.onLine) return;
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      
      const pendingItems = await db.syncQueue.toArray();
      
      if (pendingItems.length === 0) {
        setIsSyncing(false);
        return;
      }

      console.log(`[Sync] Found ${pendingItems.length} items to sync`);

      for (const item of pendingItems) {
        try {
          // 1. Actually call the server action based on type
          // Example:
          // if (item.type === 'LESSON_PLAN') {
          //   await syncLessonPlan(item.payload);
          //   await db.lessonPlans.update(item.payload.id, { syncStatus: 'synced' });
          // } else if (item.type === 'ASSESSMENT') {
          //   await syncAssessment(item.payload);
          //   await db.assessments.update(item.payload.id, { syncStatus: 'synced' });
          // }
          
          // Simulation for now until Phase 4 server actions are written
          await new Promise(resolve => setTimeout(resolve, 500)); 

          // 2. On success, remove from queue
          await db.syncQueue.delete(item.id);
          
        } catch (err) {
          console.error(`[Sync] Failed to sync item ${item.id}`, err);
          // Increment retry count, maybe mark as failed if too many retries
          await db.syncQueue.update(item.id, { retryCount: item.retryCount + 1 });
        }
      }

      const remaining = await db.syncQueue.count();
      if (remaining === 0 && pendingItems.length > 0) {
        toast.success("All offline changes synced successfully");
      } else if (remaining > 0) {
        toast.error(`Failed to sync ${remaining} items. Will retry later.`);
      }

    } catch (error) {
      console.error("[Sync] Sync process failed", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return {
    isSyncing,
    syncAll
  };
}
