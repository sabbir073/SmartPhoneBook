import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Modern PWA manifest fields that Next.js's MetadataRoute.Manifest type
// doesn't ship typings for yet but real browsers (Chromium 102+) support.
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
    name: "Smart Phonebook",
    short_name: "Smart Phonebook",
    description: "A fast, offline-first mobile phonebook with call notes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff7ed",
    theme_color: "#f97316",
    icons: [
      // Common Android / Chromium sizes — purpose: "any".
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable variants for Android adaptive icons.
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
    // Chromium 102+. Tap a .vcf in Files / Mail / Drive → our app opens
    // and the launchQueue API delivers the file to AppShell.
    file_handlers: [
      {
        action: "/",
        accept: {
          "text/vcard": [".vcf"],
          "text/x-vcard": [".vcf"],
          "text/directory": [".vcf"],
        },
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
        launch_type: "single-client",
      },
    ],
    // Re-launching the home-screen icon focuses the existing window
    // instead of stacking new ones. Chromium 102+.
    launch_handler: { client_mode: "focus-existing" },
    // When the user clicks a link to our origin from another app,
    // open in the installed PWA. Chromium 96+.
    handle_links: "preferred",
    // Desktop Edge can host the app as a sidebar panel.
    edge_side_panel: { preferred_width: 480 },
  };
  return m;
}
