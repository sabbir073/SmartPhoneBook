"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, X, Share, Plus } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { BottomSheet } from "./BottomSheet";

export function InstallBanner() {
  const { installed, canInstall, iosInstructions, dismissed, promptInstall, dismiss } =
    useInstallPrompt();
  const [iosOpen, setIosOpen] = useState(false);

  const showAndroid = !installed && canInstall && !dismissed;
  const showIOS = !installed && iosInstructions && !dismissed;

  return (
    <>
      <AnimatePresence>
        {(showAndroid || showIOS) && (
          <motion.div
            key="install-banner"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-3 z-40 pt-safe"
            style={{
              top: 8,
            }}
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
                  Faster, offline, on your home screen.
                </div>
              </div>
              <button
                onClick={() => {
                  if (showAndroid) void promptInstall();
                  else setIosOpen(true);
                }}
                className="tap px-3.5 py-1.5 rounded-full font-semibold text-sm"
                style={{
                  background: "#fff",
                  color: "var(--color-primary)",
                }}
              >
                Install
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

      <BottomSheet
        open={iosOpen}
        onClose={() => setIosOpen(false)}
        title="Install on iPhone"
      >
        <div className="px-5 pb-6">
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            iOS doesn't support automatic install. Add Smart Phonebook to your
            Home Screen in two taps:
          </p>
          <ol className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-3">
              <Step n={1} />
              <span>
                Tap the <Share size={14} className="inline mx-0.5 -mt-0.5" />{" "}
                <strong>Share</strong> button in Safari's bottom bar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Step n={2} />
              <span>
                Scroll and tap{" "}
                <strong>
                  Add to Home Screen{" "}
                  <Plus size={14} className="inline -mt-0.5" />
                </strong>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Step n={3} />
              <span>
                Tap <strong>Add</strong> in the top-right.
              </span>
            </li>
          </ol>
          <button
            onClick={() => setIosOpen(false)}
            className="tap w-full py-3 rounded-full font-semibold mt-6"
            style={{
              background: "var(--color-primary)",
              color: "#fff",
            }}
          >
            Got it
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span
      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      style={{
        background:
          "color-mix(in oklab, var(--color-primary) 14%, transparent)",
        color: "var(--color-primary)",
      }}
    >
      {n}
    </span>
  );
}
