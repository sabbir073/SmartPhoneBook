"use client";
import { useRouter, usePathname } from "next/navigation";
import { AppBar } from "@/components/AppBar";
import { ContactForm } from "@/components/ContactForm";
import { useContact } from "@/hooks/useContact";
import { updateContact } from "@/lib/contacts";

function idFromPath(path: string): string {
  const m = path.match(/^\/contact\/([^/]+)\/edit\/?$/);
  return m ? decodeURIComponent(m[1]) : "_";
}

export default function EditContactClient() {
  const router = useRouter();
  const pathname = usePathname();
  const id = idFromPath(pathname || "");
  const contact = useContact(id !== "_" ? id : undefined);

  if (contact === null) {
    return (
      <>
        <AppBar title="Not found" back />
        <div
          className="text-center py-16"
          style={{ color: "var(--color-text-muted)" }}
        >
          This contact no longer exists.
        </div>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <AppBar title="Edit" back />
        <div
          className="text-center py-12 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading…
        </div>
      </>
    );
  }

  return (
    <>
      <AppBar title="Edit contact" back />
      <ContactForm
        initial={contact}
        submitLabel="Save changes"
        onSubmit={async (input) => {
          await updateContact(contact.id, input);
          router.replace(`/contact/${contact.id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
