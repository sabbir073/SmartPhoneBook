"use client";
import { Users, History, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/", label: "Contacts", icon: Users },
  { href: "/recent", label: "Recent", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 pb-safe"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        className="flex"
        style={{ minHeight: "var(--bottom-nav-h)" }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className="tap flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
              style={{
                color: active
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
              }}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              <span
                className="text-[11px] font-medium"
                style={{ opacity: active ? 1 : 0.85 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
