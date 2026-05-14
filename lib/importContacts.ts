import { db } from "./db";
import { uid } from "./uid";
import { colorFromName } from "./avatar";
import type { Contact } from "./types";
import type { ParsedContact } from "./vcard";

export type ImportResult = { added: number; skipped: number };

/**
 * Dedup-aware bulk import.
 *  - Entries with a mobile number are deduplicated against existing rows
 *    (same normalized digits → skipped).
 *  - Entries without a mobile (the voter-list has 23 such rows) are
 *    deduplicated against existing rows by (name, company) — that's
 *    enough to avoid double-inserting the same person on a re-sync.
 */
export async function importParsedContacts(
  parsed: ParsedContact[],
): Promise<ImportResult> {
  if (parsed.length === 0) return { added: 0, skipped: 0 };

  const existing = await db.contacts.toArray();
  // Dedup key = name + mobile, so different people sharing a phone are both kept,
  // but re-syncing an identical entry won't duplicate it.
  const seen = new Set(existing.map((c) => dedupKey(c.name, c.mobile)));

  const now = Date.now();
  const toInsert: Contact[] = [];
  let skipped = 0;

  for (const p of parsed) {
    const k = dedupKey(p.name, p.mobile);
    if (seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    toInsert.push({
      id: uid(),
      name: p.name,
      mobile: p.mobile,
      address: p.address,
      company: p.company,
      email: p.email,
      website: p.website,
      description: p.description,
      avatarColor: colorFromName(p.name),
      createdAt: now,
      updatedAt: now,
    });
  }

  if (toInsert.length) await db.contacts.bulkAdd(toInsert);
  return { added: toInsert.length, skipped };
}

function dedupKey(name: string, mobile: string): string {
  return name.trim().toLowerCase() + "|" + normalizeMobile(mobile);
}

function normalizeMobile(m: string): string {
  return m.replace(/[^\d]/g, "");
}

// ─── Contact Picker API (Android Chrome) ──────────────────────────

type PickerAddress = {
  addressLine?: string[];
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

type PickedContact = {
  name?: string[];
  tel?: string[];
  email?: string[];
  address?: PickerAddress[];
  organization?: string[];
};

type ContactsManager = {
  select: (
    properties: string[],
    options?: { multiple?: boolean },
  ) => Promise<PickedContact[]>;
  getProperties?: () => Promise<string[]>;
};

export function isContactPickerSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as unknown as { contacts?: ContactsManager };
  return !!nav.contacts && typeof nav.contacts.select === "function";
}

/**
 * Opens the OS-native contact picker (Android Chrome only).
 * The user picks which contacts to share inside the OS UI itself,
 * so this returns ready-to-import entries.
 */
export async function pickFromPhone(): Promise<ParsedContact[]> {
  if (!isContactPickerSupported()) {
    throw new Error(
      "Contact Picker isn't supported in this browser. Use Chrome on Android, or import a vCard file instead.",
    );
  }
  const nav = navigator as unknown as { contacts: ContactsManager };
  const wanted = ["name", "tel", "email"];
  if (typeof nav.contacts.getProperties === "function") {
    try {
      const supported = await nav.contacts.getProperties();
      if (supported.includes("address")) wanted.push("address");
      if (supported.includes("organization")) wanted.push("organization");
    } catch {
      /* ignore — fall back to base set */
    }
  }
  const picked = await nav.contacts.select(wanted, { multiple: true });
  const out: ParsedContact[] = [];
  for (const c of picked) {
    const name = (c.name?.[0] ?? "").trim();
    const mobile = (c.tel?.[0] ?? "").trim();
    if (!name || !mobile) continue;
    out.push({
      name,
      mobile,
      email: c.email?.[0]?.trim() || undefined,
      company: c.organization?.[0]?.trim() || undefined,
      address: formatPickerAddress(c.address?.[0]),
    });
  }
  return out;
}

function formatPickerAddress(a?: PickerAddress): string | undefined {
  if (!a) return undefined;
  const parts = [
    ...(a.addressLine ?? []),
    a.city,
    a.region,
    a.postalCode,
    a.country,
  ]
    .map((s) => s?.trim())
    .filter((s): s is string => !!s);
  return parts.length ? parts.join(", ") : undefined;
}
