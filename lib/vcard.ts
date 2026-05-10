export type ParsedContact = {
  name: string;
  mobile: string;
  address?: string;
  company?: string;
  email?: string;
  website?: string;
  description?: string;
};

/**
 * Minimal vCard parser. Handles vCard 2.1 / 3.0 / 4.0 exports from
 * iOS Contacts, Google Contacts, Outlook. Skips cards without a name or
 * a phone number. Not a spec-complete implementation — no quoted-printable,
 * no base64 photos.
 */
export function parseVCard(text: string): ParsedContact[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Unfold continuation lines (RFC 6350 §3.2: a line wrap is followed by SP/TAB)
  const unfolded = normalized.replace(/\n[ \t]/g, "");
  const cards = unfolded
    .split(/BEGIN:VCARD/i)
    .slice(1)
    .map((c) => {
      const end = c.search(/END:VCARD/i);
      return end >= 0 ? c.slice(0, end) : c;
    });
  return cards
    .map(parseCard)
    .filter((c): c is ParsedContact => c !== null);
}

type Tel = { types: string[]; value: string };

function parseCard(text: string): ParsedContact | null {
  let fn = "";
  let n = "";
  const tels: Tel[] = [];
  let email = "";
  let org = "";
  let url = "";
  let adr = "";
  let note = "";

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const headParts = head.split(";");
    const key = headParts[0].toUpperCase();
    const params = headParts.slice(1);

    switch (key) {
      case "FN":
        fn = decodeValue(value);
        break;
      case "N":
        n = decodeValue(value);
        break;
      case "TEL":
        tels.push({ types: extractTypes(params), value: cleanTel(value) });
        break;
      case "EMAIL":
        if (!email) email = decodeValue(value);
        break;
      case "ORG":
        if (!org) org = decodeValue(value).split(";")[0].trim();
        break;
      case "URL":
        if (!url) url = decodeValue(value);
        break;
      case "ADR":
        if (!adr) adr = formatAdr(decodeValue(value));
        break;
      case "NOTE":
        if (!note) note = decodeValue(value);
        break;
    }
  }

  let name = fn.trim();
  if (!name && n) {
    const [family, given, middle] = n.split(";");
    name = [given, middle, family].filter(Boolean).join(" ").trim();
  }
  if (!name) return null;

  const mobile = pickMobile(tels);
  if (!mobile) return null;

  return {
    name,
    mobile,
    address: adr || undefined,
    company: org || undefined,
    email: email || undefined,
    website: url || undefined,
    description: note || undefined,
  };
}

function extractTypes(params: string[]): string[] {
  const types: string[] = [];
  for (const p of params) {
    const up = p.toUpperCase();
    if (up.startsWith("TYPE=")) {
      // TYPE=CELL  or  TYPE="CELL,VOICE"  or  TYPE=CELL,HOME
      const v = up.slice(5).replace(/"/g, "");
      v.split(",").forEach((t) => types.push(t.trim()));
    } else if (/^(CELL|MOBILE|HOME|WORK|VOICE|PREF|FAX)$/.test(up)) {
      // vCard 2.1 — naked TYPE values
      types.push(up);
    }
  }
  return types;
}

function pickMobile(tels: Tel[]): string {
  if (!tels.length) return "";
  const mobile = tels.find((t) =>
    t.types.some((x) => x === "CELL" || x === "MOBILE"),
  );
  if (mobile) return mobile.value;
  // Prefer PREF if no explicit mobile
  const pref = tels.find((t) => t.types.includes("PREF"));
  if (pref) return pref.value;
  return tels[0].value;
}

function cleanTel(s: string): string {
  // Keep leading + and digits only
  const trimmed = s.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

function formatAdr(value: string): string {
  // ADR structure: PO;Extended;Street;Locality;Region;PostalCode;Country
  const parts = value
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.join(", ");
}

function decodeValue(s: string): string {
  return s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}
