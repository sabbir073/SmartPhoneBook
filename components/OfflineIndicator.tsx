"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/useOnline";

export function OfflineIndicator() {
  const online = useOnline();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (online) {
      const t = setTimeout(() => setShow(false), 1200);
      return () => clearTimeout(t);
    }
    setShow(true);
  }, [online]);

  return (
    <AnimatePresence>
      {show && !online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-2 inset-x-0 z-40 flex justify-center pointer-events-none"
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white"
            style={{ background: "rgba(15,23,42,0.85)" }}
          >
            <WifiOff size={14} />
            Offline — all features still work
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
