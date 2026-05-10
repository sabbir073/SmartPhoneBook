import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const VERSION = "smart-phonebook-orange-v3";

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

async function generate() {
  // Always rebuild — bump VERSION above to force regeneration when design changes.
  await rm(ICONS_DIR, { recursive: true, force: true });
  await mkdir(ICONS_DIR, { recursive: true });

  const targets = [
    { name: "icon-192.png", size: 192, opts: {} },
    { name: "icon-512.png", size: 512, opts: {} },
    { name: "icon-maskable-512.png", size: 512, opts: { mask: true } },
    { name: "apple-touch-icon.png", size: 180, opts: {} },
    { name: "favicon-32.png", size: 32, opts: {} },
  ];

  for (const t of targets) {
    const out = join(ICONS_DIR, t.name);
    const svg = appIconSvg(t.size, t.opts);
    await sharp(Buffer.from(svg)).resize(t.size, t.size).png().toFile(out);
    console.log(`[icons] wrote ${t.name} (${VERSION})`);
  }
}

generate().catch((e) => {
  console.error("[icons] failed:", e);
  process.exit(1);
});
