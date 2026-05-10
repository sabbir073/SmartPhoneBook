"use client";
import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search contacts",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 mx-3 my-2 px-3 rounded-full"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        height: 44,
      }}
    >
      <Search size={18} style={{ color: "var(--color-text-muted)" }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-base w-full"
        style={{ color: "var(--color-text)" }}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="tap p-1 rounded-full"
        >
          <X size={16} style={{ color: "var(--color-text-muted)" }} />
        </button>
      )}
    </div>
  );
}
