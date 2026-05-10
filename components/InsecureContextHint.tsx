"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShieldAlert, X } from "lucide-react";

const DISMISS_KEY = "smart-phonebook:insecureHintDismissed";

/**
 * PWA features (install prompt, service worker, persistent storage) require
 * a secure context — HTTPS or `localhost`. When someone opens the dev server
 * via a LAN IP on their phone, none of those features work and the page
 * looks "broken" with no obvious reason. Surface that.
 */
export function InsecureContextHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.isSecureContext) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setShow(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed inset-x-3 z-40 pt-safe"
          style={{ top: 8 }}
        >
          <div
            className="flex items-start gap-3 px-3 py-3 rounded-2xl"
            style={{
              background: "#1f2937",
              color: "#fff",
              boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="rounded-full p-2 shrink-0"
              style={{ background: "rgba(251,146,60,0.25)", color: "#fb923c" }}
            >
              <ShieldAlert size={18} />
            </div>
            <div className="flex-1 min-w-0 text-sm leading-snug">
              <div className="font-semibold">Insecure connection (HTTP)</div>
              <div className="opacity-80 mt-0.5">
                Install, offline cache and persistent storage are disabled.
                Open over HTTPS (deploy to Netlify or use a tunnel like
                <code className="mx-1 px-1 rounded bg-white/10">ngrok</code>)
                to enable them.
              </div>
            </div>
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
  );
}
