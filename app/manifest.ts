import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * Manifest mirrors the shape that DID install correctly at commit
 * 8674ed7. We keep that minimal core (name, start_url, scope, display,
 * theme, and the 3 essential icons) and only LAYER ON additions that
 * are documented as installability-safe:
 *   - more icon sizes (purely visual quality)
 *   - screenshots (only enriches the install dialog, never blocks it)
 *   - shortcuts (long-press menu only)
 *
 * Fields deliberately NOT added back yet because they regressed install
 * on Android Chrome in our testing:
 *   - id            (Chrome derives a stable id from start_url; setting
 *                    it explicitly can mismatch and break re-install)
 *   - display_override
 *   - file_handlers (POST-MVP — add back once install is solid)
 *   - launch_handler
 *   - handle_links
 *   - edge_side_panel
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
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
      // Maskable variants for Android adaptive icons (no Chrome chrome overlay).
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
  };
}
