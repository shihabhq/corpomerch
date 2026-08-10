import { CONTACT, SITE } from "@/data/site";
import type { UnitKindLike } from "@/lib/pricing";
import { formatBDT, formatQty } from "@/lib/utils";

/**
 * Builds the plain-text WhatsApp message.
 *
 * Two things this must always carry, because they are what the sales team
 * actually uses: the deep link back to the exact configured variant, and the
 * #CM-XXXX reference that ties the chat to the logged inquiry row.
 */

export interface WhatsAppLine {
  productName: string;
  productSlug: string;
  optionQuery?: string;
  options: { option: string; value: string }[];
  quantity: number;
  unit: UnitKindLike;
  unitLabel?: string | null;
  unitPrice: number | null;
  lineTotal: number | null;
  note?: string | null;
}

export interface WhatsAppPayload {
  lines: WhatsAppLine[];
  total: number | null;
  ref: string;
  contact?: { name?: string; company?: string; phone?: string };
}

export function buildInquiryMessage({
  lines,
  total,
  ref,
  contact,
}: WhatsAppPayload): string {
  const parts: string[] = [];

  parts.push(
    lines.length === 1
      ? "Hello CorpoMerch! I'd like a quote for:"
      : `Hello CorpoMerch! I'd like a quote for ${lines.length} items:`,
  );
  parts.push("");

  lines.forEach((line, i) => {
    const prefix = lines.length > 1 ? `${i + 1}. ` : "";
    const optionSuffix = line.options.length
      ? ` — ${line.options.map((o) => o.value).join(" / ")}`
      : "";

    parts.push(`${prefix}*${line.productName}*${optionSuffix}`);

    const qty = formatQty(line.quantity, line.unit, line.unitLabel);
    parts.push(
      line.unitPrice === null
        ? `   Qty: ${qty} — price on request`
        : `   Qty: ${qty} @ ${formatBDT(line.unitPrice)} = ${formatBDT(line.lineTotal)}`,
    );

    if (line.note) parts.push(`   Note: ${line.note}`);

    parts.push(
      `   ${SITE.url}/products/${line.productSlug}${line.optionQuery ?? ""}`,
    );
    parts.push("");
  });

  if (total !== null && total > 0) {
    const anyOnRequest = lines.some((l) => l.unitPrice === null);
    parts.push(
      anyOnRequest
        ? `Estimated total (priced items only): ${formatBDT(total)}`
        : `Estimated total: ${formatBDT(total)}`,
    );
  }

  if (contact?.name || contact?.company || contact?.phone) {
    parts.push("");
    if (contact.name) parts.push(`Name: ${contact.name}`);
    if (contact.company) parts.push(`Company: ${contact.company}`);
    if (contact.phone) parts.push(`Phone: ${contact.phone}`);
  }

  parts.push("");
  parts.push(`Ref: #${ref}`);

  return parts.join("\n");
}

export function whatsAppUrl(message: string, number = CONTACT.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
