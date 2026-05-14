import { db } from "./db";
import type { BackupPayload, Contact, CallLog } from "./types";

const APP_ID = "smart-phonebook";

export async function exportAll(): Promise<BackupPayload> {
  const [contacts, callLogs] = await Promise.all([
    db.contacts.toArray(),
    db.callLogs.toArray(),
  ]);
  return {
    app: APP_ID,
    version: 1,
    exportedAt: Date.now(),
    contacts,
    callLogs,
  };
}

function backupFilename(ts: number): string {
  const date = new Date(ts).toISOString().slice(0, 10);
  return `smart-phonebook-backup-${date}.json`;
}

export async function shareOrDownloadBackup(
  payload: BackupPayload,
): Promise<"shared" | "downloaded"> {
  const json = JSON.stringify(payload, null, 2);
  const filename = backupFilename(payload.exportedAt);
  const file = new File([json], filename, { type: "application/json" });

  // Prefer Web Share with files on mobile (especially iOS where
  // programmatic anchor downloads can open the file in-browser instead
  // of saving it). Fall back to a regular download elsewhere.
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: "Smart Phonebook backup",
      });
      return "shared";
    } catch (err) {
      // User cancelled or share failed — fall through to download
      if (
        err instanceof DOMException &&
        (err.name === "AbortError" || err.name === "NotAllowedError")
      ) {
        // user-cancelled
        throw err;
      }
      // other errors: fall back to download
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return "downloaded";
}

export type ImportResult = {
  contactsAdded: number;
  callLogsAdded: number;
};

export async function importBackup(
  payload: unknown,
  mode: "merge" | "replace" = "merge",
): Promise<ImportResult> {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid backup file");
  }
  const data = payload as Partial<BackupPayload>;

  if (data.app !== APP_ID) {
    throw new Error(
      "This file was not created by Smart Phonebook. Please choose a valid backup.",
    );
  }
  if (data.version !== 1) {
    throw new Error(`Unsupported backup version: ${data.version}`);
  }
  if (!Array.isArray(data.contacts) || !Array.isArray(data.callLogs)) {
    throw new Error(
      "This looks like a contacts-sync file, not a full backup. Use Settings → Sync contacts → Sync now instead.",
    );
  }

  return db.transaction("rw", db.contacts, db.callLogs, async () => {
    if (mode === "replace") {
      await db.contacts.clear();
      await db.callLogs.clear();
    }
    const contacts = data.contacts as Contact[];
    const callLogs = data.callLogs as CallLog[];
    if (contacts.length) await db.contacts.bulkPut(contacts);
    if (callLogs.length) await db.callLogs.bulkPut(callLogs);
    return {
      contactsAdded: contacts.length,
      callLogsAdded: callLogs.length,
    };
  });
}

export async function readJSONFile(file: File): Promise<unknown> {
  const text = await file.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Could not parse the file as JSON.");
  }
}
