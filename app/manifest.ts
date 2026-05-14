import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?source=pwa",
    name: "Smart Phonebook",
    short_name: "Phonebook",
    description:
      "A fast, offline-first phonebook with call notes — works without internet.",
    start_url: "/?source=pwa",
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
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
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
    prefer_related_applications: false,
  };
}
