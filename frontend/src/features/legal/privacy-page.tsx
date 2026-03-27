import {
  LegalDocFooterLinks,
  LegalDocLayout,
} from "@/features/legal/legal-doc-layout";
import { usePageTitle } from "@/hooks/use-page-title";

export function PrivacyPage() {
  usePageTitle("Privacy Policy");

  return (
    <LegalDocLayout
      title="Privacy Policy"
      footer={
        <LegalDocFooterLinks otherTo="/terms" otherLabel="Terms of Service" />
      }
    >
      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">1. Overview</h2>
        <p>
          This policy describes how Scribix handles information when you use
          the website and related services. We aim to collect only what we need
          to run the product.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          2. Information we collect
        </h2>
        <p>
          <strong className="text-scribix-text">Account data:</strong> sign-in is
          with Google only. We receive identifiers and profile information from
          Google (such as email and name) according to your Google account
          settings and our authentication provider. We also store your chosen
          username, optional profile bio and links, and content you save in
          drafts and published posts.
        </p>
        <p>
          <strong className="text-scribix-text">Technical data:</strong>{" "}
          standard server logs may include IP address, browser type, and
          timestamps for security and debugging.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          3. How we use information
        </h2>
        <p>
          We use account and content data to provide accounts, authenticate you,
          store your writing, and show published posts and profiles to
          visitors. We use technical data to operate, secure, and improve the
          service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          4. Cookies and local storage
        </h2>
        <p>
          We use cookies or similar storage so you can stay logged in. Session
          data is sent over HTTPS. You can clear site data in your browser to
          log out; logging out from the app clears the session on that device.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          5. Sharing and subprocessors
        </h2>
        <p>
          We do not sell your personal information. We may use hosting,
          database, and infrastructure providers to run the service; they
          process data only as needed to provide those services. If you use
          Google sign-in, Google processes authentication according to their
          terms and privacy policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">6. Retention</h2>
        <p>
          We keep your information while your account exists and as needed to
          comply with law or resolve disputes. If you delete your account, we
          delete or anonymize your data when reasonably possible, subject to
          backups and legal holds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          7. Your choices
        </h2>
        <p>
          You can update profile information in settings where available. You
          may request account deletion by contacting us if the product does
          not offer a self-service delete option yet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">8. Children</h2>
        <p>
          Scribix is not intended for children under 13 (or the age required in
          your region). We do not knowingly collect personal information from
          children.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">9. Changes</h2>
        <p>
          We may update this policy from time to time. The date at the top will
          change when we do. Continued use after changes means you accept the
          updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">10. Contact</h2>
        <p>
          For privacy questions, use the contact options on the site if
          provided.
        </p>
      </section>
    </LegalDocLayout>
  );
}
