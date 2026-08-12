import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/shared/LegalPage";
import { CONTACT } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Returns & Reprints",
  description:
    "What happens if a CorpoMerch order arrives faulty, short or wrong: our reprint policy, timelines and how to report a problem.",
  path: "/returns",
});

const UPDATED = "9 August 2026";

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Returns & Reprints"
      intro="Everything we make is personalised, so this is a reprint policy rather than a returns policy."
      updated={UPDATED}
    >
      <LegalSection heading="Why custom work is different">
        <p>
          A thousand certificates with your delegates&apos; names on them have no
          value to anyone else, so we cannot restock or resell them. That means
          we cannot accept change-of-mind returns on personalised goods. What we
          can do, and do without argument, is put right anything that is our
          fault.
        </p>
      </LegalSection>

      <LegalSection heading="We reprint free of charge if">
        <ul>
          <li>
            The delivered goods differ from the artwork you approved: wrong
            text, wrong colour reference, wrong size or wrong material.
          </li>
          <li>
            There is a manufacturing defect: misregistration, ink smudging,
            peeling lamination, a broken hook, a cracked keyring, a leaking cap.
          </li>
          <li>
            The delivered quantity is more than 5% short of the ordered quantity.
          </li>
          <li>Goods are damaged in transit where we arranged the delivery.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="We cannot reprint free of charge if">
        <ul>
          <li>
            The error was present in the artwork you approved. This is the most
            common case, and it is why we ask you to read every proof carefully,
            especially names, dates, spellings and serial numbers.
          </li>
          <li>
            The complaint is reasonable colour variation within normal print
            tolerance. See clause 4 of our <a href="/terms">terms</a>.
          </li>
          <li>
            The specification changed after approval, or you have simply changed
            your mind.
          </li>
          <li>Damage occurred after delivery, in storage or during your event.</li>
        </ul>
        <p>
          In these cases we will always quote a reprint at cost price and
          prioritise it if you have a deadline.
        </p>
      </LegalSection>

      <LegalSection heading="Timelines">
        <ul>
          <li>
            <strong>Report within 48 hours of delivery</strong> for shortages and
            visible transit damage.
          </li>
          <li>
            <strong>Report within 7 days</strong> for manufacturing defects and
            specification errors.
          </li>
          <li>
            Reprints are scheduled ahead of the normal queue and typically
            dispatch in half the standard lead time.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How to report a problem">
        <p>
          Message us on WhatsApp at{" "}
          <a
            href={`https://wa.me/${CONTACT.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CONTACT.phoneDisplay}
          </a>{" "}
          with your inquiry reference (the <code>#CM-XXXX</code> code from your
          original message), a photo of the problem, and the quantity affected.
          Photographs of the actual goods next to the approved proof resolve
          almost every case in a single message.
        </p>
        <p>
          Please keep the affected goods until the matter is settled, we may ask
          to collect a sample.
        </p>
      </LegalSection>

      <LegalSection heading="Samples avoid all of this">
        <p>
          For any large or unfamiliar run, ask for a physical sample before
          production. It is charged at the single-piece rate, adds a few days,
          and is by far the cheapest way to avoid a five-figure reprint
          conversation.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
