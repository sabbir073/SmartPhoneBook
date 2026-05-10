export type PersistenceState = {
  supported: boolean;
  persistent: boolean;
  quota?: number;
  usage?: number;
};

export async function getPersistenceState(): Promise<PersistenceState> {
  if (typeof navigator === "undefined" || !navigator.storage) {
    return { supported: false, persistent: false };
  }
  const persistent =
    typeof navigator.storage.persisted === "function"
      ? await navigator.storage.persisted()
      : false;
  let quota: number | undefined;
  let usage: number | undefined;
  if (typeof navigator.storage.estimate === "function") {
    try {
      const est = await navigator.storage.estimate();
      quota = est.quota;
      usage = est.usage;
    } catch {
      /* ignore */
    }
  }
  return { supported: true, persistent, quota, usage };
}

/**
 * Ask the browser to make our IndexedDB storage persistent.
 * Without this, the browser MAY evict data under storage pressure.
 * With it, data lives until the user explicitly clears site data
 * or uninstalls the PWA.
 *
 * Most browsers grant this silently when heuristics are met
 * (PWA installed, frequently visited, bookmarked, etc.).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage) return false;
  if (typeof navigator.storage.persist !== "function") return false;
  try {
    const already =
      typeof navigator.storage.persisted === "function"
        ? await navigator.storage.persisted()
        : false;
    if (already) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
