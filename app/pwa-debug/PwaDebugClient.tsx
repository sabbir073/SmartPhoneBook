"use client";
import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, RefreshCw, Copy } from "lucide-react";
import { AppBar } from "@/components/AppBar";

type Status = "ok" | "fail" | "warn" | "info";

type Check = {
  key: string;
  label: string;
  status: Status;
  detail?: string;
};

type ManifestShape = {
  name?: string;
  short_name?: string;
  start_url?: string;
  scope?: string;
  display?: string;
  display_override?: string[];
  icons?: Array<{ src: string; sizes: string; purpose?: string; type?: string }>;
  prefer_related_applications?: boolean;
  file_handlers?: Array<{
    action: string;
    accept: Record<string, string[]>;
    launch_type?: string;
  }>;
  launch_handler?: { client_mode?: string };
  handle_links?: string;
  edge_side_panel?: { preferred_width?: number };
  shortcuts?: Array<{ name: string; url: string }>;
  screenshots?: Array<{ src: string; sizes: string; form_factor?: string }>;
};

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaDebugClient() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [rawManifest, setRawManifest] = useState<string>("");
  const [beforeInstallSeen, setBeforeInstallSeen] = useState(false);
  const [appInstalledSeen, setAppInstalledSeen] = useState(false);
  const [bipEvent, setBipEvent] = useState<BIPEvent | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setBeforeInstallSeen(true);
      setBipEvent(e as BIPEvent);
    };
    const onAI = () => setAppInstalledSeen(true);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onAI);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onAI);
    };
  }, []);

  useEffect(() => {
    void runChecks().then(({ checks: c, rawManifest: r }) => {
      setChecks(c);
      setRawManifest(r);
    });
  }, [refreshTick, beforeInstallSeen, appInstalledSeen]);

  const tryNativePrompt = async () => {
    if (!bipEvent) return;
    await bipEvent.prompt();
    setBipEvent(null);
  };

  return (
    <>
      <AppBar
        title="PWA Diagnostics"
        back
        right={
          <button
            onClick={() => setRefreshTick((n) => n + 1)}
            aria-label="Re-run checks"
            className="tap p-2 rounded-full active:bg-white/10"
          >
            <RefreshCw size={20} />
          </button>
        }
      />

      <div className="px-3 pt-3">
        <Banner
          ok={beforeInstallSeen || isStandalone()}
          okMsg={
            isStandalone()
              ? "Running as installed PWA"
              : "beforeinstallprompt fired — Chrome considers this app installable"
          }
          failMsg='Chrome has not fired beforeinstallprompt yet. This usually means "Add to Home Screen" is all you will see. The checks below show why.'
        />

        {bipEvent && (
          <button
            onClick={tryNativePrompt}
            className="tap w-full mt-3 py-3 rounded-full font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Trigger native install dialog now
          </button>
        )}
      </div>

      <Section title="Installability checks">
        {checks.length === 0 ? (
          <RowLine label="Running…" status="info" />
        ) : (
          checks.map((c) => (
            <RowLine
              key={c.key}
              label={c.label}
              status={c.status}
              detail={c.detail}
            />
          ))
        )}
      </Section>

      {rawManifest && (
        <Section title="Manifest (live)">
          <div className="px-4 py-3 flex items-start gap-3">
            <pre
              className="flex-1 text-[11px] leading-snug overflow-x-auto whitespace-pre-wrap break-words"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: 10,
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              {rawManifest}
            </pre>
            <button
              onClick={() => navigator.clipboard?.writeText(rawManifest)}
              aria-label="Copy manifest"
              className="tap p-2 rounded-full shrink-0"
              style={{
                color: "var(--color-primary)",
                background:
                  "color-mix(in oklab, var(--color-primary) 14%, transparent)",
              }}
            >
              <Copy size={16} />
            </button>
          </div>
        </Section>
      )}

      <Section title="Tips">
        <div
          className="px-4 py-3 text-sm space-y-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          <p>
            <strong>Already shown as installed?</strong> Long-press the home-screen icon and Uninstall, then come back here.
          </p>
          <p>
            <strong>Old verdict cached?</strong> Chrome → Settings → Site settings → All sites → this site → Clear &amp; reset.
          </p>
          <p>
            <strong>Skip the 30-second engagement wait:</strong> open{" "}
            <code>chrome://flags/#bypass-app-banner-engagement-checks</code>{" "}
            → Enabled → Relaunch.
          </p>
        </div>
      </Section>

      <div className="h-10" />
    </>
  );
}

async function runChecks(): Promise<{ checks: Check[]; rawManifest: string }> {
  const checks: Check[] = [];

  // HTTPS / secure context
  checks.push({
    key: "secure",
    label: "Secure context (HTTPS or localhost)",
    status: window.isSecureContext ? "ok" : "fail",
    detail: window.isSecureContext
      ? location.origin
      : "PWA install requires HTTPS. Use the deployed URL or a tunnel.",
  });

  // Service worker support + registration
  if (!("serviceWorker" in navigator)) {
    checks.push({
      key: "sw-support",
      label: "Service Worker API",
      status: "fail",
      detail: "Not supported in this browser.",
    });
  } else {
    const regs = await navigator.serviceWorker.getRegistrations();
    const ourReg = regs.find((r) => r.scope.startsWith(location.origin));
    const active = !!ourReg?.active;
    checks.push({
      key: "sw-registered",
      label: "Service Worker registered",
      status: active ? "ok" : regs.length ? "warn" : "fail",
      detail: active
        ? `scope: ${ourReg!.scope} · state: ${ourReg!.active!.state}`
        : regs.length
          ? "Registered but not active yet — close all tabs of this site and reopen."
          : "Not registered. Reload the page once over HTTPS to register it.",
    });

    if (ourReg?.active) {
      try {
        const res = await fetch("/sw.js", { cache: "no-cache" });
        const text = await res.text();
        const hasFetchListener =
          /addEventListener\s*\(\s*["']fetch["']/.test(text);
        checks.push({
          key: "sw-fetch-handler",
          label: 'SW has top-level addEventListener("fetch") (Chrome static check)',
          status: hasFetchListener ? "ok" : "fail",
          detail: hasFetchListener
            ? "Chrome's installability heuristic will see a fetch handler."
            : 'No top-level fetch listener detected — Chrome may downgrade to "Add to Home Screen".',
        });
      } catch {
        checks.push({
          key: "sw-fetch-handler",
          label: "SW source readable",
          status: "warn",
          detail: "Could not fetch /sw.js — runtime check only.",
        });
      }
    }
  }

  // Manifest
  let manifest: ManifestShape | null = null;
  let rawManifest = "";
  try {
    const res = await fetch("/manifest.webmanifest", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const ct = res.headers.get("content-type") || "";
    rawManifest = await res.text();
    try {
      manifest = JSON.parse(rawManifest) as ManifestShape;
    } catch (e) {
      checks.push({
        key: "manifest-parse",
        label: "Manifest is valid JSON",
        status: "fail",
        detail: e instanceof Error ? e.message : String(e),
      });
    }
    checks.push({
      key: "manifest-content-type",
      label: "Manifest served with correct Content-Type",
      status: ct.includes("manifest+json") || ct.includes("application/json")
        ? "ok"
        : "warn",
      detail: `Content-Type: ${ct || "(none)"}`,
    });
  } catch (e) {
    checks.push({
      key: "manifest-fetch",
      label: "Manifest is reachable",
      status: "fail",
      detail: e instanceof Error ? e.message : String(e),
    });
  }

  if (manifest) {
    checks.push({
      key: "manifest-name",
      label: "Manifest has name or short_name",
      status: manifest.name || manifest.short_name ? "ok" : "fail",
      detail: `name="${manifest.name ?? ""}", short_name="${manifest.short_name ?? ""}"`,
    });
    checks.push({
      key: "manifest-start-url",
      label: "Manifest has start_url",
      status: manifest.start_url ? "ok" : "fail",
      detail: manifest.start_url,
    });
    const validDisplay = ["standalone", "fullscreen", "minimal-ui"];
    checks.push({
      key: "manifest-display",
      label: "Manifest display is installable value",
      status: manifest.display && validDisplay.includes(manifest.display)
        ? "ok"
        : "fail",
      detail: `display="${manifest.display}"`,
    });
    checks.push({
      key: "manifest-prefer-related",
      label: "prefer_related_applications not true",
      status: manifest.prefer_related_applications === true ? "fail" : "ok",
      detail:
        manifest.prefer_related_applications === undefined
          ? "(not set — fine)"
          : `set to ${manifest.prefer_related_applications}`,
    });

    const icons = manifest.icons ?? [];
    const any192 = icons.some(
      (i) =>
        (i.purpose ?? "any").split(/\s+/).includes("any") &&
        i.sizes?.split(/\s+/).includes("192x192"),
    );
    const any512 = icons.some(
      (i) =>
        (i.purpose ?? "any").split(/\s+/).includes("any") &&
        i.sizes?.split(/\s+/).includes("512x512"),
    );
    checks.push({
      key: "manifest-icons",
      label: 'Icons include 192 + 512 PNG with purpose:"any"',
      status: any192 && any512 ? "ok" : "fail",
      detail: `192="${any192 ? "✓" : "missing"}" 512="${any512 ? "✓" : "missing"}"`,
    });

    // Verify those icon files actually resolve
    for (const want of ["192x192", "512x512"]) {
      const icon = icons.find(
        (i) =>
          (i.purpose ?? "any").split(/\s+/).includes("any") &&
          i.sizes?.split(/\s+/).includes(want),
      );
      if (icon) {
        try {
          const r = await fetch(icon.src, { cache: "no-cache" });
          checks.push({
            key: "icon-" + want,
            label: `Icon ${want} loads`,
            status: r.ok ? "ok" : "fail",
            detail: `${icon.src} → HTTP ${r.status}`,
          });
        } catch (e) {
          checks.push({
            key: "icon-" + want,
            label: `Icon ${want} loads`,
            status: "fail",
            detail: e instanceof Error ? e.message : String(e),
          });
        }
      }
    }
  }

  if (manifest) {
    // Modern manifest fields — informational. None of these affect basic
    // installability (Chrome ignores unknown fields), but it's useful to
    // see whether they're actually being served + parsed correctly.
    if (manifest.file_handlers && manifest.file_handlers.length > 0) {
      const accepts = manifest.file_handlers
        .flatMap((h) => Object.keys(h.accept))
        .join(", ");
      checks.push({
        key: "modern-file-handlers",
        label: "file_handlers",
        status: "info",
        detail: `${manifest.file_handlers.length} handler(s) · accept: ${accepts}`,
      });
    }
    if (manifest.launch_handler) {
      checks.push({
        key: "modern-launch-handler",
        label: "launch_handler",
        status: "info",
        detail: `client_mode: ${manifest.launch_handler.client_mode ?? "(default)"}`,
      });
    }
    if (manifest.handle_links) {
      checks.push({
        key: "modern-handle-links",
        label: "handle_links",
        status: "info",
        detail: manifest.handle_links,
      });
    }
    if (manifest.edge_side_panel) {
      checks.push({
        key: "modern-edge-side-panel",
        label: "edge_side_panel",
        status: "info",
        detail: `preferred_width: ${manifest.edge_side_panel.preferred_width ?? "(default)"}`,
      });
    }
    if (manifest.shortcuts) {
      checks.push({
        key: "modern-shortcuts",
        label: "shortcuts (long-press menu)",
        status: "info",
        detail: `${manifest.shortcuts.length}: ${manifest.shortcuts.map((s) => s.name).join(", ")}`,
      });
    }
    if (manifest.screenshots) {
      checks.push({
        key: "modern-screenshots",
        label: "screenshots (rich install dialog)",
        status: "info",
        detail: `${manifest.screenshots.length} (${manifest.screenshots.map((s) => s.form_factor).filter(Boolean).join(", ")})`,
      });
    }

    // launchQueue API availability — needed for file_handlers to actually
    // deliver files into the app.
    const hasLaunchQueue =
      typeof (window as unknown as { launchQueue?: unknown }).launchQueue !==
      "undefined";
    checks.push({
      key: "launch-queue-api",
      label: "launchQueue API (needed for file_handlers)",
      status: hasLaunchQueue ? "ok" : "warn",
      detail: hasLaunchQueue
        ? "Available — .vcf files will open in this app once installed."
        : "Not available in this browser. file_handlers won't deliver files.",
    });
  }

  // Currently running as installed PWA?
  checks.push({
    key: "display-mode",
    label: "Display mode",
    status: "info",
    detail: isStandalone()
      ? "standalone — running as installed PWA"
      : "browser tab",
  });

  return { checks, rawManifest };
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.matchMedia?.("(display-mode: fullscreen)").matches) return true;
  if (window.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
  if ((navigator as unknown as { standalone?: boolean }).standalone === true)
    return true;
  return false;
}

function Banner({
  ok,
  okMsg,
  failMsg,
}: {
  ok: boolean;
  okMsg: string;
  failMsg: string;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{
        background: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
        color: ok ? "#15803d" : "#b91c1c",
        border: `1px solid ${ok ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)"}`,
      }}
    >
      {ok ? (
        <Check size={20} className="mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
      )}
      <div className="text-sm leading-snug">{ok ? okMsg : failMsg}</div>
    </div>
  );
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

function RowLine({
  label,
  status,
  detail,
}: {
  label: string;
  status: Status;
  detail?: string;
}) {
  const color =
    status === "ok"
      ? "#16a34a"
      : status === "fail"
        ? "#ef4444"
        : status === "warn"
          ? "#f59e0b"
          : "var(--color-text-muted)";
  const Icon =
    status === "ok"
      ? Check
      : status === "fail"
        ? X
        : status === "warn"
          ? AlertTriangle
          : RefreshCw;
  return (
    <div
      className="flex items-start gap-3 px-4 py-2.5 border-b last:border-b-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div style={{ color, marginTop: 2 }}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{label}</div>
        {detail && (
          <div
            className="text-xs mt-0.5 break-words"
            style={{ color: "var(--color-text-muted)" }}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
