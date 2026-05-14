import type { ParsedContact } from "./vcard";
import { importParsedContacts, type ImportResult } from "./importContacts";

const LAST_SYNC_KEY = "smart-phonebook:lastSyncedAt";
const LAST_SYNC_COUNT_KEY = "smart-phonebook:lastSyncedCount";

export type SyncPayload = {
  app: "smart-phonebook";
  type: "contacts-sync";
  version: 1;
  source?: string;
  exportedAt: number;
  count?: number;
  contacts: ParsedContact[];
};

export function parseSyncPayload(raw: unknown): SyncPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid file: expected a JSON object.");
  }
  const p = raw as Partial<SyncPayload>;
  if (p.app !== "smart-phonebook") {
    throw new Error(
      "This isn't a Smart Phonebook contacts file. Generate one from the Voter List with the bundled converter.",
    );
  }
  if (p.type !== "contacts-sync") {
    throw new Error(
      "Wrong file type. To restore a full backup use Settings → Import from JSON instead.",
    );
  }
  if (p.version !== 1) {
    throw new Error(`Unsupported sync file version: ${p.version}`);
  }
  if (!Array.isArray(p.contacts)) {
    throw new Error("Sync file is missing the contacts array.");
  }
  // Light per-entry validation
  for (const c of p.contacts) {
    if (!c || typeof c !== "object" || !c.name || !c.mobile) {
      throw new Error(
        "One or more entries are missing a name or mobile number.",
      );
    }
  }
  return p as SyncPayload;
}

export async function syncContactsFromJSON(
  raw: unknown,
): Promise<ImportResult> {
  const payload = parseSyncPayload(raw);
  const result = await importParsedContacts(payload.contacts);
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    localStorage.setItem(
      LAST_SYNC_COUNT_KEY,
      String(payload.contacts.length),
    );
  }
  return result;
}

export type LastSyncInfo = {
  at: number | null;
  totalInLastFile: number | null;
};

export function getLastSync(): LastSyncInfo {
  if (typeof window === "undefined") return { at: null, totalInLastFile: null };
  const atStr = localStorage.getItem(LAST_SYNC_KEY);
  const countStr = localStorage.getItem(LAST_SYNC_COUNT_KEY);
  const at = atStr ? Number(atStr) : null;
  const totalInLastFile = countStr ? Number(countStr) : null;
  return {
    at: at && Number.isFinite(at) ? at : null,
    totalInLastFile:
      totalInLastFile && Number.isFinite(totalInLastFile)
        ? totalInLastFile
        : null,
  };
}
