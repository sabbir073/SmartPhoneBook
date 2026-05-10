"use client";
import { initialsFromName } from "@/lib/avatar";

export function ContactAvatar({
  name,
  color,
  size = 44,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
