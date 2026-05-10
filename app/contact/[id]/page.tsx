import ContactDetailsClient from "./ContactDetailsClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <ContactDetailsClient />;
}
