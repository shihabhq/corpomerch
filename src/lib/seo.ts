import type { Metadata } from "next";

import { CONTACT, SITE } from "@/data/site";
import { toPlainText, truncate } from "@/lib/utils";
import type { ProductDetailDTO } from "@/types/catalog";

export const absoluteUrl = (path = "/") =>
  new URL(path, SITE.url).toString();

// The <JsonLd> renderer lives in components/shared/JsonLd.tsx so this module
// stays JSX-free and importable from anywhere.

// ─── Organisation / site level ───────────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": absoluteUrl("/#organization"),
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: SITE.url,
    logo: absoluteUrl("/assets/logo.png"),
    image: absoluteUrl("/assets/logo.png"),
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    priceRange: "৳৳",
    currenciesAccepted: "BDT",
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.addressLine,
      addressLocality: CONTACT.addressCity,
      postalCode: CONTACT.addressPostcode,
      addressCountry: "BD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.7509,
      longitude: 90.3833,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    areaServed: { "@type": "Country", name: "Bangladesh" },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE.name,
    url: SITE.url,
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };
}

// ─── Product ─────────────────────────────────────────────────────────────────

/**
 * AggregateOffer, not Offer — the price genuinely is a range across quantity
 * tiers and SKUs, and claiming a single price would be wrong. Products with no
 * published price get no `offers` node at all rather than a fabricated one.
 */
export function productSchema(product: ProductDetailDTO, imageUrls: string[]) {
  const hasPrice =
    product.pricingMode !== "ON_REQUEST" && product.minUnitPrice !== null;

  const offerCount = product.skus.filter(
    (s) => !s.priceOnRequest && s.priceTiers.length > 0,
  ).length;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/products/${product.slug}#product`),
    name: product.name,
    description: toPlainText(
      product.shortDescription ?? product.description ?? product.name,
    ),
    image: imageUrls,
    sku: product.skus[0]?.skuCode ?? product.slug,
    category: product.categories.find((c) => c.isPrimary)?.name,
    brand: { "@type": "Brand", name: SITE.name },
    ...(product.specs.length
      ? {
          additionalProperty: product.specs.map((s) => ({
            "@type": "PropertyValue",
            name: s.key,
            value: s.value,
          })),
        }
      : {}),
    ...(hasPrice
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: product.currency,
            lowPrice: product.minUnitPrice,
            highPrice: product.maxUnitPrice ?? product.minUnitPrice,
            offerCount: Math.max(1, offerCount),
            availability: "https://schema.org/InStock",
            seller: { "@id": absoluteUrl("/#organization") },
            eligibleQuantity: product.effectiveMoq
              ? {
                  "@type": "QuantitativeValue",
                  minValue: product.effectiveMoq,
                  unitText: product.unitLabel ?? product.unit.toLowerCase(),
                }
              : undefined,
          },
        }
      : {}),
  };
}

export function itemListSchema(
  items: { name: string; slug: string }[],
  listName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 20).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(`/products/${item.slug}`),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// ─── Metadata helper ─────────────────────────────────────────────────────────

export function buildMetadata({
  title,
  description,
  path,
  images,
  noIndex,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const desc = truncate(toPlainText(description), 158);

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title,
      description: desc,
      locale: SITE.locale,
      ...(images?.length ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      ...(images?.length ? { images } : {}),
    },
  };
}
