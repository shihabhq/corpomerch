import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/shared/LegalPage";
import { CONTACT, SITE } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How CorpoMerch collects, uses and protects the information you share when you request a quote or contact us.",
  path: "/privacy-policy",
});

const UPDATED = "9 August 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`How ${SITE.name} handles the information you share with us.`}
      updated={UPDATED}
    >
      <LegalSection heading="The short version">
        <p>
          We do not have user accounts, we do not take payments on this website,
          and we do not sell data to anyone. The only personal information we
          hold is what you choose to send us when you ask for a quote.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>When you send an inquiry from this site, we record:</p>
        <ul>
          <li>
            The products, options and quantities you selected, and the prices
            shown at the time.
          </li>
          <li>
            Any name, company, phone number or note you typed into the inquiry
            form. All of these fields are optional.
          </li>
          <li>
            Basic technical information about the request: your browser&apos;s
            user-agent string and the page you came from, used to spot abuse
            and to understand which pages generate inquiries.
          </li>
        </ul>
        <p>
          Once the inquiry opens WhatsApp, the conversation itself takes place on
          WhatsApp and is subject to their privacy policy, not ours.
        </p>
      </LegalSection>

      <LegalSection heading="What we do not collect">
        <ul>
          <li>
            No payment or card details. There is no checkout on this website.
          </li>
          <li>No passwords or accounts. There is no customer login.</li>
          <li>No location tracking beyond what your browser sends normally.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Why we hold it">
        <p>
          Solely to quote and fulfil your request, to follow up on an inquiry you
          started, and to keep records of jobs we have produced. We also look at
          which products are asked about most, in aggregate, to decide what to
          stock and price.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          Your inquiry list is stored in your own browser&apos;s local storage so
          it survives a page refresh. It never leaves your device until you press
          Send Inquiry. We do not use advertising cookies or cross-site trackers.
        </p>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          Nobody, other than the production partners who need the artwork and
          delivery details to make and deliver your order, and our hosting and
          database providers who store the data on our behalf. We do not sell or
          rent contact information.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Inquiry records are retained for as long as they are commercially
          useful, typically three years, so we can honour repeat orders and
          reprint from previous artwork. You can ask us to delete yours sooner.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <p>
          Email{" "}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> and we will tell
          you what we hold about you, correct it, or delete it. There is no form
          to fill in.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {SITE.legalName}
          <br />
          {CONTACT.addressLine}, {CONTACT.addressCity}{" "}
          {CONTACT.addressPostcode}, {CONTACT.addressCountry}
          <br />
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> ·{" "}
          {CONTACT.phoneDisplay}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
