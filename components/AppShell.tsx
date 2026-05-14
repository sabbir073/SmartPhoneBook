"use client";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { OfflineIndicator } from "./OfflineIndicator";
import { NotesBottomSheet } from "./NotesBottomSheet";
import { InstallBanner } from "./InstallBanner";
import { InsecureContextHint } from "./InsecureContextHint";
import { SplashScreen } from "./SplashScreen";
import { usePendingCall } from "@/hooks/usePendingCall";
import { useTheme } from "@/hooks/useTheme";
import { useStoragePersistence } from "@/hooks/useStoragePersistence";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { pending, save, dismiss } = usePendingCall();
  useTheme();
  useStoragePersistence();

  return (
    <div className="min-h-dvh flex flex-col">
      <SplashScreen />
      <OfflineIndicator />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex-1"
          style={{
            paddingBottom: `calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))`,
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <BottomNav />
      <InsecureContextHint />
      <InstallBanner />

      <NotesBottomSheet
        pending={pending}
        onSave={save}
        onDismiss={dismiss}
      />
    </div>
  );
}
