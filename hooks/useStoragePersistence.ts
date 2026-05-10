"use client";
import { useEffect, useState } from "react";
import {
  getPersistenceState,
  requestPersistentStorage,
  type PersistenceState,
} from "@/lib/persistence";

export function useStoragePersistence(): PersistenceState | null {
  const [state, setState] = useState<PersistenceState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const s = await getPersistenceState();
      if (!cancelled) setState(s);
    };

    (async () => {
      await requestPersistentStorage();
      await refresh();
    })();

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return state;
}
