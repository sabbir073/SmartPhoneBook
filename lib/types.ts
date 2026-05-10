export type Contact = {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  company?: string;
  email?: string;
  website?: string;
  description?: string;
  avatarColor: string;
  createdAt: number;
  updatedAt: number;
};

export type CallLog = {
  id: string;
  contactId: string;
  startedAt: number;
  endedAt: number;
  notes: string;
  createdAt: number;
};

export type PendingCall = {
  contactId: string;
  startedAt: number;
};

export type BackupPayload = {
  app: "smart-phonebook";
  version: 1;
  exportedAt: number;
  contacts: Contact[];
  callLogs: CallLog[];
};
