"use client";
import { usePathname } from "next/navigation";
import { AppBar } from "@/components/AppBar";
import { CallLogTimeline } from "@/components/CallLogTimeline";
import { useContact } from "@/hooks/useContact";
import { useCallLogs } from "@/hooks/useCallLogs";

function idFromPath(path: string): string {
  const m = path.match(/^\/contact\/([^/]+)\/history\/?$/);
  return m ? decodeURIComponent(m[1]) : "_";
}

export default function HistoryClient() {
  const pathname = usePathname();
  const id = idFromPath(pathname || "");
  const contact = useContact(id !== "_" ? id : undefined);
  const logs = useCallLogs(id !== "_" ? id : undefined);

  return (
    <>
      <AppBar title={contact ? `${contact.name} · History` : "History"} back />
      <div className="px-3 py-3">
        {logs === undefined ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Loading…
          </div>
        ) : (
          <CallLogTimeline logs={logs} />
        )}
      </div>
    </>
  );
}
