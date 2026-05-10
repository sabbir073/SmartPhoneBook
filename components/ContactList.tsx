"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, UserPlus } from "lucide-react";
import type { Contact } from "@/lib/types";
import { ContactAvatar } from "./ContactAvatar";

export function ContactList({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();

  const grouped = useMemo(() => {
    const groups = new Map<string, Contact[]>();
    for (const c of contacts) {
      const first = c.name.trim().charAt(0).toUpperCase();
      const key = /[A-Z]/.test(first) ? first : "#";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });
  }, [contacts]);

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
        <div
          className="rounded-full p-5 mb-4"
          style={{ background: "var(--color-surface-2)" }}
        >
          <UserPlus size={32} style={{ color: "var(--color-text-muted)" }} />
        </div>
        <h2 className="text-lg font-semibold mb-1">No contacts yet</h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Tap the + button to add your first contact.
        </p>
      </div>
    );
  }

  return (
    <ul className="pb-4">
      {grouped.map(([letter, list]) => (
        <li key={letter}>
          <div
            className="alpha-header px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            {letter}
          </div>
          <ul>
            {list.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => router.push(`/contact/${c.id}`)}
                  className="tap w-full flex items-center gap-3 px-4 py-2.5 text-left active:bg-black/[0.03] dark:active:bg-white/[0.04]"
                >
                  <ContactAvatar name={c.name} color={c.avatarColor} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div
                      className="text-sm truncate"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {c.mobile}
                      {c.company ? ` · ${c.company}` : ""}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
