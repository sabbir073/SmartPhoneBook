"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import type { InstallPlatform } from "@/lib/platform";
import { InstallInstructionsSheet } from "./InstallInstructionsSheet";

export function InstallBanner() {
  const {
    installed,
    platform,
    nativeReady,
    installable,
    dismissed,
    promptInstall,
    dismiss,
  } = useInstallPrompt();
  const [sheetOpen, setSheetOpen] = useState(false);

  const show = !installed && installable && !dismissed;

  const onInstallClick = async () => {
    const result = await promptInstall();
    if (result === "needs-instructions") setSheetOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            key="install-banner"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-3 z-40 pt-safe"
            style={{ top: 8 }}
          >
            <div
              className="flex items-center gap-3 px-3 py-3 rounded-2xl"
              style={{
                background: "var(--gradient-primary)",
                color: "#fff",
                boxShadow: "0 10px 28px rgba(234,88,12,0.4)",
              }}
            >
              <div
                className="rounded-full p-2 shrink-0"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <Download size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">
                  Install Smart Phonebook
                </div>
                <div className="text-xs opacity-90 leading-tight mt-0.5">
                  {bannerSubtitle(platform, nativeReady)}
                </div>
              </div>
              <button
                onClick={onInstallClick}
                className="tap px-3.5 py-1.5 rounded-full font-semibold text-sm"
                style={{
                  background: "#fff",
                  color: "var(--color-primary)",
                }}
              >
                {nativeReady ? "Install" : "How"}
              </button>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="tap p-1.5 rounded-full"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallInstructionsSheet
        open={sheetOpen}
        platform={platform}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

function bannerSubtitle(platform: InstallPlatform, nativeReady: boolean) {
  if (nativeReady) return "Faster, offline, on your home screen.";
  if (platform === "ios") return "Tap How — works on iPhone & iPad.";
  if (platform === "ipad-desktop") return "Tap How — works on iPad.";
  if (platform === "macos-safari") return "Tap How — add to your Dock.";
  return "Tap How for install steps.";
}
