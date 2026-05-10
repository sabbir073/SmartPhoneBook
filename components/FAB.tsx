"use client";
import { useEffect, useState, type ReactNode, type MouseEventHandler } from "react";
import { createPortal } from "react-dom";

export function FAB({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="tap flex items-center justify-center rounded-full text-white"
      style={{
        position: "fixed",
        right: 20,
        bottom: `calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 16px)`,
        width: 56,
        height: 56,
        background: "var(--gradient-primary)",
        boxShadow: "var(--shadow-fab)",
        zIndex: 35,
      }}
    >
      {children}
    </button>,
    document.body,
  );
}
