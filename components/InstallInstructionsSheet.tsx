"use client";
import { Share, Plus, Anchor, MoreVertical } from "lucide-react";
import type { InstallPlatform } from "@/lib/platform";
import { BottomSheet } from "./BottomSheet";

type SheetConfig = {
  title: string;
  intro: string;
  steps: React.ReactNode[];
};

export function InstallInstructionsSheet({
  open,
  platform,
  onClose,
}: {
  open: boolean;
  platform: InstallPlatform;
  onClose: () => void;
}) {
  const config = sheetConfigFor(platform);
  return (
    <BottomSheet open={open} onClose={onClose} title={config.title}>
      <div className="px-5 pb-6">
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          {config.intro}
        </p>
        <ol className="flex flex-col gap-3 text-sm">
          {config.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <Step n={i + 1} />
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={onClose}
          className="tap w-full py-3 rounded-full font-semibold mt-6"
          style={{
            background: "var(--color-primary)",
            color: "#fff",
          }}
        >
          Got it
        </button>
      </div>
    </BottomSheet>
  );
}

function sheetConfigFor(platform: InstallPlatform): SheetConfig {
  switch (platform) {
    case "ios":
      return {
        title: "Install on iPhone",
        intro:
          "iOS Safari doesn't show an Install button. Add Smart Phonebook to your Home Screen in three taps:",
        steps: [
          <>
            Tap the <Share size={14} className="inline mx-0.5 -mt-0.5" />{" "}
            <strong>Share</strong> button at the bottom of Safari.
          </>,
          <>
            Scroll and tap{" "}
            <strong>
              Add to Home Screen <Plus size={14} className="inline -mt-0.5" />
            </strong>
            .
          </>,
          <>
            Tap <strong>Add</strong> in the top-right corner.
          </>,
        ],
      };

    case "ipad-desktop":
      return {
        title: "Install on iPad",
        intro:
          "Your iPad is set to 'Request Desktop Site'. The Add to Home Screen flow is the same as iPhone:",
        steps: [
          <>
            Tap the <Share size={14} className="inline mx-0.5 -mt-0.5" />{" "}
            <strong>Share</strong> button in Safari's toolbar.
          </>,
          <>
            Scroll the share sheet and tap{" "}
            <strong>
              Add to Home Screen <Plus size={14} className="inline -mt-0.5" />
            </strong>
            .
          </>,
          <>
            Tap <strong>Add</strong> to confirm.
          </>,
          <>
            <em>
              Tip: switching off "Request Desktop Site" for this site gives a
              cleaner mobile-app look.
            </em>
          </>,
        ],
      };

    case "macos-safari":
      return {
        title: "Install on Mac (Safari)",
        intro:
          "Safari 17+ on macOS can add Smart Phonebook to your Dock as a web app:",
        steps: [
          <>
            With this tab open, click the <strong>File</strong> menu.
          </>,
          <>
            Choose{" "}
            <strong>
              Add to Dock <Anchor size={14} className="inline -mt-0.5" />
            </strong>{" "}
            (or use{" "}
            <Share size={14} className="inline mx-0.5 -mt-0.5" />{" "}
            <strong>Share → Add to Dock</strong>).
          </>,
          <>
            Confirm the name and click <strong>Add</strong>. Smart Phonebook
            now opens in its own window from the Dock or Launchpad.
          </>,
          <>
            <em>
              On older macOS, install Chrome or Edge instead — you'll get a
              one-click Install button in the address bar.
            </em>
          </>,
        ],
      };

    case "firefox":
      return {
        title: "Install on Firefox",
        intro:
          "Firefox doesn't have a built-in PWA installer on desktop. You have two options:",
        steps: [
          <>
            <strong>Easiest:</strong> open this site in Chrome, Edge, or
            Brave — they show a one-click Install button.
          </>,
          <>
            <strong>Or</strong> bookmark this page and use the bookmark — the
            app already works offline and stores everything locally.
          </>,
        ],
      };

    default:
      return {
        title: "Install Smart Phonebook",
        intro:
          "Your browser didn't show an automatic install prompt. You can install manually:",
        steps: [
          <>
            Open the browser menu (
            <MoreVertical size={14} className="inline -mt-0.5" /> top-right).
          </>,
          <>
            Look for{" "}
            <strong>Install Smart Phonebook</strong>,{" "}
            <strong>Install app</strong>, or{" "}
            <strong>Add to Home Screen</strong>.
          </>,
          <>Confirm the install.</>,
        ],
      };
  }
}

function Step({ n }: { n: number }) {
  return (
    <span
      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      style={{
        background:
          "color-mix(in oklab, var(--color-primary) 14%, transparent)",
        color: "var(--color-primary)",
      }}
    >
      {n}
    </span>
  );
}
