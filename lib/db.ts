import Dexie, { type Table } from "dexie";
import type { Contact, CallLog } from "./types";

class SmartPhonebookDB extends Dexie {
  contacts!: Table<Contact, string>;
  callLogs!: Table<CallLog, string>;

  constructor() {
    super("smart-phonebook");
    this.version(1).stores({
      contacts: "id, name, mobile, updatedAt",
      callLogs: "id, contactId, startedAt",
    });
  }
}

let _db: SmartPhonebookDB | null = null;

export function getDB(): SmartPhonebookDB {
  if (typeof window === "undefined") {
    throw new Error("Dexie can only run in the browser");
  }
  if (!_db) _db = new SmartPhonebookDB();
  return _db;
}

export const db = new Proxy({} as SmartPhonebookDB, {
  get(_t, prop) {
    return Reflect.get(getDB(), prop);
  },
});
