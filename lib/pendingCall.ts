import type { PendingCall } from "./types";

const KEY = "smart-phonebook:pendingCall";

export function setPendingCall(p: PendingCall): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore quota errors */
  }
}

export function getPendingCall(): PendingCall | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCall;
    if (!parsed?.contactId || !parsed?.startedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCall(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
