"use client";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/AppBar";
import { ContactForm } from "@/components/ContactForm";
import { createContact } from "@/lib/contacts";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <>
      <AppBar title="New contact" back />
      <ContactForm
        submitLabel="Save"
        onSubmit={async (input) => {
          const c = await createContact(input);
          router.replace(`/contact/${c.id}`);
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
