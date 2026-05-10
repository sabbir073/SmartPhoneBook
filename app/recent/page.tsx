"use client";
import { useRouter } from "next/navigation";
import { Phone, ChevronRight } from "lucide-react";
import { AppBar } from "@/components/AppBar";
import { ContactAvatar } from "@/components/ContactAvatar";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useContacts } from "@/hooks/useContacts";
import { formatRelative, formatDuration } from "@/lib/format";
import { useMemo } from "react";
import type { Contact } from "@/lib/types";

export default function RecentPage() {
  const router = useRouter();
  const logs = useCallLogs();
  const contacts = useContacts();

  const contactMap = useMemo(() => {
    const m = new Map<string, Contact>();
    contacts?.forEach((c) => m.set(c.id, c));
    return m;
  }, [contacts]);

  return (
    <>
      <AppBar title="Recent calls" />
      {logs === undefined || contacts === undefined ? (
        <div
          className="text-center py-12 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading…
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
          <div
            className="rounded-full p-5 mb-4"
            style={{ background: "var(--color-surface-2)" }}
          >
            <Phone size={32} style={{ color: "var(--color-text-muted)" }} />
          </div>
          <h2 className="text-lg font-semibold mb-1">No recent calls</h2>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Calls you make will appear here.
          </p>
        </div>
      ) : (
        <ul>
          {logs.map((log) => {
            const c = contactMap.get(log.contactId);
            if (!c) return null;
            return (
              <li key={log.id}>
                <button
                  onClick={() => router.push(`/contact/${c.id}`)}
                  className="tap w-full flex items-center gap-3 px-4 py-2.5 text-left active:bg-black/[0.03] dark:active:bg-white/[0.04]"
                >
                  <ContactAvatar name={c.name} color={c.avatarColor} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {formatRelative(log.startedAt)} ·{" "}
                      {formatDuration(log.endedAt - log.startedAt)}
                      {log.notes ? ` · "${log.notes.slice(0, 40)}"` : ""}
                    </div>
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
      )}
    </>
  );
}
