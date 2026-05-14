import withSerwistInit from "@serwist/next";

// Every static-exported route. We hand these to Serwist's
// `additionalPrecacheEntries` so the HTML is part of the SW's *compile-time*
// precache manifest — much more reliable than fetching at install time, and
// it means even the very first SW install caches every page without a single
// network round-trip beyond what Next.js already does.
//
// Keep in sync with the routes under `app/`. Revision strings only need to
// change when the route output changes; bumping the version invalidates the
// cache on update.
const REV = "smart-phonebook-v2";
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
];

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: APP_ROUTES.map((url) => ({ url, revision: REV })),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
