"use client";
import { useRef, useState } from "react";
import {
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  Database,
  Info,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  ContactRound,
  FileText,
} from "lucide-react";
import { AppBar } from "@/components/AppBar";
import { ContactPickerSheet } from "@/components/ContactPickerSheet";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  exportAll,
  shareOrDownloadBackup,
  importBackup,
  readJSONFile,
} from "@/lib/exportImport";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useStoragePersistence } from "@/hooks/useStoragePersistence";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { parseVCard, type ParsedContact } from "@/lib/vcard";
import {
  importParsedContacts,
  isContactPickerSupported,
  pickFromPhone,
} from "@/lib/importContacts";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const vcardInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickable, setPickable] = useState<ParsedContact[]>([]);
  const pickerSupported = isContactPickerSupported();

  const contactCount = useLiveQuery(() => db.contacts.count(), []);
  const callCount = useLiveQuery(() => db.callLogs.count(), []);
  const storage = useStoragePersistence();
  const install = useInstallPrompt();

  const handleExport = async () => {
    setBusy("export");
    setMsg(null);
    try {
      const data = await exportAll();
      const total = data.contacts.length + data.callLogs.length;
      const result = await shareOrDownloadBackup(data);
      setMsg({
        kind: "ok",
        text:
          result === "shared"
            ? `Shared backup of ${data.contacts.length} contacts.`
            : `Downloaded backup with ${data.contacts.length} contacts and ${data.callLogs.length} call logs (${total} records).`,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setBusy(null);
        return;
      }
      setMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Export failed",
      });
    } finally {
      setBusy(null);
    }
  };

  const handlePickFromPhone = async () => {
    setBusy("pick");
    setMsg(null);
    try {
      const parsed = await pickFromPhone();
      if (parsed.length === 0) {
        setMsg({ kind: "ok", text: "No contacts selected." });
        return;
      }
      const result = await importParsedContacts(parsed);
      setMsg({
        kind: "ok",
        text: `Imported ${result.added} contact${result.added === 1 ? "" : "s"}${result.skipped ? `, skipped ${result.skipped} duplicate${result.skipped === 1 ? "" : "s"}` : ""}.`,
      });
    } catch (e) {
      setMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Failed to pick contacts",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleVCardFile = async (file: File) => {
    setBusy("vcard");
    setMsg(null);
    try {
      const text = await file.text();
      const parsed = parseVCard(text);
      if (parsed.length === 0) {
        setMsg({
          kind: "err",
          text: "No contacts found in this file. Make sure it's a valid vCard (.vcf).",
        });
        return;
      }
      setPickable(parsed);
      setPickerOpen(true);
    } catch (e) {
      setMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Could not read the file",
      });
    } finally {
      setBusy(null);
      if (vcardInput.current) vcardInput.current.value = "";
    }
  };

  const handleImportFile = async (file: File) => {
    setBusy("import");
    setMsg(null);
    try {
      const data = await readJSONFile(file);
      const result = await importBackup(data, "merge");
      setMsg({
        kind: "ok",
        text: `Imported ${result.contactsAdded} contacts and ${result.callLogsAdded} call logs.`,
      });
    } catch (e) {
      setMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Import failed",
      });
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <>
      <AppBar title="Settings" />

      <Section title="Appearance">
        <ThemeRow
          icon={<Sun size={18} />}
          label="Light"
          value="light"
          current={theme}
          onSelect={setTheme}
        />
        <ThemeRow
          icon={<Moon size={18} />}
          label="Dark"
          value="dark"
          current={theme}
          onSelect={setTheme}
        />
        <ThemeRow
          icon={<Monitor size={18} />}
          label="System"
          value="system"
          current={theme}
          onSelect={setTheme}
        />
      </Section>

      <Section title="Import contacts">
        <Row
          icon={<ContactRound size={20} />}
          title="Pick from phone"
          subtitle={
            pickerSupported
              ? "Use your phone's native contact picker (Android Chrome)."
              : "Not supported here — use Chrome on Android, or import a vCard."
          }
          onClick={handlePickFromPhone}
          disabled={!pickerSupported || busy === "pick"}
        />
        <Row
          icon={<FileText size={20} />}
          title="Import vCard file (.vcf)"
          subtitle="From iPhone, Google Contacts, Outlook — pick which to import."
          onClick={() => vcardInput.current?.click()}
          disabled={busy === "vcard"}
        />
        <input
          ref={vcardInput}
          type="file"
          accept=".vcf,text/vcard,text/x-vcard"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleVCardFile(f);
          }}
        />
      </Section>

      <Section title="Backup">
        <Row
          icon={<Download size={20} />}
          title="Export to JSON"
          subtitle="Download all contacts and call notes."
          onClick={handleExport}
          disabled={busy === "export"}
        />
        <Row
          icon={<Upload size={20} />}
          title="Import from JSON"
          subtitle="Restore from a previous backup (merges by id)."
          onClick={() => fileInput.current?.click()}
          disabled={busy === "import"}
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
          }}
        />
      </Section>

      {msg && (
        <div
          className="mx-4 my-3 px-3 py-2 rounded-lg text-sm"
          style={{
            background:
              msg.kind === "ok"
                ? "color-mix(in oklab, var(--color-accent) 14%, transparent)"
                : "color-mix(in oklab, var(--color-danger) 14%, transparent)",
            color:
              msg.kind === "ok"
                ? "var(--color-accent)"
                : "var(--color-danger)",
          }}
        >
          {msg.text}
        </div>
      )}

      <Section title="App">
        {!install.installed && (install.canInstall || install.iosInstructions) && (
          <Row
            icon={<Smartphone size={20} />}
            title="Install Smart Phonebook"
            subtitle="Add to your home screen for offline access."
            onClick={() => {
              if (install.canInstall) void install.promptInstall();
              else alert(
                "On iPhone: tap the Share button in Safari, then 'Add to Home Screen'.",
              );
            }}
          />
        )}
        {install.installed && (
          <InfoRow
            icon={<Smartphone size={18} />}
            label="Installed"
            value="Running as installed PWA"
          />
        )}
      </Section>

      <Section title="About">
        <InfoRow
          icon={<Database size={18} />}
          label="Data stored on this device"
          value={`${contactCount ?? 0} contacts · ${callCount ?? 0} call logs`}
        />
        <InfoRow
          icon={
            storage?.persistent ? (
              <ShieldCheck size={18} />
            ) : (
              <ShieldAlert size={18} />
            )
          }
          label="Storage protection"
          value={
            storage === null
              ? "Checking…"
              : storage.persistent
                ? "Persistent — data is safe until you uninstall or clear it"
                : "Standard — install the app to make data eviction-proof"
          }
        />
        {storage?.quota && storage?.usage !== undefined && (
          <InfoRow
            icon={<Info size={18} />}
            label="Storage used"
            value={`${formatBytes(storage.usage)} of ${formatBytes(storage.quota)} available`}
          />
        )}
        <InfoRow
          icon={<Info size={18} />}
          label="Storage scope"
          value="Per-browser IndexedDB · no cloud sync"
        />
      </Section>

      <p
        className="text-center text-xs px-6 py-6"
        style={{ color: "var(--color-text-muted)" }}
      >
        Smart Phonebook is a public app. Nothing leaves your device unless you export
        a backup file.
      </p>

      <ContactPickerSheet
        open={pickerOpen}
        contacts={pickable}
        onCancel={() => setPickerOpen(false)}
        onImport={async (selected) => {
          try {
            const result = await importParsedContacts(selected);
            setMsg({
              kind: "ok",
              text: `Imported ${result.added} contact${result.added === 1 ? "" : "s"}${result.skipped ? `, skipped ${result.skipped} duplicate${result.skipped === 1 ? "" : "s"}` : ""}.`,
            });
          } catch (e) {
            setMsg({
              kind: "err",
              text: e instanceof Error ? e.message : "Import failed",
            });
          } finally {
            setPickerOpen(false);
            setPickable([]);
          }
        }}
      />
    </>
  );
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4">
      <h2
        className="px-4 pb-1.5 text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {title}
      </h2>
      <div
        className="mx-3 rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="tap w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 disabled:opacity-60"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div style={{ color: "var(--color-primary)" }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        {subtitle && (
          <div
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
}

function ThemeRow({
  icon,
  label,
  value,
  current,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  value: Theme;
  current: Theme;
  onSelect: (t: Theme) => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className="tap w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        style={{
          color: active ? "var(--color-primary)" : "var(--color-text-muted)",
        }}
      >
        {icon}
      </div>
      <div className="flex-1 font-medium">{label}</div>
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: active
            ? "var(--color-primary)"
            : "var(--color-border)",
        }}
      >
        {active && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--color-primary)" }}
          />
        )}
      </div>
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div style={{ color: "var(--color-text-muted)" }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{label}</div>
        <div
          className="text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
