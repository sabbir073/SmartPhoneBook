"use client";
import { useState, type FormEvent } from "react";
import {
  User,
  Phone,
  MapPin,
  Building2,
  Mail,
  Globe,
  FileText,
} from "lucide-react";
import type { Contact } from "@/lib/types";
import type { ContactInput } from "@/lib/contacts";

type Props = {
  initial?: Partial<Contact>;
  submitLabel: string;
  onSubmit: (input: ContactInput) => Promise<void> | void;
  onCancel?: () => void;
};

type FieldProps = {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function Field({
  icon: Icon,
  label,
  required,
  type = "text",
  value,
  onChange,
  multiline,
  inputMode,
}: FieldProps) {
  return (
    <label
      className="flex gap-3 items-start px-4 py-3 border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <Icon
        size={20}
        style={{ color: "var(--color-text-muted)", marginTop: 4 }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-medium mb-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
          {required && <span style={{ color: "var(--color-danger)" }}> *</span>}
        </div>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full text-base resize-none"
            style={{ color: "var(--color-text)" }}
          />
        ) : (
          <input
            type={type}
            inputMode={inputMode}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base"
            style={{ color: "var(--color-text)" }}
          />
        )}
      </div>
    </label>
  );
}

export function ContactForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim() || undefined,
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-6">
      <div
        className="mx-3 mt-3 rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
      >
        <Field icon={User} label="Name" required value={name} onChange={setName} />
        <Field
          icon={Phone}
          label="Mobile number"
          type="tel"
          inputMode="tel"
          value={mobile}
          onChange={setMobile}
        />
        <Field
          icon={MapPin}
          label="Address"
          value={address}
          onChange={setAddress}
          multiline
        />
        <Field icon={Building2} label="Company" value={company} onChange={setCompany} />
        <Field
          icon={Mail}
          label="Email"
          type="email"
          inputMode="email"
          value={email}
          onChange={setEmail}
        />
        <Field
          icon={Globe}
          label="Website"
          inputMode="url"
          value={website}
          onChange={setWebsite}
        />
        <Field
          icon={FileText}
          label="Description / Notes"
          value={description}
          onChange={setDescription}
          multiline
        />
      </div>

      {error && (
        <div
          className="mx-4 mt-3 px-3 py-2 rounded-lg text-sm"
          style={{
            background: "color-mix(in oklab, var(--color-danger) 12%, transparent)",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}

      <div className="px-4 mt-5 flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="tap flex-1 py-3 rounded-full font-medium"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="tap flex-1 py-3 rounded-full font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
