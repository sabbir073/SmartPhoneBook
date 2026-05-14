/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// IMPORTANT: explicit top-level fetch listener.
// Chrome's PWA installability check statically parses the SW source for
// `addEventListener('fetch', ...)` BEFORE the script runs. Serwist
// attaches its fetch listener later (inside addEventListeners()), so
// without this stub Chrome may decide there's no fetch handler and
// downgrade the install prompt to "Add to Home Screen".
//
// This listener is a no-op — Serwist's listener registers afterwards
// and handles the request. The empty handler is enough to pass the
// installability heuristic.
self.addEventListener("fetch", () => {
  /* see comment above — Serwist handles the real fetch work */
});

const isNavigate = (req: Request) => req.mode === "navigate";
const pathOf = (req: Request) => new URL(req.url).pathname;

const PAGES_CACHE = "smart-phonebook-pages";

// Routes are now precached at BUILD time via `additionalPrecacheEntries` in
// next.config.mjs — see APP_ROUTES there. That's faster and more reliable
// than fetching during the install event, because:
//   1. The HTML is part of Serwist's precache manifest, so Chrome's
//      installability check considers it cached.
//   2. There's no install-time network race.
//   3. Cache busting is handled per-revision.

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // Navigations: cache-first, so every page loads instantly from cache
    // and works offline. Updates arrive via SW skipWaiting/clientsClaim.
    {
      matcher: ({ request }) => isNavigate(request),
      handler: new CacheFirst({
        cacheName: PAGES_CACHE,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 365,
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Same-origin static assets (JS, CSS, images, fonts, manifest…).
    {
      matcher: ({ url, request }) =>
        url.origin === self.location.origin &&
        request.method === "GET" &&
        !isNavigate(request),
      handler: new CacheFirst({
        cacheName: "smart-phonebook-static",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 300,
            maxAgeSeconds: 60 * 60 * 24 * 365,
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Cross-origin (fonts/CDN) — stale-while-revalidate.
    {
      matcher: ({ url, request }) =>
        url.origin !== self.location.origin && request.method === "GET",
      handler: new StaleWhileRevalidate({
        cacheName: "smart-phonebook-cross-origin",
        plugins: [
          new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
  ],

  // Last-resort fallbacks for navigations that miss the cache entirely
  // (e.g. /contact/abc/ on first cold load while offline — that URL was
  // never visited, so it isn't in the cache). Serve the matching pre-
  // rendered placeholder HTML; the SPA reads the URL and renders the
  // right view.
  fallbacks: {
    entries: [
      {
        url: "/contact/_/edit/",
        matcher: ({ request }) =>
          isNavigate(request) &&
          /^\/contact\/[^/]+\/edit\/?$/.test(pathOf(request)),
      },
      {
        url: "/contact/_/history/",
        matcher: ({ request }) =>
          isNavigate(request) &&
          /^\/contact\/[^/]+\/history\/?$/.test(pathOf(request)),
      },
      {
        url: "/contact/_/",
        matcher: ({ request }) => {
          if (!isNavigate(request)) return false;
          const p = pathOf(request);
          return (
            /^\/contact\/[^/]+\/?$/.test(p) && !p.startsWith("/contact/new")
          );
        },
      },
      {
        url: "/",
        matcher: ({ request }) => isNavigate(request),
      },
    ],
  },
});

serwist.addEventListeners();
