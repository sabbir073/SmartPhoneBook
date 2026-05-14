const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

export function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

// Returns the first alphabetic character of a string (uppercased), or "".
function firstLetter(s: string): string {
  const m = s.match(/[A-Za-zÀ-ɏ]/);
  return m ? m[0].toUpperCase() : "";
}

export function initialsFromName(name: string): string {
  // Strip parenthesized tags like " (BASIS)" before picking initials.
  const cleaned = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const letters = parts[0].replace(/[^A-Za-zÀ-ɏ]/g, "");
    return (letters.slice(0, 2) || "?").toUpperCase();
  }
  const first = firstLetter(parts[0]);
  const last = firstLetter(parts[parts.length - 1]);
  return first + last || "?";
}
