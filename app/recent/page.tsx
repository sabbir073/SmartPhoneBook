"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Phone, ChevronRight } from "lucide-react";
import { AppBar } from "@/components/AppBar";
import { ContactAvatar } from "@/components/ContactAvatar";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useContacts } from "@/hooks/useContacts";
import { formatRelative } from "@/lib/format";
import type { Contact, CallLog } from "@/lib/types";

type GroupedCall = {
  contact: Contact;
  count: number;
  lastStartedAt: number;
  lastNote: string;
};

export default function RecentPage() {
  const router = useRouter();
  const logs = useCallLogs();
  const contacts = useContacts();

  const grouped = useMemo<GroupedCall[] | null>(() => {
    if (!logs || !contacts) return null;
    const byId = new Map<string, Contact>();
    contacts.forEach((c) => byId.set(c.id, c));

    const groups = new Map<string, { logs: CallLog[]; contact: Contact }>();
    for (const log of logs) {
      const contact = byId.get(log.contactId);
      if (!contact) continue;
      const g = groups.get(log.contactId);
      if (g) g.logs.push(log);
      else groups.set(log.contactId, { logs: [log], contact });
    }

    const list: GroupedCall[] = [];
    for (const { logs: gLogs, contact } of groups.values()) {
      // Most recent first within the group, then pick the latest note
      gLogs.sort((a, b) => b.startedAt - a.startedAt);
      const latest = gLogs[0];
      const latestWithNote = gLogs.find((l) => l.notes.trim().length > 0);
      list.push({
        contact,
        count: gLogs.length,
        lastStartedAt: latest.startedAt,
        lastNote: latestWithNote?.notes.trim() ?? "",
      });
    }
    list.sort((a, b) => b.lastStartedAt - a.lastStartedAt);
    return list;
  }, [logs, contacts]);

  return (
    <>
      <AppBar title="Recent calls" />
      {grouped === null ? (
        <div
          className="text-center py-12 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading…
        </div>
      ) : grouped.length === 0 ? (
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
          {grouped.map((g) => (
            <li key={g.contact.id}>
              <button
                onClick={() => router.push(`/contact/${g.contact.id}/history`)}
                className="tap w-full flex items-center gap-3 px-4 py-3 text-left active:bg-black/[0.03] dark:active:bg-white/[0.04]"
              >
                <ContactAvatar
                  name={g.contact.name}
                  color={g.contact.avatarColor}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {g.contact.name}
                    </span>
                    {g.count > 1 && (
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          background:
                            "color-mix(in oklab, var(--color-primary) 14%, transparent)",
                          color: "var(--color-primary)",
                        }}
                      >
                        ({g.count})
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs flex items-center gap-1 mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <Phone size={11} />
                    <span>{formatRelative(g.lastStartedAt)}</span>
                  </div>
                  {g.lastNote && (
                    <div
                      className="text-sm mt-0.5 truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {g.lastNote}
                    </div>
                  )}
                </div>
                <ChevronRight
                  size={18}
                  style={{ color: "var(--color-text-muted)" }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
