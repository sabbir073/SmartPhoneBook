"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Phone } from "lucide-react";
import { APP_NAME, APP_VERSION } from "@/lib/version";

const SHOW_MS = 1400;
const SESSION_KEY = "smart-phonebook:splashShown";

export function SplashScreen() {
  // Start hidden on the server / before mount — decide on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on a fresh app open (new tab / new launch of the installed PWA).
    // Survives navigations and page reloads within the same tab session.
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);
    const t = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between pt-safe pb-safe"
          style={{
            background:
              "linear-gradient(135deg, #fb923c 0%, #f97316 35%, #ea580c 70%, #9a3412 100%)",
            color: "#fff",
          }}
        >
          {/* glow ring background */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.18), transparent 55%)",
            }}
          />

          <div className="flex-1" />

          <div className="relative flex flex-col items-center gap-5 z-10">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                damping: 16,
                stiffness: 180,
                delay: 0.05,
              }}
              className="relative"
            >
              {/* pulse halo */}
              <motion.div
                aria-hidden
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />
              <div
                className="relative flex items-center justify-center rounded-3xl"
                style={{
                  width: 104,
                  height: 104,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Phone size={52} fill="white" strokeWidth={0} />
                <span
                  className="absolute flex items-center justify-center rounded-full font-extrabold"
                  style={{
                    width: 30,
                    height: 30,
                    top: -8,
                    right: -8,
                    background: "#ffffff",
                    color: "#ea580c",
                    fontSize: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  }}
                >
                  S
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold tracking-tight">
                {APP_NAME}
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Your contacts, your notes — offline.
              </p>
            </motion.div>
          </div>

          <div className="flex-1" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative z-10 pb-6 flex flex-col items-center gap-2"
          >
            <Loader />
            <div
              className="text-[11px] font-medium tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              v{APP_VERSION}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Loader() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.85)" }}
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
