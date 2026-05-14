import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const VERSION = "smart-phonebook-orange-v5";

function appIconSvg(size, { mask = false } = {}) {
  const radius = mask ? 0 : size * 0.22;
  // Phone glyph metrics (centred a touch above middle to leave room for wordmark)
  const phoneW = size * 0.46;
  const phoneX = (size - phoneW) / 2;
  const phoneY = size * 0.18;
  // "S" badge in top-right
  const badgeR = size * 0.13;
  const badgeCx = size * 0.78;
  const badgeCy = size * 0.22;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <radialGradient id="glow" cx="35%" cy="25%" r="60%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#glow)"/>
  <g transform="translate(${phoneX} ${phoneY})">
    <svg width="${phoneW}" height="${phoneW}" viewBox="0 0 24 24" fill="white">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  </g>
  <g>
    <circle cx="${badgeCx}" cy="${badgeCy}" r="${badgeR}" fill="#ffffff"/>
    <text
      x="${badgeCx}"
      y="${badgeCy}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-size="${badgeR * 1.5}"
      font-weight="800"
      fill="#ea580c"
    >S</text>
  </g>
  <text
    x="${size / 2}"
    y="${size * 0.86}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="${size * 0.11}"
    font-weight="700"
    fill="white"
    letter-spacing="${size * 0.005}"
  >SMART</text>
</svg>`;
}

// Stylised in-app screenshot for the install dialog. Not an actual screen
// grab — a designed promo card that says "what this app is" so Chrome /
// Edge / Samsung Internet show the rich Install sheet instead of the
// "Add to Home Screen" fallback.
function screenshotSvg(width, height, { orientation }) {
  const isNarrow = orientation === "narrow";
  const headerH = isNarrow ? 92 : 96;
  const iconSize = isNarrow ? 96 : 120;
  const titleY = isNarrow ? height * 0.4 : height * 0.42;

  const cardCount = isNarrow ? 6 : 4;
  const cardSpace = isNarrow ? 78 : 96;
  const cardsStartY = isNarrow ? height * 0.55 : height * 0.6;
  const cardW = width - 48;

  const cards = Array.from({ length: cardCount }, (_, i) => {
    const y = cardsStartY + i * cardSpace;
    const colors = ["#fb923c", "#f97316", "#ea580c", "#dc2626", "#a855f7", "#3b82f6"];
    return `
      <g transform="translate(24 ${y})">
        <rect rx="14" width="${cardW}" height="64" fill="white" />
        <circle cx="36" cy="32" r="22" fill="${colors[i % colors.length]}" />
        <rect x="72" y="18" width="${cardW * 0.45}" height="14" rx="4" fill="#1c1917" opacity="0.9"/>
        <rect x="72" y="40" width="${cardW * 0.30}" height="10" rx="3" fill="#78716c"/>
      </g>`;
  }).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="header" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#ffedd5"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${headerH}" fill="url(#header)"/>
  <text x="24" y="${headerH * 0.62}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${isNarrow ? 26 : 30}" font-weight="700" fill="white">Smart Phonebook</text>

  <g transform="translate(${(width - iconSize) / 2} ${headerH + 36})">
    ${appIconSvg(iconSize, {}).replace(/<\?xml[^>]*\?>/, "")}
  </g>

  <text x="${width / 2}" y="${titleY + iconSize * 0.4}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${isNarrow ? 24 : 30}" font-weight="700" fill="#1c1917">Your contacts. Offline.</text>
  <text x="${width / 2}" y="${titleY + iconSize * 0.4 + (isNarrow ? 28 : 36)}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${isNarrow ? 14 : 18}" fill="#78716c">Call. WhatsApp. Notes — all on your device.</text>

  ${cards}
</svg>`;
}

async function generate() {
  // Always rebuild — bump VERSION above to force regeneration when design changes.
  await rm(ICONS_DIR, { recursive: true, force: true });
  await mkdir(ICONS_DIR, { recursive: true });

  const targets = [
    // Full PWA icon set — covers every size Chrome / Edge / Samsung Internet
    // / Firefox / Safari look up. Larger sets reduce visual scaling artifacts
    // on home screens, splash screens, share sheets, and task switchers.
    { name: "icon-48.png", size: 48, opts: {} },
    { name: "icon-72.png", size: 72, opts: {} },
    { name: "icon-96.png", size: 96, opts: {} },
    { name: "icon-128.png", size: 128, opts: {} },
    { name: "icon-144.png", size: 144, opts: {} },
    { name: "icon-192.png", size: 192, opts: {} },
    { name: "icon-256.png", size: 256, opts: {} },
    { name: "icon-384.png", size: 384, opts: {} },
    { name: "icon-512.png", size: 512, opts: {} },
    // Maskable variants at the two sizes Chrome looks for.
    { name: "icon-maskable-192.png", size: 192, opts: { mask: true } },
    { name: "icon-maskable-512.png", size: 512, opts: { mask: true } },
    // Apple touch icons across the iOS/iPadOS/macOS device matrix.
    { name: "apple-touch-icon.png", size: 180, opts: {} },      // iPhone (default)
    { name: "apple-touch-icon-152.png", size: 152, opts: {} },  // iPad
    { name: "apple-touch-icon-167.png", size: 167, opts: {} },  // iPad Pro
    { name: "apple-touch-icon-120.png", size: 120, opts: {} },  // iPhone retina (legacy)
    { name: "favicon-16.png", size: 16, opts: {} },
    { name: "favicon-32.png", size: 32, opts: {} },
    { name: "favicon-96.png", size: 96, opts: {} },
  ];

  for (const t of targets) {
    const out = join(ICONS_DIR, t.name);
    const svg = appIconSvg(t.size, t.opts);
    await sharp(Buffer.from(svg)).resize(t.size, t.size).png().toFile(out);
    console.log(`[icons] wrote ${t.name} (${VERSION})`);
  }

  // PWA manifest screenshots — required by Chrome / Edge / Samsung Internet
  // to show the rich "Install Smart Phonebook" sheet rather than the
  // "Add to Home Screen" fallback.
  const shots = [
    { name: "screenshot-narrow.png", w: 540, h: 1170, orientation: "narrow" },
    { name: "screenshot-wide.png", w: 1280, h: 720, orientation: "wide" },
  ];
  for (const s of shots) {
    const out = join(ICONS_DIR, s.name);
    const svg = screenshotSvg(s.w, s.h, { orientation: s.orientation });
    await sharp(Buffer.from(svg)).resize(s.w, s.h).png().toFile(out);
    console.log(`[icons] wrote ${s.name} (${VERSION})`);
  }
}

generate().catch((e) => {
  console.error("[icons] failed:", e);
  process.exit(1);
});
