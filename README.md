# Smart Phonebook PWA

A fast, **offline-first** phonebook web app that looks and feels like a native mobile app. Built with Next.js 16 + React 19 + Tailwind v4 + Dexie (IndexedDB) + Serwist (service worker). Hosted as a static export on Netlify.

## Features

- Manage contacts: name, mobile, address, company, email, website, description.
- A–Z grouped contacts list with live search.
- Tap **Call** to open the phone's native dialer (`tel:` URI).
- After the call ends and you return to the app, an auto-prompt asks for notes.
- Full timeline of past calls + notes per contact.
- Recent calls across all contacts.
- Light / Dark / System theme.
- JSON export & import (backup).
- Installable as a PWA, fully offline-capable.
- **Per-device storage** — your data lives only in this browser (no cloud, no login).

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

## Verify offline

After install, turn off Wi-Fi + mobile data, relaunch the PWA — the app loads from the service worker cache and all CRUD still works (data lives in IndexedDB, not the network).

## Data backup

`Settings → Export to JSON` downloads `phonebook-backup-YYYY-MM-DD.json` containing all contacts and call logs. `Import` merges by id (existing ids are overwritten with imported values).
