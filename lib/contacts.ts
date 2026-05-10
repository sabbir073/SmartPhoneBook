import { db } from "./db";
import { uid } from "./uid";
import { colorFromName } from "./avatar";
import type { Contact } from "./types";

export type ContactInput = Omit<
  Contact,
  "id" | "createdAt" | "updatedAt" | "avatarColor"
>;

export async function createContact(input: ContactInput): Promise<Contact> {
  const now = Date.now();
  const contact: Contact = {
    id: uid(),
    avatarColor: colorFromName(input.name),
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  await db.contacts.add(contact);
  return contact;
}

export async function updateContact(
  id: string,
  patch: Partial<ContactInput>,
): Promise<void> {
  const updates: Partial<Contact> = { ...patch, updatedAt: Date.now() };
  if (patch.name) updates.avatarColor = colorFromName(patch.name);
  await db.contacts.update(id, updates);
}

export async function deleteContact(id: string): Promise<void> {
  await db.transaction("rw", db.contacts, db.callLogs, async () => {
    await db.contacts.delete(id);
    await db.callLogs.where("contactId").equals(id).delete();
  });
}

export async function getContact(id: string): Promise<Contact | undefined> {
  return db.contacts.get(id);
}

export async function getAllContacts(): Promise<Contact[]> {
  const all = await db.contacts.toArray();
  return all.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
