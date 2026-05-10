"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Info,
  HelpCircle,
  Share2,
  ShieldCheck,
  ScrollText,
  Code2,
  ChevronRight,
} from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { APP_NAME } from "@/lib/version";

type Item = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  subtitle?: string;
  onSelect: (ctx: { router: ReturnType<typeof useRouter> }) => void;
};

const ITEMS: Item[] = [
  {
    icon: Info,
    label: "About",
    subtitle: "App version and credits",
    onSelect: ({ router }) => router.push("/about"),
  },
  {
    icon: HelpCircle,
    label: "Help & FAQ",
    subtitle: "How everything works",
    onSelect: ({ router }) => router.push("/help"),
  },
  {
    icon: Share2,
    label: "Share App",
    subtitle: "Send Smart Phonebook to a friend",
    onSelect: async () => {
      const url = window.location.origin;
      const shareData = {
        title: APP_NAME,
        text: "Smart Phonebook — a fast, offline phonebook with call notes.",
        url,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }
      } catch {
        /* fall through to clipboard */
      }
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      } catch {
        prompt("Copy this link:", url);
      }
    },
  },
  {
    icon: ShieldCheck,
    label: "Privacy Policy",
    subtitle: "Your data stays on your device",
    onSelect: ({ router }) => router.push("/privacy"),
  },
  {
    icon: ScrollText,
    label: "Terms of Use",
    subtitle: "How you can use the app",
    onSelect: ({ router }) => router.push("/terms"),
  },
  {
    icon: Code2,
    label: "Open Source",
    subtitle: "Libraries we built on",
    onSelect: ({ router }) => router.push("/licenses"),
  },
];

export function AppMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handle = useCallback(
    (item: Item) => {
      setOpen(false);
      // let the sheet animate out before navigating, feels snappier
      setTimeout(() => item.onSelect({ router }), 80);
    },
    [router],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="tap p-2 -mr-1 rounded-full active:bg-white/10"
      >
        <MoreVertical size={22} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Menu">
        <ul className="pb-3">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <button
                  onClick={() => handle(item)}
                  className="tap w-full flex items-center gap-3 px-5 py-3 text-left active:bg-black/[0.04] dark:active:bg-white/[0.05]"
                >
                  <div
                    className="rounded-full p-2 shrink-0"
                    style={{
                      background:
                        "color-mix(in oklab, var(--color-primary) 14%, transparent)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    {item.subtitle && (
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    size={18}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
