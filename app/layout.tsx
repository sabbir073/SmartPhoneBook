import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Smart Phonebook",
  description: "A fast, offline-first mobile phonebook with call notes.",
  applicationName: "Smart Phonebook",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smart Phonebook",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/icons/favicon-32.png",
  },
  // Modern equivalent of apple-mobile-web-app-capable; Next.js doesn't
  // emit it automatically yet, so we add it explicitly so Chrome on Mac
  // and Edge consider the app "installable web app capable".
  other: {
    "mobile-web-app-capable": "yes",
    // Legacy iOS-specific meta; iOS Safari historically reads this one.
    // Next 16 doesn't emit it automatically — keep both for max compatibility.
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Smart Phonebook",
    // Tells Windows tiles + IE/Edge legacy what color to use.
    "msapplication-TileColor": "#f97316",
    "msapplication-TileImage": "/icons/icon-192.png",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
