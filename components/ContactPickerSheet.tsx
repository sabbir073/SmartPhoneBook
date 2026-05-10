"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X, Search } from "lucide-react";
import type { ParsedContact } from "@/lib/vcard";
import { ContactAvatar } from "./ContactAvatar";
import { colorFromName } from "@/lib/avatar";

type Props = {
  open: boolean;
  contacts: ParsedContact[];
  onCancel: () => void;
  onImport: (selected: ParsedContact[]) => void | Promise<void>;
};

export function ContactPickerSheet({ open, contacts, onCancel, onImport }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-select everything when the sheet opens
  useEffect(() => {
    if (!open) return;
    setSelected(new Set(contacts.map((_, i) => i)));
    setQuery("");
    setSubmitting(false);
  }, [open, contacts]);

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts.map((c, i) => ({ c, i }));
    const q = query.toLowerCase();
    return contacts
      .map((c, i) => ({ c, i }))
      .filter(
        ({ c }) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.toLowerCase().includes(q),
      );
  }, [contacts, query]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every(({ i }) => selected.has(i));

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach(({ i }) => next.delete(i));
      } else {
        filtered.forEach(({ i }) => next.add(i));
      }
      return next;
    });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await onImport(contacts.filter((_, i) => selected.has(i)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) onCancel();
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl pb-safe pt-safe"
            style={{
              background: "var(--color-surface)",
              boxShadow: "0 -10px 32px rgba(0,0,0,0.18)",
              maxHeight: "92dvh",
              minHeight: "70dvh",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2 px-3 py-2 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                onClick={onCancel}
                disabled={submitting}
                aria-label="Cancel"
                className="tap p-2 rounded-full"
              >
                <X size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base leading-tight">
                  Select contacts
                </div>
                <div
                  className="text-xs leading-tight"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {selected.size} of {contacts.length} selected
                </div>
              </div>
              <button
                onClick={submit}
                disabled={submitting || selected.size === 0}
                className="tap px-4 py-2 rounded-full font-semibold text-white text-sm disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
              >
                {submitting ? "Importing…" : `Import (${selected.size})`}
              </button>
            </div>

            {/* Search + select-all */}
            <div
              className="flex items-center gap-2 px-3 py-2 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="flex items-center gap-2 px-3 flex-1 rounded-full"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  height: 38,
                }}
              >
                <Search
                  size={16}
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 text-sm w-full"
                  style={{ color: "var(--color-text)" }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                onClick={toggleAll}
                disabled={filtered.length === 0}
                className="tap text-sm font-semibold px-3 py-1.5 rounded-full"
                style={{
                  color: "var(--color-primary)",
                  background:
                    "color-mix(in oklab, var(--color-primary) 10%, transparent)",
                }}
              >
                {allFilteredSelected ? "None" : "All"}
              </button>
            </div>

            {/* List */}
            <ul className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <li
                  className="px-5 py-10 text-center text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No matches.
                </li>
              ) : (
                filtered.map(({ c, i }) => {
                  const checked = selected.has(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggle(i)}
                        className="tap w-full flex items-center gap-3 px-4 py-2.5 text-left active:bg-black/[0.03] dark:active:bg-white/[0.04]"
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            background: checked
                              ? "var(--color-primary)"
                              : "transparent",
                            border: `2px solid ${
                              checked
                                ? "var(--color-primary)"
                                : "var(--color-border)"
                            }`,
                          }}
                          aria-hidden
                        >
                          {checked && (
                            <Check size={14} color="#fff" strokeWidth={3} />
                          )}
                        </div>
                        <ContactAvatar
                          name={c.name}
                          color={colorFromName(c.name)}
                          size={36}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">
                            {c.name}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {c.mobile}
                            {c.company ? ` · ${c.company}` : ""}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
