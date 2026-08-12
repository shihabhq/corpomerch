import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { Breadcrumb, Container } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import type { CartPricingSource } from "@/components/cart/CartView";

export const metadata: Metadata = buildMetadata({
  title: "Your inquiry list",
  description:
    "Review the items you have selected and send the whole list to CorpoMerch on WhatsApp for a quote.",
  path: "/cart",
  noIndex: true,
});

// Prices must be current, not cached — a cart persisted last week has to show
// what the admin changed yesterday.
export const dynamic = "force-dynamic";

/**
 * The cart lives in localStorage, so the server cannot know what is in it.
 * Instead we ship every SKU's pricing data (small — 32 rows for this catalogue)
 * and let the client resolve prices with the same resolvePrice() the PDP uses.
 * Nothing here is authoritative: sendInquiry() re-resolves server-side.
 */
async function getPricingSource(): Promise<CartPricingSource> {
  const skus = await prisma.sku.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      product: { status: "PUBLISHED", deletedAt: null },
    },
    select: {
      id: true,
      priceOnRequest: true,
      moq: true,
      priceTiers: {
        orderBy: { minQty: "asc" },
        select: { minQty: true, unitPrice: true },
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

  return Object.fromEntries(
    skus.map((sku) => [
      sku.id,
      {
        skuId: sku.id,
        priceOnRequest: sku.priceOnRequest,
        moq: sku.moq?.toNumber() ?? null,
        priceTiers: sku.priceTiers.map((t) => ({
          minQty: t.minQty.toNumber(),
          unitPrice: t.unitPrice.toNumber(),
        })),
        product: {
          id: sku.product.id,
          slug: sku.product.slug,
          name: sku.product.name,
          unit: sku.product.unit,
          unitLabel: sku.product.unitLabel,
          qtyStep: sku.product.qtyStep.toNumber(),
          moq: sku.product.moq?.toNumber() ?? null,
          pricingMode: sku.product.pricingMode,
        },
      },
    ]),
  );
}

export default async function CartPage() {
  const pricing = await getPricingSource();

  return (
    <>
      <Container>
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Inquiry list" }]}
        />
      </Container>

      <Container className="pb-16">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Your inquiry list
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          There is no checkout here: sending the list opens WhatsApp with
          everything written out, and our team comes back with a firm quote.
        </p>

        <div className="mt-8">
          <CartView pricing={pricing} />
        </div>
      </Container>
    </>
  );
}
