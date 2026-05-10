"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Phone,
  MapPin,
  Building2,
  Mail,
  Globe,
  FileText,
  Pencil,
  Trash2,
  History,
} from "lucide-react";
import { AppBar } from "@/components/AppBar";
import { ContactAvatar } from "@/components/ContactAvatar";
import { CallButton } from "@/components/CallButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CallLogTimeline } from "@/components/CallLogTimeline";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { useContact } from "@/hooks/useContact";
import { useCallLogs } from "@/hooks/useCallLogs";
import { deleteContact } from "@/lib/contacts";
import { telHref } from "@/lib/format";

function idFromPath(path: string): string {
  const m = path.match(/^\/contact\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : "_";
}

export default function ContactDetailsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const id = idFromPath(pathname || "");
  const contact = useContact(id !== "_" ? id : undefined);
  const logs = useCallLogs(id !== "_" ? id : undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (contact === null) {
    return (
      <>
        <AppBar title="Not found" back />
        <div
          className="text-center py-16 px-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          This contact no longer exists.
        </div>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <AppBar title="Contact" back />
        <div
          className="text-center py-12 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading…
        </div>
      </>
    );
  }

  const recentLogs = (logs ?? []).slice(0, 3);

  return (
    <>
      <AppBar
        title={contact.name}
        back
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/contact/${contact.id}/edit`)}
              aria-label="Edit"
              className="tap p-2 rounded-full active:bg-white/10"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete"
              className="tap p-2 rounded-full active:bg-white/10"
            >
              <Trash2 size={20} />
            </button>
          </div>
        }
      />

      <section
        className="px-4 pt-5 pb-6 -mb-3 rounded-b-3xl flex flex-col items-center gap-3"
        style={{
          background: "var(--gradient-primary-deep)",
          color: "#fff",
        }}
      >
        <ContactAvatar
          name={contact.name}
          color={contact.avatarColor}
          size={84}
        />
        <h1 className="text-xl font-semibold mt-1 text-center">
          {contact.name}
        </h1>
        {contact.company && (
          <div className="text-sm opacity-90 -mt-2">{contact.company}</div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <CallButton contactId={contact.id} mobile={contact.mobile} />
          <WhatsAppButton mobile={contact.mobile} />
        </div>
      </section>

      <section
        className="mx-3 mt-5 rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <InfoRow
          icon={<Phone size={18} />}
          label="Mobile"
          value={contact.mobile}
          href={telHref(contact.mobile)}
        />
        {contact.address && (
          <InfoRow
            icon={<MapPin size={18} />}
            label="Address"
            value={contact.address}
          />
        )}
        {contact.company && (
          <InfoRow
            icon={<Building2 size={18} />}
            label="Company"
            value={contact.company}
          />
        )}
        {contact.email && (
          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={contact.email}
            href={`mailto:${contact.email}`}
          />
        )}
        {contact.website && (
          <InfoRow
            icon={<Globe size={18} />}
            label="Website"
            value={contact.website}
            href={
              contact.website.startsWith("http")
                ? contact.website
                : `https://${contact.website}`
            }
            external
          />
        )}
        {contact.description && (
          <InfoRow
            icon={<FileText size={18} />}
            label="Description"
            value={contact.description}
            multiline
          />
        )}
      </section>

      <section className="mt-5 px-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Call notes
          </h2>
          {(logs?.length ?? 0) > 3 && (
            <button
              onClick={() => router.push(`/contact/${contact.id}/history`)}
              className="tap text-sm flex items-center gap-1"
              style={{ color: "var(--color-primary)" }}
            >
              <History size={14} />
              View all ({logs!.length})
            </button>
          )}
        </div>
        <CallLogTimeline logs={recentLogs} />
      </section>

      <div className="h-8" />

      <ConfirmSheet
        open={confirmDelete}
        title={`Delete ${contact.name}?`}
        message="This contact and all its call notes will be permanently removed from this device."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteContact(contact.id);
          router.replace("/");
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  external,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  multiline?: boolean;
}) {
  const inner = (
    <>
      <div style={{ color: "var(--color-text-muted)", marginTop: 2 }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </div>
        <div
          className={multiline ? "whitespace-pre-wrap break-words" : "truncate"}
          style={{ color: href ? "var(--color-primary)" : "var(--color-text)" }}
        >
          {value}
        </div>
      </div>
    </>
  );

  const className =
    "tap flex items-start gap-3 px-4 py-3 border-b last:border-b-0 active:bg-black/[0.03] dark:active:bg-white/[0.04]";
  const style = { borderColor: "var(--color-border)" } as const;

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
        style={style}
      >
        {inner}
      </a>
    );
  }
  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
}
