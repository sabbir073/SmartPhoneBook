"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Contact } from "@/lib/types";

export function useContacts(query?: string): Contact[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.contacts.toArray();
    const sorted = all.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    if (!query?.trim()) return sorted;
    const q = query.toLowerCase().trim();
    return sorted.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.mobile.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    });
  }, [query]);
}
