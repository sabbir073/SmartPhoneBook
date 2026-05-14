/**
 * Convert the Voter List Excel sheet to a Smart Phonebook sync JSON.
 *
 * Field mapping:
 *   final name   → name
 *   phone        → mobile
 *   address      → address
 *   company name → company
 *   email        → email
 *   description  → description
 *   website      → SKIPPED (not needed)
 *
 * Output file: voter-contacts.json (in project root)
 * The file is intended to be hosted/shared SEPARATELY from the app —
 * users import it via Settings → Sync contacts from JSON.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SOURCE = process.argv[2] ||
  "Voter_List_Condensed - Updated (1).xlsx";
const OUT = process.argv[3] || "voter-contacts.json";

// Normalise header name for matching
function norm(h) {
  return String(h || "")
    .toLowerCase()
    .replace(/[\s_\-./]+/g, " ")
    .trim();
}

// Header aliases. First key in each array wins.
const FIELD_ALIASES = {
  name: ["name", "first name", "fullname", "full name", "final name"],
  basis: ["basis id", "basis"],
  mobile: ["phone", "mobile", "mobile number", "phone number", "contact", "contact number"],
  address: ["address", "addr"],
  company: ["company name", "company", "organisation", "organization", "org"],
  email: ["email", "email address", "mail"],
  description: ["description", "notes", "note", "remarks"],
};

function buildHeaderIndex(headers) {
  // Keep the FIRST occurrence of each normalized header (the Voter List
  // has two "Name" columns and the first one is the desired source).
  const lookup = {};
  headers.forEach((h, i) => {
    const k = norm(h);
    if (k && !(k in lookup)) lookup[k] = i;
  });
  const idx = {};
  for (const [target, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const a of aliases) {
      if (lookup[a] !== undefined) {
        idx[target] = lookup[a];
        break;
      }
    }
  }
  return idx;
}

function cleanMobile(v) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (!s) return "";
  // Keep leading + and digits only
  const plus = s.startsWith("+") ? "+" : "";
  return plus + s.replace(/[^\d]/g, "");
}

function clean(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

async function main() {
  const inputPath = resolve(ROOT, SOURCE);
  console.log(`[convert] reading ${inputPath}`);
  const buf = await readFile(inputPath);
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error(`No sheets found in ${SOURCE}`);

  // header:1 → array-of-arrays, easier to do explicit header mapping
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!rows.length) throw new Error("Sheet is empty");

  const headers = rows[0];
  console.log(`[convert] headers: ${headers.map((h) => `"${h}"`).join(", ")}`);

  const idx = buildHeaderIndex(headers);
  console.log(`[convert] mapped columns:`);
  for (const [k, v] of Object.entries(idx)) {
    console.log(`           ${k.padEnd(12)} ← column ${v} ("${headers[v]}")`);
  }

  if (idx.name === undefined || idx.mobile === undefined) {
    throw new Error(
      "Required columns missing. Need at least 'final name' and 'phone'.",
    );
  }

  const out = [];
  let skippedNoName = 0;
  let skippedNoMobile = 0;
  let dupePhonesInSource = 0;
  const seenMobiles = new Set();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((cell) => cell === "")) continue;

    const baseName = clean(row[idx.name]);
    const basis = idx.basis !== undefined ? clean(row[idx.basis]) : "";
    const name = basis ? `${baseName} (${basis})` : baseName;
    const mobile = cleanMobile(row[idx.mobile]);

    if (!baseName) {
      skippedNoName++;
      continue;
    }
    if (!mobile) {
      // Drop rows without a phone number — they can't be called or messaged.
      skippedNoMobile++;
      continue;
    }

    const dedupKey = mobile.replace(/\D/g, "");
    if (seenMobiles.has(dedupKey)) dupePhonesInSource++;
    seenMobiles.add(dedupKey);

    const contact = { name, mobile };
    if (idx.address !== undefined) {
      const v = clean(row[idx.address]);
      if (v) contact.address = v;
    }
    if (idx.company !== undefined) {
      const v = clean(row[idx.company]);
      if (v) contact.company = v;
    }
    if (idx.email !== undefined) {
      const v = clean(row[idx.email]);
      if (v) contact.email = v;
    }
    if (idx.description !== undefined) {
      const v = clean(row[idx.description]);
      if (v) contact.description = v;
    }
    out.push(contact);
  }

  const payload = {
    app: "smart-phonebook",
    type: "contacts-sync",
    version: 1,
    source: SOURCE,
    exportedAt: Date.now(),
    count: out.length,
    contacts: out,
  };

  const outputPath = resolve(ROOT, OUT);
  await writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");

  const size = (await readFile(outputPath)).length;
  console.log("");
  console.log(`[convert] wrote ${out.length} contacts → ${OUT} (${(size / 1024).toFixed(1)} KB)`);
  console.log(`[convert]   - empty rows skipped: ${skippedNoName}`);
  console.log(`[convert]   - skipped (no phone): ${skippedNoMobile}`);
  console.log(`[convert]   - duplicate phones in source (kept all): ${dupePhonesInSource}`);
}

main().catch((e) => {
  console.error("[convert] failed:", e);
  process.exit(1);
});
