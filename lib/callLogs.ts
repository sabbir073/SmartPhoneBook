import { db } from "./db";
import { uid } from "./uid";
import type { CallLog } from "./types";

export async function createCallLog(input: {
  contactId: string;
  startedAt: number;
  endedAt: number;
  notes: string;
}): Promise<CallLog> {
  const log: CallLog = {
    id: uid(),
    contactId: input.contactId,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    notes: input.notes,
    createdAt: Date.now(),
  };
  await db.callLogs.add(log);
  return log;
}

export async function updateCallLogNotes(
  id: string,
  notes: string,
): Promise<void> {
  await db.callLogs.update(id, { notes });
}

export async function deleteCallLog(id: string): Promise<void> {
  await db.callLogs.delete(id);
}
