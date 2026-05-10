"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Contact } from "@/lib/types";

export function useContact(id: string | undefined): Contact | undefined | null {
  return useLiveQuery(async () => {
    if (!id) return null;
    return (await db.contacts.get(id)) ?? null;
  }, [id]);
}
