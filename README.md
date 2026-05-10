# Smart Phonebook PWA

A fast, **offline-first** phonebook web app that looks and feels like a native mobile app. Built with Next.js 16 + React 19 + Tailwind v4 + Dexie (IndexedDB) + Serwist (service worker). Hosted as a static export on Netlify.

## Features

### Core
- Manage contacts with name, mobile, address, company, email, website, description.
- A–Z grouped contacts list with live search.
- Tap **Call** to open the phone's native dialer (`tel:` URI).
- Tap **WhatsApp** beside Call to open a WhatsApp chat with the same number (`wa.me/<number>`).
- After the call ends and you return to the app, an auto-prompt asks for notes.
- Full timeline of past calls + notes per contact (view, edit, delete).
- Recent calls screen — grouped per contact with call count and the latest note.
- Light / Dark / System theme.

### Import / backup
- **Import from phone** — Web Contact Picker API on Android Chrome (native OS picker, the user chooses which contacts to share).
- **Import vCard (.vcf)** — works on every platform. Parses the file in-browser, then opens a checkbox sheet so the user can select all or just specific contacts. Search inside the picker.
- Auto-deduplicates by mobile number on import.
- **JSON export & import** for full backup, with iOS-friendly Web Share fallback.

### Platform / privacy
- Installable as a PWA, fully offline-capable (service worker precaches the app shell, runtime fallbacks handle dynamic routes).
- **Per-device storage** — your data lives only in this browser (no cloud, no login).
- Persistent storage requested via `navigator.storage.persist()` so installed PWAs are not subject to automatic eviction.
- App menu (kebab in the top-right) with: About, Help & FAQ, Share App, Privacy Policy, Terms of Use, Open Source.
- Beautiful orange-gradient splash screen on each cold launch (sessionStorage-gated — does not show on every navigation).
- HTTP-context warning banner so a contributor never wonders why install/SW are silently disabled on a LAN URL.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `output: 'export'`) |
| UI | Tailwind CSS v4 + Motion (Framer Motion) + Lucide icons |
| Storage | Dexie 4 (IndexedDB) — per browser |
| PWA | Serwist (`@serwist/next`) |
| Hosting | Netlify (static) |

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Use Chrome DevTools → toggle device toolbar → "iPhone 14 Pro" / "Pixel 7" for the mobile-app feel.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR (service worker disabled in dev — that's intentional) |
| `npm run build` | Static export → `out/` (icons regenerated from `scripts/generate-icons.mjs` first) |
| `npm start` / `npm run serve` | Serve the built `out/` on http://localhost:3000 |
| `npm run preview` | Build + serve in one step (use this to test PWA / offline / install banner) |
| `npm run icons` | Regenerate the PWA icon set |

## Build & deploy

```bash
npm run build        # outputs ./out
```

Then deploy to Netlify (the included `netlify.toml` configures the build, headers, and dynamic-route rewrites).

## Test the call flow on a real device

1. Build and serve over HTTPS (Netlify deploy preview, or `ngrok http 3000`).
2. Open the URL on Android/iPhone → "Add to Home Screen" to install as a PWA.
3. Open a contact → tap **Call** → confirm the dialer opens.
4. End or cancel the call → return to the app → the **Add notes** sheet appears automatically.
5. Save the notes → they appear in the contact's call history.

## Test contact import

- **Android Chrome over HTTPS**: Settings → Pick from phone → OS-native picker.
- **Any platform**: export contacts from your phone or Google Contacts as `.vcf` → Settings → Import vCard file → checkbox-pick → Import.
  - iPhone: Contacts → Share → vCard.
  - Android: Contacts → Settings → Export → save as .vcf.
  - Google Contacts: contacts.google.com → Export → vCard.

## Verify offline

After install, turn off Wi-Fi + mobile data, relaunch the PWA — the app loads from the service worker cache and all CRUD still works (data lives in IndexedDB, not the network). Direct navigation to deep URLs like `/contact/abc/` while offline is handled by the SW's pattern-matched fallbacks.

## Why HTTPS matters

PWA features (install banner, service worker, persistent storage, Contact Picker API) only work over **HTTPS** or `localhost`. When you visit the dev server over a LAN IP (`http://192.168.x.x:3000`) those features are silently disabled by the browser. The app surfaces a dark hint banner in that case.

For real mobile testing, either:
- Use a tunnel: `npx localtunnel --port 3000` or `ngrok http 3000`.
- Or push and test on the Netlify preview URL.

## Data backup

`Settings → Export to JSON` downloads `smart-phonebook-backup-YYYY-MM-DD.json` containing all contacts and call logs. `Import` merges by id (existing ids are overwritten with imported values). On iOS this uses the native Web Share sheet so the JSON can be saved to Files / sent via AirDrop.

## Bundle size

The whole app (HTML + JS + CSS + icons + service worker) is **~2.2 MB** unzipped. Service worker bundle is ~44 KB.
