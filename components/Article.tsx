import type { ReactNode } from "react";

export function Article({ children }: { children: ReactNode }) {
  return (
    <article
      className="mx-3 my-3 px-4 py-5 rounded-2xl"
      style={{
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-card)",
        color: "var(--color-text)",
      }}
    >
      <div className="article-prose">{children}</div>
    </article>
  );
}
