import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/shared/LegalPage";
import { CONTACT, SITE } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description:
    "Terms covering quotations, artwork approval, production tolerances, lead times, delivery and payment for CorpoMerch orders.",
  path: "/terms",
});

const UPDATED = "9 August 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`The terms on which ${SITE.name} quotes, produces and delivers work.`}
      updated={UPDATED}
    >
      <LegalSection heading="1. This website is a catalogue, not a shop">
        <p>
          Prices shown here are indicative bulk rates published in good faith.
          They are not an offer capable of acceptance, and no contract is formed
          by adding items to an inquiry list or sending an inquiry. A binding
          agreement exists only once we issue a written quotation and you confirm
          it.
        </p>
      </LegalSection>

      <LegalSection heading="2. Quotations">
        <p>
          Written quotations are valid for 14 days unless stated otherwise.
          Prices assume the specification quoted; changing size, material,
          quantity, finishing or delivery location may change the price.
        </p>
        <p>
          Quantity-break pricing applies to a single production run. Splitting an
          order into separate runs is priced at the rate for each run&apos;s own
          quantity.
        </p>
      </LegalSection>

      <LegalSection heading="3. Artwork and approval">
        <p>
          You confirm that you own or are licensed to use any logo, image or text
          you supply, and that it does not infringe anyone&apos;s rights. We
          produce exactly what is approved.
        </p>
        <p>
          We issue a digital proof for every job. Production begins only after
          you approve it in writing. Once approved, you are responsible for
          errors in the approved artwork — including spelling, names, dates and
          contact details. Please check names and serial numbers especially
          carefully on certificates and ID cards.
        </p>
      </LegalSection>

      <LegalSection heading="4. Colour and material tolerance">
        <p>
          CMYK printing cannot reproduce every on-screen colour exactly, and the
          same file prints differently on textured paper, PVC and powder-coated
          metal. Reasonable colour variation is not a defect. Where an exact
          match matters, supply a Pantone reference and we will proof on the
          actual material before the run.
        </p>
        <p>
          For large runs, a delivered quantity within 5% of the order is
          considered fulfilment; we invoice the quantity actually delivered.
        </p>
      </LegalSection>

      <LegalSection heading="5. Lead times">
        <p>
          Turnaround stated on a product page or quotation runs in working days
          from artwork approval, not from the date of inquiry. We schedule around
          confirmed event dates where you tell us one.
        </p>
        <p>
          We are not liable for delay caused by late artwork approval, late
          payment, or events outside our reasonable control including power
          supply failure, strikes, hartal, import delay and natural disaster.
        </p>
      </LegalSection>

      <LegalSection heading="6. Payment">
        <p>
          Standard terms are 50% advance to start production and the balance
          before delivery. We accept bank transfer, bKash and Nagad. Registered
          corporate and institutional clients may arrange purchase-order terms in
          advance.
        </p>
        <p>Goods remain our property until paid for in full.</p>
      </LegalSection>

      <LegalSection heading="7. Delivery">
        <p>
          Delivery inside Dhaka is arranged by us. Outside Dhaka we use third-party
          couriers and the cost is quoted separately based on weight and
          destination. Risk passes on delivery to you or your nominated courier.
        </p>
        <p>
          Please inspect goods on receipt and report shortages or visible damage
          within 48 hours.
        </p>
      </LegalSection>

      <LegalSection heading="8. Custom goods">
        <p>
          Everything we make is personalised to your order and cannot be resold.
          Custom orders therefore cannot be cancelled once production has begun,
          and are not returnable except where defective. See our{" "}
          <a href="/returns">returns and reprints</a> page.
        </p>
      </LegalSection>

      <LegalSection heading="9. Liability">
        <p>
          Our liability for any order is limited to the value of that order. We
          are not liable for indirect or consequential loss, including lost
          profit or the cost of an event proceeding without the goods. Nothing
          here limits liability that cannot be limited by law.
        </p>
      </LegalSection>

      <LegalSection heading="10. Governing law">
        <p>
          These terms are governed by the laws of Bangladesh and subject to the
          exclusive jurisdiction of the courts of Dhaka.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {SITE.legalName}
          <br />
          {CONTACT.addressLine}, {CONTACT.addressCity}{" "}
          {CONTACT.addressPostcode}
          <br />
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> ·{" "}
          {CONTACT.phoneDisplay}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
