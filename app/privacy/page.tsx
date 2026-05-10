import { AppBar } from "@/components/AppBar";
import { Article } from "@/components/Article";
import { APP_NAME } from "@/lib/version";

export const metadata = { title: `Privacy — ${APP_NAME}` };

export default function PrivacyPage() {
  return (
    <>
      <AppBar title="Privacy Policy" back showMenu={false} />
      <Article>
        <h2>The short version</h2>
        <p>
          {APP_NAME} stores everything <strong>only on your device</strong>. We
          do not run a server. We do not collect, transmit, or sell your data.
          There are no accounts and no logins.
        </p>

        <h2>What is stored</h2>
        <ul>
          <li>Contacts you create (name, mobile, address, company, email, website, description).</li>
          <li>Call logs and notes you save after a call.</li>
          <li>Your theme preference (light / dark / system).</li>
        </ul>
        <p>
          All of this lives in your browser's IndexedDB and localStorage,
          scoped to this origin in this browser profile only.
        </p>

        <h2>What is NOT stored</h2>
        <ul>
          <li>No analytics, no telemetry, no crash reports.</li>
          <li>No cookies for tracking.</li>
          <li>No third-party scripts that phone home.</li>
          <li>No advertising identifiers.</li>
        </ul>

        <h2>Network access</h2>
        <p>
          The app fetches its own assets (HTML, JS, CSS, icons) from the host
          you opened it from, then runs entirely offline. The only "network"
          your data sees is the cellular call you place via your phone's
          dialer — and that's between your phone and your carrier, not us.
        </p>

        <h2>Permissions</h2>
        <ul>
          <li>
            <strong>Persistent storage:</strong> we ask the browser to mark
            our storage as persistent so your data isn't evicted under disk
            pressure.
          </li>
          <li>
            <strong>Install prompt:</strong> we show the browser's native
            install prompt when available, so you can add the app to your
            home screen.
          </li>
        </ul>

        <h2>Your data, your control</h2>
        <p>
          Use <strong>Settings → Export to JSON</strong> at any time to
          download a complete backup. Use <strong>Import</strong> to restore
          it. Delete a contact (or the whole site data via your browser
          settings) and it's gone — there is no copy anywhere else.
        </p>

        <h2>Contact</h2>
        <p>
          Since {APP_NAME} runs entirely on your device, there is no operator
          to contact about your data. If you found a bug or want to ask
          something, reach out to whoever distributed this build to you.
        </p>
      </Article>
    </>
  );
}
