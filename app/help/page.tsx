import { AppBar } from "@/components/AppBar";
import { Article } from "@/components/Article";
import { APP_NAME } from "@/lib/version";

export const metadata = { title: `Help — ${APP_NAME}` };

export default function HelpPage() {
  return (
    <>
      <AppBar title="Help & FAQ" back showMenu={false} />
      <Article>
        <h2>Adding a contact</h2>
        <p>
          Tap the floating <strong>+</strong> button on the Contacts screen,
          fill in the details (only Name and Mobile are required) and tap
          <strong> Save</strong>.
        </p>

        <h2>Calling from the app</h2>
        <p>
          Open a contact and tap the green <strong>Call</strong> button. Your
          phone's native dialer opens with the number ready. After you end
          the call and return to {APP_NAME}, a sheet appears asking what you
          talked about — type a note (or skip), and the call is logged
          either way.
        </p>

        <h2>Where are my call notes?</h2>
        <p>
          The newest 3 appear on the contact's details page. Tap{" "}
          <strong>View all</strong> to see the full timeline. You can also
          edit or delete each entry.
        </p>
        <p>
          The <strong>Recent</strong> tab shows calls across all contacts,
          newest first.
        </p>

        <h2>Search</h2>
        <p>
          Use the search bar on the Contacts screen. It matches across name,
          mobile number, company and email.
        </p>

        <h2>Backup &amp; restore</h2>
        <p>
          Settings → <strong>Export to JSON</strong> downloads all your
          contacts and call logs as a single file. Import the same file on
          another device or after reinstalling.
        </p>
        <p>
          Import merges by id — existing records with the same id are
          overwritten with the imported version, and new records are added.
        </p>

        <h2>Will I lose my data?</h2>
        <ul>
          <li>
            Inside the app: no — only deleting a contact / call log removes
            data, and we always confirm first.
          </li>
          <li>
            Outside the app: clearing browser data, uninstalling the PWA, or
            switching browsers will erase the app's storage. <strong>Always
            keep an exported backup.</strong>
          </li>
          <li>
            Once you install the app, the browser marks our storage as
            persistent — meaning it won't be evicted automatically when the
            device is low on space.
          </li>
        </ul>

        <h2>Does it work offline?</h2>
        <p>
          Yes — fully. After your first visit, the service worker caches
          everything. Turn airplane mode on and the app still launches,
          contacts still load, and Call still opens the dialer.
        </p>

        <h2>Installing as an app</h2>
        <ul>
          <li>
            <strong>Android / Chrome / Edge:</strong> tap <strong>Install</strong>{" "}
            in the orange banner at the top, or use the browser menu →{" "}
            <em>Install app</em>.
          </li>
          <li>
            <strong>iPhone / Safari:</strong> tap the Share button in
            Safari's bottom bar, then <em>Add to Home Screen</em>.
          </li>
        </ul>
      </Article>
    </>
  );
}
