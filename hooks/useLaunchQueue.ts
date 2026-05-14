"use client";
import { useEffect, useState } from "react";
import { parseVCard, type ParsedContact } from "@/lib/vcard";

// W3C launch queue spec — populated when the OS opens a file with the PWA
// registered as the handler (via the manifest's `file_handlers` entry).
type FileSystemFileHandle = {
  getFile: () => Promise<File>;
  kind?: "file";
};
type LaunchParams = {
  files?: FileSystemFileHandle[];
  targetURL?: string;
};
type LaunchConsumer = (params: LaunchParams) => void | Promise<void>;
type LaunchQueue = { setConsumer: (consumer: LaunchConsumer) => void };

/**
 * Subscribes to the OS launch queue. When the PWA is opened to handle a
 * file (e.g. user taps a .vcf in Files / Mail), we parse it as a vCard
 * and surface the picker through the returned state.
 *
 * The caller renders ContactPickerSheet bound to `pending` and clears
 * it via `clear` when the user dismisses or imports.
 */
export function useLaunchQueue() {
  const [pending, setPending] = useState<ParsedContact[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = (window as unknown as { launchQueue?: LaunchQueue }).launchQueue;
    if (!q || typeof q.setConsumer !== "function") return;

    q.setConsumer(async (params) => {
      const files = params.files ?? [];
      if (files.length === 0) return;
      try {
        const texts = await Promise.all(
          files.map(async (h) => {
            const f = await h.getFile();
            return f.text();
          }),
        );
        const all = texts.flatMap((t) => parseVCard(t));
        if (all.length === 0) {
          setError(
            "No contacts found in the file. Make sure it's a valid vCard (.vcf).",
          );
          return;
        }
        setPending(all);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not read the file");
      }
    });
  }, []);

  return {
    pending,
    error,
    clear: () => {
      setPending(null);
      setError(null);
    },
  };
}
