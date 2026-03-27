import {
  LegalDocFooterLinks,
  LegalDocLayout,
} from "@/features/legal/legal-doc-layout";
import { usePageTitle } from "@/hooks/use-page-title";

export function TermsPage() {
  usePageTitle("Terms of Service");

  return (
    <LegalDocLayout
      title="Terms of Service"
      footer={
        <LegalDocFooterLinks otherTo="/privacy" otherLabel="Privacy Policy" />
      }
    >
      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">1. Agreement</h2>
        <p>
          By creating an account or using Scribix, you agree to these Terms. If
          you do not agree, do not use the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">2. The service</h2>
        <p>
          Scribix hosts writing tools, profiles, and published posts at URLs we
          provide. We may change, limit, or discontinue features with or
          without notice when needed for security, cost, or maintenance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">3. Accounts</h2>
        <p>
          You must provide accurate information and protect access to your
          Google account used to sign in. You are responsible for activity under
          your account. Your
          username is part of your public URL and cannot be changed after you
          set it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">4. Your content</h2>
        <p>
          You keep ownership of content you create. You give Scribix permission
          to host, store, display, and distribute your content as needed to run
          the service (for example, showing published posts to visitors).
        </p>
        <p>
          You agree not to use Scribix for unlawful content, malware,
          harassment, spam, or to infringe others&apos; rights. We may remove
          content or suspend accounts that break these rules or put the service
          at risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">5. Termination</h2>
        <p>
          You may stop using Scribix at any time. We may suspend or close
          accounts that violate these Terms or for operational reasons.
          Provisions that should survive (such as limitations of liability)
          continue after termination.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">
          6. Disclaimers and liability
        </h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any
          kind. To the fullest extent allowed by law, Scribix is not liable for
          indirect, incidental, or consequential damages, or for loss of data,
          profits, or business. Our total liability for any claim related to
          the service is limited to the amount you paid us in the twelve months
          before the claim (if you have not paid, that amount is zero).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">7. Changes</h2>
        <p>
          We may update these Terms from time to time. The posted date at the
          top will change when we do. Continued use after changes means you
          accept the updated Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-scribix-text">8. Contact</h2>
        <p>
          Questions about these Terms can be sent through the contact options
          listed on the site, if any are provided.
        </p>
      </section>
    </LegalDocLayout>
  );
}
