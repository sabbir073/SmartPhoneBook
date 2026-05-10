"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl pb-safe"
            style={{
              background: "var(--color-surface)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
              maxHeight: "92dvh",
              touchAction: "none",
            }}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <div
                className="h-1.5 w-10 rounded-full"
                style={{ background: "var(--color-border)" }}
              />
            </div>
            {title && (
              <h2 className="px-5 pt-2 pb-2 text-lg font-semibold">
                {title}
              </h2>
            )}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "80dvh", touchAction: "auto" }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
