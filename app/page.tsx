"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AppBar } from "@/components/AppBar";
import { SearchBar } from "@/components/SearchBar";
import { ContactList } from "@/components/ContactList";
import { FAB } from "@/components/FAB";
import { useContacts } from "@/hooks/useContacts";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const contacts = useContacts(query);

  return (
    <>
      <AppBar title="Smart Phonebook" />
      <SearchBar value={query} onChange={setQuery} />
      {contacts === undefined ? (
        <div
          className="text-center py-12 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading…
        </div>
      ) : (
        <ContactList contacts={contacts} />
      )}
      <FAB
        ariaLabel="Add contact"
        onClick={() => router.push("/contact/new")}
      >
        <Plus size={26} />
      </FAB>
    </>
  );
}
