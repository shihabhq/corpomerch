import type { PricingModeLike, SkuLike, UnitKindLike } from "@/lib/pricing";

/**
 * Plain, serialisable DTOs.
 *
 * Prisma `Decimal` cannot cross the server/client component boundary — it
 * throws at serialisation. Every query in src/lib/queries.ts maps to these
 * types, so nothing downstream ever sees a Decimal or a Date object.
 */

export interface ProductImageDTO {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  /** null = shared gallery; set = scoped to an axis-1 option value. */
  optionValueId: string | null;
}

export interface OptionValueDTO {
  id: string;
  label: string;
  valueCode: string;
  swatchHex: string | null;
  description: string | null;
  isDefault: boolean;
  /** Images belonging to this value. Only ever populated on axis 1. */
  images: ProductImageDTO[];
}

export interface ProductOptionDTO {
  id: string;
  /** 1 swaps images; 2 and 3 affect price only. */
  position: number;
  name: string;
  /** URL query key, derived from the name: "Hook Type" -> "hook-type". */
  paramKey: string;
  helpText: string | null;
  displayAs: "CHIP" | "SWATCH" | "DROPDOWN" | "IMAGE";
  values: OptionValueDTO[];
}

export interface SkuDTO extends SkuLike {
  skuCode: string | null;
  label: string | null;
  isDefault: boolean;
  /** optionId -> optionValueId, for matching a selection to this SKU. */
  optionValueIds: Record<string, string>;
}

export interface SpecRow {
  group?: string;
  key: string;
  value: string;
}

export interface CategoryRefDTO {
  id: string;
  slug: string;
  name: string;
  isPrimary: boolean;
  parentSlug: string | null;
  parentName: string | null;
}

/** Everything a product card needs — nothing more. */
export interface ProductCardDTO {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  shortDescription: string | null;
  unit: UnitKindLike;
  unitLabel: string | null;
  minUnitPrice: number | null;
  maxUnitPrice: number | null;
  effectiveMoq: number | null;
  pricingMode: PricingModeLike;
  isFeatured: boolean;
  badgeText: string | null;
  image: ProductImageDTO | null;
  primaryCategory: { slug: string; name: string } | null;
  variantCount: number;
}

/** The full product detail payload. */
export interface ProductDetailDTO {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  shortDescription: string | null;
  description: string | null;
  specs: SpecRow[];
  tags: string[];

  unit: UnitKindLike;
  unitLabel: string | null;
  qtyStep: number;
  moq: number | null;
  pricingMode: PricingModeLike;
  currency: string;

  leadTimeDaysMin: number | null;
  leadTimeDaysMax: number | null;
  badgeText: string | null;

  minUnitPrice: number | null;
  maxUnitPrice: number | null;
  effectiveMoq: number | null;

  seoTitle: string | null;
  seoDescription: string | null;

  categories: CategoryRefDTO[];
  options: ProductOptionDTO[];
  skus: SkuDTO[];
  /** Images with optionValueId === null. Shown for every variant. */
  sharedImages: ProductImageDTO[];
  /**
   * True only when two or more axis-1 values have their own images. When false
   * the gallery must not cross-fade on selection — fading to an identical
   * image reads as a broken control.
   */
  swapsOnAxis1: boolean;
}

export interface CategoryTreeDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconKey: string | null;
  productCount: number;
  children: CategoryTreeDTO[];
}

/** A top-level category plus one representative product photo, for the
 * homepage carousel. Falls back to `iconKey` when no product in the
 * category (or its children) has a photo yet. */
export interface CategoryShowcaseDTO {
  id: string;
  slug: string;
  name: string;
  iconKey: string | null;
  productCount: number;
  image: ProductImageDTO | null;
}
