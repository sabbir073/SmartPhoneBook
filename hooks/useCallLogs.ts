"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { CallLog } from "@/lib/types";

export function useCallLogs(contactId?: string): CallLog[] | undefined {
  return useLiveQuery(async () => {
    let logs: CallLog[];
    if (contactId) {
      logs = await db.callLogs.where("contactId").equals(contactId).toArray();
    } else {
      logs = await db.callLogs.toArray();
    }
    return logs.sort((a, b) => b.startedAt - a.startedAt);
  }, [contactId]);
}
