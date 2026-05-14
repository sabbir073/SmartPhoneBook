import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Modern PWA manifest fields that Next.js's MetadataRoute.Manifest type
// doesn't ship yet (May 2026) but real browsers support.
type ModernManifestExtras = {
  file_handlers?: Array<{
    action: string;
    accept: Record<string, string[]>;
    icons?: Array<{ src: string; sizes: string }>;
    launch_type?: "single-client" | "multiple-clients";
  }>;
  launch_handler?: {
    client_mode?:
      | "auto"
      | "navigate-new"
      | "navigate-existing"
      | "focus-existing";
  };
  handle_links?: "auto" | "preferred" | "not-preferred";
  edge_side_panel?: { preferred_width?: number };
};

export default function manifest(): MetadataRoute.Manifest {
  const m: MetadataRoute.Manifest & ModernManifestExtras = {
    // Stable identity URL — once installed the browser uses this to
    // recognise the same app on re-install. Keep it path-only (no query
    // string) so Chrome's start_url equality check during install
    // validation passes.
    id: "/",
    name: "Smart Phonebook",
    short_name: "Phonebook",
    description:
      "A fast, offline-first phonebook with call notes — works without internet.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#fff7ed",
    theme_color: "#f97316",
    categories: ["productivity", "utilities", "business"],
    lang: "en",
    dir: "ltr",
    icons: [
      // "any" purpose — full set of common sizes Chrome looks up.
      { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png", purpose: "any" },
      { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png", purpose: "any" },
      { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png", purpose: "any" },
      { src: "/icons/icon-144.png", sizes: "144x144", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable variants — required for Android adaptive icons.
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/icons/screenshot-narrow.png",
        sizes: "540x1170",
        type: "image/png",
        form_factor: "narrow",
        label: "Smart Phonebook on mobile",
      },
      {
        src: "/icons/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Smart Phonebook on desktop",
      },
    ],
    shortcuts: [
      {
        name: "Add contact",
        short_name: "Add",
        description: "Open the new-contact form",
        url: "/contact/new",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Recent calls",
        short_name: "Recent",
        description: "See your call history",
        url: "/recent",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
    // Register Smart Phonebook as the OS-level handler for vCard files.
    // Tap a .vcf in Files / Mail / Drive → app opens and the launchQueue
    // API delivers the file to AppShell's consumer.
    file_handlers: [
      {
        action: "/?source=file",
        accept: {
          "text/vcard": [".vcf"],
          "text/x-vcard": [".vcf"],
          "text/directory": [".vcf"],
        },
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
        launch_type: "single-client",
      },
    ],
    // Reopen the existing window when the user re-launches the icon
    // instead of stacking new windows.
    launch_handler: { client_mode: "focus-existing" },
    // Clicking a link to our origin opens in the installed PWA when
    // the user has it installed.
    handle_links: "preferred",
    // Desktop Edge can host the app as a sidebar panel.
    edge_side_panel: { preferred_width: 480 },
    // NB: do NOT set `prefer_related_applications` here. Some Chrome
    // versions treat its mere presence (even when false) as a hint to
    // suppress the install banner. Leaving it omitted is equivalent to
    // false but avoids the heuristic.
  };
  return m;
}
