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

const isNavigate = (req: Request) => req.mode === "navigate";
const pathOf = (req: Request) => new URL(req.url).pathname;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // When offline, map dynamic [id] routes back to the precached
  // placeholder HTML so the SPA can read the URL and render correctly.
  // Order matters: most specific patterns first.
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
