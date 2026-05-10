import { AppBar } from "@/components/AppBar";
import { Article } from "@/components/Article";
import { APP_NAME } from "@/lib/version";

export const metadata = { title: `Terms — ${APP_NAME}` };

export default function TermsPage() {
  return (
    <>
      <AppBar title="Terms of Use" back showMenu={false} />
      <Article>
        <h2>Use of the app</h2>
        <p>
          {APP_NAME} is provided free of charge for personal use. You are
          free to use, install, and back up your data without restrictions.
        </p>

        <h2>Your responsibility</h2>
        <ul>
          <li>
            You are responsible for the contacts and notes you store. Treat
            other people's information with care.
          </li>
          <li>
            Calls and texts initiated from the app go through your phone's
            carrier — standard call rates apply.
          </li>
          <li>
            Keep your device secure. Anyone with access to your unlocked
            device can read your contacts in this app.
          </li>
        </ul>

        <h2>Backups</h2>
        <p>
          Use the Export feature regularly. Clearing your browser data,
          uninstalling the app, or switching devices will erase data that
          isn't backed up.
        </p>

        <h2>No warranty</h2>
        <p>
          The app is provided "as is," without warranty of any kind. We do
          our best to keep your data safe, but we can't guarantee that a
          browser bug, hardware failure, or accidental deletion won't lose
          it. Always keep an exported backup.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may change in future versions. The current version is
          shown on the About page.
        </p>
      </Article>
    </>
  );
}
