"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppMenu } from "./AppMenu";

export function AppBar({
  title,
  back = false,
  right,
  showMenu = true,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
  showMenu?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-2 px-3 pt-safe"
      style={{
        background: "var(--gradient-primary)",
        color: "#fff",
        minHeight: "var(--header-h)",
        boxShadow: "0 2px 8px rgb(234 88 12 / 0.18)",
      }}
    >
      {back && (
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="tap p-2 -ml-1 rounded-full active:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold truncate">{title}</h1>
      {right}
      {showMenu && <AppMenu />}
    </header>
  );
}
