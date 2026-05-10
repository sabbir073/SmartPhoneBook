"use client";
import { useEffect, useState, useCallback } from "react";
import { getPendingCall, clearPendingCall } from "@/lib/pendingCall";
import { createCallLog } from "@/lib/callLogs";
import type { PendingCall } from "@/lib/types";

const MIN_ELAPSED_MS = 3000;

export function usePendingCall() {
  const [pending, setPending] = useState<PendingCall | null>(null);

  const check = useCallback(() => {
    if (document.visibilityState !== "visible") return;
    const p = getPendingCall();
    if (!p) return;
    if (Date.now() - p.startedAt < MIN_ELAPSED_MS) return;
    setPending(p);
  }, []);

  useEffect(() => {
    check();
    const onVisibility = () => check();
    const onFocus = () => check();
    const onPageShow = () => check();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [check]);

  const save = useCallback(
    async (notes: string) => {
      if (!pending) return;
      await createCallLog({
        contactId: pending.contactId,
        startedAt: pending.startedAt,
        endedAt: Date.now(),
        notes: notes.trim(),
      });
      clearPendingCall();
      setPending(null);
    },
    [pending],
  );

  const dismiss = useCallback(async () => {
    if (!pending) return;
    await createCallLog({
      contactId: pending.contactId,
      startedAt: pending.startedAt,
      endedAt: Date.now(),
      notes: "",
    });
    clearPendingCall();
    setPending(null);
  }, [pending]);

  return { pending, save, dismiss };
}
