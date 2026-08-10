"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { money, resolvePrice } from "@/lib/pricing";
import { inquiryRef } from "@/lib/utils";
import { buildInquiryMessage, whatsAppUrl, type WhatsAppLine } from "@/lib/whatsapp";

/**
 * The only write path a storefront visitor has.
 *
 * The client sends product ids, sku ids and quantities — nothing else is
 * trusted. Every price is re-resolved here from the database, so a tampered
 * localStorage cart or a hand-crafted request cannot change what we quote.
 *
 * Logging must never block the redirect: if the insert fails we still return a
 * usable WhatsApp URL built from the same server-resolved data. A lost
 * analytics row is acceptable; a lost customer is not.
 */

export interface InquiryItemInput {
  productId: string;
  skuId: string;
  quantity: number;
  note?: string;
}

export interface InquiryContactInput {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  message?: string;
}

export interface InquiryResult {
  ref: string;
  whatsappUrl: string;
  /** False when the row could not be written — the WhatsApp link still works. */
  logged: boolean;
}

const MAX_ITEMS = 50;
const MAX_QTY = 1_000_000;

export async function sendInquiry({
  source,
  items,
  contact,
}: {
  source: "PRODUCT" | "CART" | "CONTACT";
  items: InquiryItemInput[];
  contact?: InquiryContactInput;
}): Promise<InquiryResult> {
  const ref = inquiryRef();

  const safeItems = items
    .filter((i) => i.productId && i.skuId)
    .slice(0, MAX_ITEMS)
    .map((i) => ({
      ...i,
      quantity: Math.min(MAX_QTY, Math.max(0, Number(i.quantity) || 0)),
      note: i.note?.slice(0, 500),
    }));

  // ── Re-resolve everything from the database ──
  const skus = await prisma.sku.findMany({
    where: {
      id: { in: safeItems.map((i) => i.skuId) },
      deletedAt: null,
      product: { status: "PUBLISHED", deletedAt: null },
    },
    include: {
      priceTiers: { orderBy: { minQty: "asc" } },
      optionValues: {
        include: {
          option: { select: { name: true, position: true } },
          optionValue: { select: { label: true, valueCode: true } },
        },
      },
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          unit: true,
          unitLabel: true,
          qtyStep: true,
          moq: true,
          pricingMode: true,
        },
      },
    },
  });

  const bySkuId = new Map(skus.map((s) => [s.id, s]));

  const resolved: {
    input: (typeof safeItems)[number];
    sku: (typeof skus)[number];
    unitPrice: number | null;
    lineTotal: number | null;
    options: { option: string; value: string }[];
    optionQuery: string;
  }[] = [];

  for (const item of safeItems) {
    const sku = bySkuId.get(item.skuId);
    if (!sku) continue; // unpublished or deleted since it was added to the cart

    const product = sku.product;
    const priced = resolvePrice({
      product: {
        pricingMode: product.pricingMode,
        moq: product.moq?.toNumber() ?? null,
        qtyStep: product.qtyStep.toNumber(),
        unit: product.unit,
      },
      sku: {
        id: sku.id,
        priceOnRequest: sku.priceOnRequest,
        moq: sku.moq?.toNumber() ?? null,
        priceTiers: sku.priceTiers.map((t) => ({
          minQty: t.minQty.toNumber(),
          unitPrice: t.unitPrice.toNumber(),
        })),
      },
      quantity: item.quantity,
    });

    const options = [...sku.optionValues]
      .sort((a, b) => a.option.position - b.option.position)
      .map((ov) => ({
        option: ov.option.name,
        value: ov.optionValue.label,
        code: ov.optionValue.valueCode,
      }));

    const query = options.length
      ? `?${options
          .map(
            (o) =>
              `${encodeURIComponent(
                o.option.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              )}=${encodeURIComponent(o.code)}`,
          )
          .join("&")}`
      : "";

    resolved.push({
      input: item,
      sku,
      unitPrice: priced.unitPrice,
      lineTotal: priced.lineTotal,
      options: options.map(({ option, value }) => ({ option, value })),
      optionQuery: query,
    });
  }

  const total = resolved.reduce((sum, r) => sum + (r.lineTotal ?? 0), 0);
  const totalOrNull = total > 0 ? money(total) : null;

  const waLines: WhatsAppLine[] = resolved.map((r) => ({
    productName: r.sku.product.name,
    productSlug: r.sku.product.slug,
    optionQuery: r.optionQuery,
    options: r.options,
    quantity: r.input.quantity,
    unit: r.sku.product.unit,
    unitLabel: r.sku.product.unitLabel,
    unitPrice: r.unitPrice,
    lineTotal: r.lineTotal,
    note: r.input.note,
  }));

  const message = buildInquiryMessage({
    lines: waLines,
    total: totalOrNull,
    ref,
    contact,
  });
  const url = whatsAppUrl(message);

  // ── Log it. Never let a failure here break the flow. ──
  let logged = false;
  try {
    const headerList = await headers();

    await prisma.inquiry.create({
      data: {
        ref,
        source,
        name: contact?.name?.slice(0, 120),
        company: contact?.company?.slice(0, 160),
        phone: contact?.phone?.slice(0, 40),
        email: contact?.email?.slice(0, 160),
        message: contact?.message?.slice(0, 2000),
        totalEstimate: totalOrNull,
        userAgent: headerList.get("user-agent")?.slice(0, 400),
        referer: headerList.get("referer")?.slice(0, 400),
        items: {
          create: resolved.map((r) => ({
            productId: r.sku.product.id,
            skuId: r.sku.id,
            quantity: r.input.quantity,
            unitPrice: r.unitPrice,
            lineTotal: r.lineTotal,
            note: r.input.note,
            productNameSnapshot: r.sku.product.name,
            productSlugSnapshot: r.sku.product.slug,
            optionsSnapshot: r.options,
            unitSnapshot: r.sku.product.unit,
          })),
        },
      },
    });
    logged = true;
  } catch (error) {
    console.error("[inquiry] failed to log", ref, error);
  }

  return { ref, whatsappUrl: url, logged };
}
