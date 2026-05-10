"use client";
import { BottomSheet } from "./BottomSheet";

export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="px-5 pb-5">
        {message && (
          <p
            className="text-sm mb-5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {message}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="tap w-full py-3 rounded-full font-semibold text-white"
            style={{
              background: destructive
                ? "var(--color-danger)"
                : "var(--color-primary)",
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="tap w-full py-3 rounded-full font-medium"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
