/**
 * WhatsApp `wa.me/<number>` requires a number with country code, no `+`,
 * no spaces, no dashes. We never alter the saved contact number — only
 * what we hand to wa.me is normalized.
 */

const STORAGE_KEY = "smart-phonebook:waCountryCode";
// Bangladesh by default, per project preference. User can change in Settings.
const DEFAULT = "880";

export function getWhatsAppCountryCode(): string {
  if (typeof window === "undefined") return DEFAULT;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && /^\d{1,4}$/.test(saved) ? saved : DEFAULT;
}

export function setWhatsAppCountryCode(code: string): void {
  const cleaned = code.replace(/\D/g, "").slice(0, 4);
  if (!cleaned) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, cleaned);
}

/**
 * Convert any saved number to the digits-only form wa.me expects.
 * Rules:
 *   1. Already in `+<cc><rest>` format → strip the `+`, return digits.
 *   2. International prefix `00<cc>...` → drop `00`, return digits.
 *   3. National format starting with a leading `0` → drop the `0`, prepend
 *      the user's default country code.
 *   4. Anything else (no `+`, no leading `0`) → assume national, prepend
 *      the default country code.
 */
export function toWhatsAppNumber(
  raw: string,
  countryCode: string = getWhatsAppCountryCode(),
): string {
  if (!raw) return "";
  const trimmed = raw.trim();

  if (trimmed.startsWith("+")) {
    return trimmed.slice(1).replace(/\D/g, "");
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  if (digits.startsWith("0")) {
    return countryCode + digits.slice(1);
  }
  // Already starts with the country code? leave it alone.
  if (countryCode && digits.startsWith(countryCode)) {
    return digits;
  }
  return countryCode + digits;
}
