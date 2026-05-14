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

const isNavigate = (req: Request) => req.mode === "navigate";
const pathOf = (req: Request) => new URL(req.url).pathname;

const PAGES_CACHE = "smart-phonebook-pages";

// Every static-exported route in the app. We pre-fetch all of these
// during SW install so the whole app works offline on the very first
// launch — no need to visit a page once before it's cached.
//
// Keep this list in sync with new pages added under `app/`.
const APP_ROUTES = [
  "/",
  "/recent/",
  "/settings/",
  "/contact/new/",
  "/contact/_/",
  "/contact/_/edit/",
  "/contact/_/history/",
  "/about/",
  "/help/",
  "/privacy/",
  "/terms/",
  "/licenses/",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      // Fetch in parallel; one failure must not abort the rest.
      await Promise.all(
        APP_ROUTES.map(async (route) => {
          try {
            const res = await fetch(route, { cache: "reload" });
            if (res.ok) await cache.put(route, res.clone());
          } catch {
            /* offline at install time — that's fine, runtime cache will fill in later */
          }
        }),
      );
    })(),
  );
});

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
