/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// IMPORTANT: explicit top-level fetch listener.
// Chrome's PWA installability check statically scans the SW source for
// `addEventListener('fetch', …)` BEFORE the script runs. Serwist attaches
// its real listener later (inside addEventListeners()), so without this
// stub Chrome may decide there's no fetch handler and downgrade the
// install prompt to "Add to Home Screen".
//
// The handler is a no-op — Serwist's listener registers afterwards and
// handles the request. The empty handler is enough to pass the
// installability heuristic.
self.addEventListener("fetch", () => {
  /* see comment above */
});

const isNavigate = (req: Request) => req.mode === "navigate";
const pathOf = (req: Request) => new URL(req.url).pathname;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Use Serwist's curated default strategies. This matches the
  // configuration that was installing correctly at commit 8674ed7.
  // Custom CacheFirst-for-everything was too aggressive and may have
  // confused Chrome's installability runtime check on first visit.
  runtimeCaching: defaultCache,

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
