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
          <strong className="text-scribix-text">Account data:</strong> this
          preview does not offer sign-in or accounts. If we add accounts later,
          we will describe what we collect at that time.
        </p>
        <p>
          <strong className="text-scribix-text">Public content:</strong> when you
          visit public profile or post pages, we may process the URLs you
          request and any content shown on those pages as part of delivering the
          site.
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
          We use technical data to operate, secure, and improve the service and
          to show public pages you request.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          4. Cookies and local storage
        </h2>
        <p>
          We may use cookies or local storage for preferences (such as theme) or
          similar features. You can clear site data in your browser at any
          time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          5. Sharing and subprocessors
        </h2>
        <p>
          We do not sell your personal information. We may use hosting,
          database, and infrastructure providers to run the service; they
          process data only as needed to provide those services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">6. Retention</h2>
        <p>
          We retain information only as long as needed for the purposes
          described here and as required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          7. Your choices
        </h2>
        <p>
          You can clear site data in your browser. If we add accounts later, we
          will describe how to access or delete related data.
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
