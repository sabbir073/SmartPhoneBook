"use client";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { ContactAvatar } from "./ContactAvatar";
import { useContact } from "@/hooks/useContact";
import { formatDuration } from "@/lib/format";
import type { PendingCall } from "@/lib/types";

export function NotesBottomSheet({
  pending,
  onSave,
  onDismiss,
}: {
  pending: PendingCall | null;
  onSave: (notes: string) => Promise<void> | void;
  onDismiss: () => Promise<void> | void;
}) {
  const contact = useContact(pending?.contactId);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pending) setNotes("");
  }, [pending?.contactId, pending?.startedAt]);

  const open = !!pending && !!contact;
  const duration = pending
    ? formatDuration(Date.now() - pending.startedAt)
    : "";

  const close = () => {
    if (submitting) return;
    void onDismiss();
  };

  const save = async () => {
    setSubmitting(true);
    try {
      await onSave(notes);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={close}>
      {contact && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <ContactAvatar
              name={contact.name}
              color={contact.avatarColor}
              size={48}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{contact.name}</div>
              <div
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Phone size={12} /> Call ended · {duration}
              </div>
            </div>
          </div>
          <h2 className="text-base font-semibold mb-1">
            Add notes from this call
          </h2>
          <p
            className="text-sm mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            What did you talk about? You can edit this later.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            autoFocus
            placeholder="e.g. Discussed delivery schedule for next week…"
            className="w-full text-base rounded-xl px-3 py-2.5"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={close}
              disabled={submitting}
              className="tap flex-1 py-3 rounded-full font-medium disabled:opacity-60"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text)",
              }}
            >
              Skip
            </button>
            <button
              onClick={save}
              disabled={submitting}
              className="tap flex-1 py-3 rounded-full font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--color-primary)" }}
            >
              {submitting ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
