"use client";
import { useEffect, useState, useCallback } from "react";
import {
  detectInstallPlatform,
  isAlreadyInstalled,
  canBeInstalled,
  type InstallPlatform,
} from "@/lib/platform";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "smart-phonebook:installDismissedAt";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
  if (!ts) return false;
  return Date.now() - ts < DISMISS_TTL_MS;
}

export type InstallPromptState = {
  /** Running as an installed PWA right now. */
  installed: boolean;
  /** Detected platform — drives which instruction sheet to show. */
  platform: InstallPlatform;
  /** A native (Chromium) install prompt is queued and ready. */
  nativeReady: boolean;
  /** Whether install is even possible on this platform. */
  installable: boolean;
  /** User dismissed the banner within the cool-down. */
  dismissed: boolean;
  /**
   * Trigger the platform-appropriate install path.
   * - Chromium with `nativeReady`: fires the native prompt.
   * - Anything else: returns "needs-instructions" so the UI opens the
   *   matching instruction sheet.
   */
  promptInstall: () => Promise<
    "accepted" | "dismissed" | "needs-instructions" | "unavailable"
  >;
  dismiss: () => void;
};

export function useInstallPrompt(): InstallPromptState {
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setInstalled(isAlreadyInstalled());
    setPlatform(detectInstallPlatform());
    setDismissed(isDismissed());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    // Some browsers fire `appinstalled` instead of toggling display-mode
    // immediately. Also poll matchMedia in case we land while already standalone.
    const mq = window.matchMedia("(display-mode: standalone)");
    const onModeChange = () => setInstalled(isAlreadyInstalled());

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    mq.addEventListener?.("change", onModeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener?.("change", onModeChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "dismissed") {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
        setDismissed(true);
      }
      return choice.outcome;
    }
    // No native prompt — caller should open instructions.
    if (canBeInstalled(platform)) return "needs-instructions" as const;
    return "unavailable" as const;
  }, [deferred, platform]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }, []);

  return {
    installed,
    platform,
    nativeReady: !!deferred,
    installable: canBeInstalled(platform) || !!deferred,
    dismissed,
    promptInstall,
    dismiss,
  };
}
