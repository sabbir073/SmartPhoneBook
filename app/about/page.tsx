import { AppBar } from "@/components/AppBar";
import { Article } from "@/components/Article";
import { APP_NAME, APP_VERSION } from "@/lib/version";

export const metadata = { title: `About — ${APP_NAME}` };

export default function AboutPage() {
  return (
    <>
      <AppBar title="About" back showMenu={false} />

      <section
        className="mx-3 mt-3 rounded-2xl px-5 py-6 flex flex-col items-center gap-2 text-center"
        style={{
          background: "var(--gradient-primary-deep)",
          color: "#fff",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            width: 72,
            height: 72,
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <span className="text-3xl font-extrabold">S</span>
        </div>
        <h1 className="text-xl font-bold mt-2">{APP_NAME}</h1>
        <div
          className="text-xs uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          v{APP_VERSION}
        </div>
        <p
          className="text-sm mt-1 max-w-xs"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          A fast, offline-first phonebook with call notes — built as a Progressive Web App.
        </p>
      </section>

      <Article>
        <h2>What it does</h2>
        <ul>
          <li>Manage contacts with full details and free-form description.</li>
          <li>One-tap calling that opens your phone's native dialer.</li>
          <li>After every call, get a prompt to save what you talked about.</li>
          <li>Browse a timeline of past calls per contact.</li>
          <li>Works fully offline once installed.</li>
          <li>JSON backup &amp; restore — no cloud, no account.</li>
        </ul>

        <h2>Privacy first</h2>
        <p>
          All your contacts and call notes live in your browser's IndexedDB on
          this device. Nothing is sent to any server. Ever.
        </p>
      </Article>
    </>
  );
}
