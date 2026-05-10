"use client";
import { Phone } from "lucide-react";
import { setPendingCall } from "@/lib/pendingCall";
import { telHref } from "@/lib/format";

export function CallButton({
  contactId,
  mobile,
}: {
  contactId: string;
  mobile: string;
}) {
  const handleCall = () => {
    setPendingCall({ contactId, startedAt: Date.now() });
    window.location.href = telHref(mobile);
  };

  return (
    <button
      onClick={handleCall}
      className="tap flex flex-1 items-center justify-center gap-2 rounded-full font-semibold text-white px-4"
      style={{
        background: "var(--color-accent)",
        boxShadow: "0 6px 18px rgba(16,185,129,0.35)",
        height: 56,
      }}
      aria-label={`Call ${mobile}`}
    >
      <Phone size={22} fill="white" strokeWidth={0} />
      <span className="text-base">Call</span>
    </button>
  );
}
