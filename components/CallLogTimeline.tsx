"use client";
import { useState } from "react";
import { Phone, Pencil, Trash2, Check, X } from "lucide-react";
import type { CallLog } from "@/lib/types";
import { formatDateTime, formatDuration } from "@/lib/format";
import { updateCallLogNotes, deleteCallLog } from "@/lib/callLogs";

export function CallLogTimeline({ logs }: { logs: CallLog[] }) {
  if (logs.length === 0) {
    return (
      <div
        className="text-center py-8 text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        No call history yet.
        <br />
        Tap Call to start logging notes.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {logs.map((log) => (
        <CallLogItem key={log.id} log={log} />
      ))}
    </ul>
  );
}

function CallLogItem({ log }: { log: CallLog }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(log.notes);
  const duration = formatDuration(log.endedAt - log.startedAt);

  const save = async () => {
    await updateCallLogNotes(log.id, text.trim());
    setEditing(false);
  };

  const remove = async () => {
    if (confirm("Delete this call log?")) await deleteCallLog(log.id);
  };

  return (
    <li
      className="rounded-2xl p-3"
      style={{
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="rounded-full p-2 mt-0.5"
          style={{
            background:
              "color-mix(in oklab, var(--color-accent) 18%, transparent)",
            color: "var(--color-accent)",
          }}
        >
          <Phone size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-semibold">
              {formatDateTime(log.startedAt)}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              · {duration}
            </div>
          </div>
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              autoFocus
              placeholder="What did you talk about?"
              className="w-full mt-2 text-sm rounded-lg px-2 py-1.5"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          ) : (
            <p
              className="text-sm mt-1 whitespace-pre-wrap break-words"
              style={{
                color: log.notes
                  ? "var(--color-text)"
                  : "var(--color-text-muted)",
                fontStyle: log.notes ? "normal" : "italic",
              }}
            >
              {log.notes || "No notes added."}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {editing ? (
            <>
              <button
                onClick={save}
                aria-label="Save"
                className="tap p-1.5 rounded-full"
                style={{ color: "var(--color-accent)" }}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setText(log.notes);
                  setEditing(false);
                }}
                aria-label="Cancel"
                className="tap p-1.5 rounded-full"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit notes"
                className="tap p-1.5 rounded-full"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={remove}
                aria-label="Delete log"
                className="tap p-1.5 rounded-full"
                style={{ color: "var(--color-danger)" }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
