/**
 * Platform / browser detection for PWA install paths.
 *
 * We don't trust UA sniffing alone. Where possible we combine UA with
 * feature checks (touch points, matchMedia, navigator.standalone) so the
 * result still works when browsers spoof their UA.
 */

export type InstallPlatform =
  | "chromium" // Chrome / Edge / Samsung Internet / Opera / Brave — supports beforeinstallprompt
  | "ios" // iPhone / iPod / iPad in mobile Safari
  | "ipad-desktop" // iPad Safari requesting desktop site (reports as MacIntel + touch)
  | "macos-safari" // macOS Safari (17+ supports Add to Dock)
  | "firefox" // any Firefox build
  | "other"; // anything else (rare)

const ua = () =>
  typeof navigator === "undefined" ? "" : navigator.userAgent || "";

const isIOSDevice = () =>
  /iPad|iPhone|iPod/.test(ua()) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

const isIPadDesktop = () => {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ on "Request Desktop Site" reports platform as MacIntel
  // but exposes multi-touch — real Macs report 0 touch points.
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
};

const isFirefoxBrowser = () => /firefox|fxios/i.test(ua());

const isAppleSafari = () => {
  // True Safari, not Chrome-on-Mac (which also has "Safari/" in UA).
  // Excludes Chrome, Firefox, Edge variants on iOS, Opera.
  return /^((?!chrome|chromium|android|crios|fxios|edgios|edg\/|opr\/|opera).)*safari/i.test(
    ua(),
  );
};

const isMacOS = () => /Macintosh|Mac OS X/.test(ua());

export function detectInstallPlatform(): InstallPlatform {
  if (typeof window === "undefined") return "other";
  if (isIOSDevice()) return "ios";
  if (isIPadDesktop()) return "ipad-desktop";
  if (isMacOS() && isAppleSafari()) return "macos-safari";
  if (isFirefoxBrowser()) return "firefox";
  // Chromium catches Chrome, Edge, Samsung, Opera, Brave, etc.
  return "chromium";
}

export function isAlreadyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.matchMedia?.("(display-mode: fullscreen)").matches) return true;
  if (window.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
  // iOS Safari standalone flag (when launched from home-screen icon).
  if ((navigator as unknown as { standalone?: boolean }).standalone === true)
    return true;
  return false;
}

/**
 * True for any platform where the user CAN install Smart Phonebook to
 * their device — even if it's manual (iOS Safari Share menu, macOS
 * Safari File menu).
 *
 * Used to decide whether to surface install entry points anywhere.
 */
export function canBeInstalled(platform: InstallPlatform): boolean {
  return platform !== "firefox" && platform !== "other";
}
