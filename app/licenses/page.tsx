import { AppBar } from "@/components/AppBar";
import { Article } from "@/components/Article";
import { APP_NAME } from "@/lib/version";

export const metadata = { title: `Open Source — ${APP_NAME}` };

const LIBRARIES: { name: string; license: string; purpose: string }[] = [
  { name: "Next.js", license: "MIT", purpose: "App framework" },
  { name: "React", license: "MIT", purpose: "UI runtime" },
  { name: "Tailwind CSS", license: "MIT", purpose: "Styling" },
  { name: "Dexie.js", license: "Apache-2.0", purpose: "IndexedDB wrapper" },
  { name: "Motion (Framer Motion)", license: "MIT", purpose: "Animations" },
  { name: "Lucide", license: "ISC", purpose: "Icon set" },
  { name: "Serwist", license: "MIT", purpose: "Service worker / PWA" },
];

export default function LicensesPage() {
  return (
    <>
      <AppBar title="Open Source" back showMenu={false} />
      <Article>
        <p>
          {APP_NAME} stands on the shoulders of these wonderful open source
          projects. Thank you to their authors and contributors.
        </p>
        <ul>
          {LIBRARIES.map((lib) => (
            <li key={lib.name}>
              <strong>{lib.name}</strong> — {lib.purpose}{" "}
              <span style={{ color: "var(--color-text-muted)" }}>
                ({lib.license})
              </span>
            </li>
          ))}
        </ul>
        <p>
          Each library retains its original license. Run <code>npm ls</code>{" "}
          in the project to see the full dependency tree.
        </p>
      </Article>
    </>
  );
}
