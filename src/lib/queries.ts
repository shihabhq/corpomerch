import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { imageUrl } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type {
  CategoryShowcaseDTO,
  CategoryTreeDTO,
  ProductCardDTO,
  ProductDetailDTO,
  ProductImageDTO,
  ProductOptionDTO,
  SkuDTO,
  SpecRow,
} from "@/types/catalog";

/**
 * The ONLY place Prisma rows become plain DTOs.
 *
 * Two rules hold everywhere in this file:
 *   1. Public queries always filter `status: PUBLISHED` and `deletedAt: null`.
 *      That lives in PUBLISHED below so no call site can forget it.
 *   2. Nothing returns a Decimal or a Date. Both break serialisation into a
 *      client component.
 */

const PUBLISHED = {
  status: "PUBLISHED",
  deletedAt: null,
} satisfies Prisma.ProductWhereInput;

const dec = (v: Prisma.Decimal | null | undefined): number | null =>
  v == null ? null : v.toNumber();

// ─── Mappers ─────────────────────────────────────────────────────────────────

type ImageRow = {
  id: string;
  storagePath: string | null;
  externalUrl: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  optionValueId: string | null;
};

function toImage(row: ImageRow): ProductImageDTO {
  return {
    id: row.id,
    url: imageUrl(row),
    alt: row.alt,
    width: row.width,
    height: row.height,
    blurDataUrl: row.blurDataUrl,
    optionValueId: row.optionValueId,
  };
}

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  shortDescription: true,
  unit: true,
  unitLabel: true,
  minUnitPrice: true,
  maxUnitPrice: true,
  effectiveMoq: true,
  pricingMode: true,
  isFeatured: true,
  badgeText: true,
  primaryImage: {
    select: {
      id: true,
      storagePath: true,
      externalUrl: true,
      alt: true,
      width: true,
      height: true,
      blurDataUrl: true,
      optionValueId: true,
    },
  },
  categories: {
    where: { isPrimary: true },
    select: { category: { select: { slug: true, name: true } } },
    take: 1,
  },
  _count: { select: { skus: true } },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

function toCard(row: ProductCardRow): ProductCardDTO {
  const primary = row.categories[0]?.category ?? null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    shortDescription: row.shortDescription,
    unit: row.unit,
    unitLabel: row.unitLabel,
    minUnitPrice: dec(row.minUnitPrice),
    maxUnitPrice: dec(row.maxUnitPrice),
    effectiveMoq: dec(row.effectiveMoq),
    pricingMode: row.pricingMode,
    isFeatured: row.isFeatured,
    badgeText: row.badgeText,
    image: row.primaryImage ? toImage(row.primaryImage) : null,
    primaryCategory: primary,
    variantCount: row._count.skus,
  };
}

// ─── Products ────────────────────────────────────────────────────────────────

export type SortKey = "featured" | "name" | "price-asc" | "price-desc" | "newest";

export interface ProductListParams {
  categorySlug?: string;
  query?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  maxMoq?: number;
  hasVariants?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

const SORTS: Record<SortKey, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  name: [{ name: "asc" }],
  // Products with no listed price sort last rather than first.
  "price-asc": [{ minUnitPrice: { sort: "asc", nulls: "last" } }, { name: "asc" }],
  "price-desc": [{ minUnitPrice: { sort: "desc", nulls: "last" } }, { name: "asc" }],
  newest: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
};

function buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { ...PUBLISHED };
  const and: Prisma.ProductWhereInput[] = [];

  if (params.categorySlug) {
    // Match the category itself or any of its children, so a parent page shows
    // everything beneath it.
    and.push({
      categories: {
        some: {
          category: {
            OR: [
              { slug: params.categorySlug },
              { parent: { slug: params.categorySlug } },
            ],
          },
        },
      },
    });
  }

  if (params.query?.trim()) {
    const q = params.query.trim();
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q.toLowerCase()] } },
      ],
    });
  }

  if (params.unit) and.push({ unit: params.unit as Prisma.ProductWhereInput["unit"] });
  if (params.minPrice != null) and.push({ minUnitPrice: { gte: params.minPrice } });
  if (params.maxPrice != null) and.push({ minUnitPrice: { lte: params.maxPrice } });
  if (params.maxMoq != null) and.push({ effectiveMoq: { lte: params.maxMoq } });
  if (params.hasVariants) and.push({ options: { some: {} } });

  if (and.length) where.AND = and;
  return where;
}

export async function listProducts(params: ProductListParams = {}) {
  const perPage = params.perPage ?? 24;
  const page = Math.max(1, params.page ?? 1);
  const where = buildWhere(params);

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy: SORTS[params.sort ?? "featured"],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: rows.map(toCard),
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardDTO[]> {
  const rows = await prisma.product.findMany({
    where: { ...PUBLISHED, isFeatured: true },
    select: productCardSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: limit,
  });
  return rows.map(toCard);
}

export async function getRelatedProducts(
  productId: string,
  categorySlugs: string[],
  limit = 6,
): Promise<ProductCardDTO[]> {
  if (categorySlugs.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: {
      ...PUBLISHED,
      id: { not: productId },
      categories: { some: { category: { slug: { in: categorySlugs } } } },
    },
    select: productCardSelect,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: limit,
  });
  return rows.map(toCard);
}

export async function getProductDetail(
  slug: string,
): Promise<ProductDetailDTO | null> {
  const row = await prisma.product.findFirst({
    where: { ...PUBLISHED, slug },
    include: {
      categories: {
        include: {
          category: { include: { parent: { select: { slug: true, name: true } } } },
        },
        orderBy: { sortOrder: "asc" },
      },
      options: {
        orderBy: { position: "asc" },
        include: { values: { orderBy: { sortOrder: "asc" } } },
      },
      images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      skus: {
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          priceTiers: { orderBy: { minQty: "asc" } },
          optionValues: true,
        },
      },
    },
  });

  if (!row) return null;

  const imagesByValue = new Map<string, ProductImageDTO[]>();
  const sharedImages: ProductImageDTO[] = [];
  for (const img of row.images) {
    const dto = toImage(img);
    if (img.optionValueId) {
      const list = imagesByValue.get(img.optionValueId) ?? [];
      list.push(dto);
      imagesByValue.set(img.optionValueId, list);
    } else {
      sharedImages.push(dto);
    }
  }

  const options: ProductOptionDTO[] = row.options.map((opt) => ({
    id: opt.id,
    position: opt.position,
    name: opt.name,
    paramKey: slugify(opt.name),
    helpText: opt.helpText,
    displayAs: opt.displayAs,
    values: opt.values.map((v) => ({
      id: v.id,
      label: v.label,
      valueCode: v.valueCode,
      swatchHex: v.swatchHex,
      description: v.description,
      isDefault: v.isDefault,
      images: imagesByValue.get(v.id) ?? [],
    })),
  }));

  const axis1 = options.find((o) => o.position === 1);
  const valuesWithImages = axis1?.values.filter((v) => v.images.length > 0).length ?? 0;

  const skus: SkuDTO[] = row.skus.map((sku) => ({
    id: sku.id,
    skuCode: sku.skuCode,
    label: sku.label,
    isDefault: sku.isDefault,
    priceOnRequest: sku.priceOnRequest,
    moq: dec(sku.moq),
    priceTiers: sku.priceTiers.map((t) => ({
      minQty: t.minQty.toNumber(),
      unitPrice: t.unitPrice.toNumber(),
      compareAtPrice: dec(t.compareAtPrice),
      note: t.note,
    })),
    optionValueIds: Object.fromEntries(
      sku.optionValues.map((ov) => [ov.optionId, ov.optionValueId]),
    ),
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    shortDescription: row.shortDescription,
    description: row.description,
    specs: Array.isArray(row.specs) ? (row.specs as unknown as SpecRow[]) : [],
    tags: row.tags,
    unit: row.unit,
    unitLabel: row.unitLabel,
    qtyStep: row.qtyStep.toNumber(),
    moq: dec(row.moq),
    pricingMode: row.pricingMode,
    currency: row.currency,
    leadTimeDaysMin: row.leadTimeDaysMin,
    leadTimeDaysMax: row.leadTimeDaysMax,
    badgeText: row.badgeText,
    minUnitPrice: dec(row.minUnitPrice),
    maxUnitPrice: dec(row.maxUnitPrice),
    effectiveMoq: dec(row.effectiveMoq),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categories: row.categories.map((pc) => ({
      id: pc.category.id,
      slug: pc.category.slug,
      name: pc.category.name,
      isPrimary: pc.isPrimary,
      parentSlug: pc.category.parent?.slug ?? null,
      parentName: pc.category.parent?.name ?? null,
    })),
    options,
    skus,
    sharedImages,
    swapsOnAxis1: valuesWithImages >= 2,
  };
}

export async function getAllProductSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return prisma.product.findMany({
    where: PUBLISHED,
    select: { slug: true, updatedAt: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategoryTree(): Promise<CategoryTreeDTO[]> {
  const rows = await prisma.category.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      children: {
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  return rows
    .filter((c) => c.parentId === null)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      iconKey: c.iconKey,
      // A parent's own count excludes children, so roll them up for the nav.
      productCount:
        c._count.products +
        c.children.reduce((sum, ch) => sum + ch._count.products, 0),
      children: c.children.map((ch) => ({
        id: ch.id,
        slug: ch.slug,
        name: ch.name,
        description: ch.description,
        iconKey: ch.iconKey,
        productCount: ch._count.products,
        children: [],
      })),
    }));
}

/**
 * Top-level categories for the homepage carousel, each paired with one
 * representative product photo (preferring a featured product; falling
 * back to any child category's products since real catalogue products are
 * often only tagged on the leaf category). `Category.imagePath` exists in
 * the schema for a curated category photo but nothing populates it yet, so
 * a product photo is a better bet than an empty tile — the icon is the
 * final fallback.
 */
export async function getCategoryShowcase(): Promise<CategoryShowcaseDTO[]> {
  const parents = await prisma.category.findMany({
    where: { status: "PUBLISHED", deletedAt: null, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      children: {
        where: { status: "PUBLISHED", deletedAt: null },
        select: { id: true, _count: { select: { products: true } } },
      },
    },
  });

  return Promise.all(
    parents.map(async (c) => {
      const categoryIds = [c.id, ...c.children.map((ch) => ch.id)];
      const link = await prisma.productCategory.findFirst({
        where: { categoryId: { in: categoryIds }, product: PUBLISHED },
        orderBy: [{ product: { isFeatured: "desc" } }, { sortOrder: "asc" }],
        select: {
          product: {
            select: {
              primaryImage: {
                select: {
                  id: true,
                  storagePath: true,
                  externalUrl: true,
                  alt: true,
                  width: true,
                  height: true,
                  blurDataUrl: true,
                  optionValueId: true,
                },
              },
            },
          },
        },
      });

      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        iconKey: c.iconKey,
        productCount:
          c._count.products +
          c.children.reduce((sum, ch) => sum + ch._count.products, 0),
        image: link?.product.primaryImage ? toImage(link.product.primaryImage) : null,
      };
    }),
  );
}

export async function getCategory(slug: string) {
  return prisma.category.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: {
      parent: { select: { slug: true, name: true } },
      children: {
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: { slug: true, name: true, iconKey: true },
      },
    },
  });
}

export async function getAllCategorySlugs() {
  return prisma.category.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: { slug: true, updatedAt: true },
  });
}

// ─── Site content ────────────────────────────────────────────────────────────

export async function getSiteSettings() {
  return prisma.siteSetting.findUnique({ where: { id: 1 } });
}

export async function getFaqs() {
  return prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }],
    select: { id: true, question: true, answer: true, category: true },
  });
}

export async function getPartners() {
  return prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, logoPath: true, website: true },
  });
}

export async function getHomepageBanners() {
  return prisma.homepageBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** One photograph in a case study's gallery, as stored in PortfolioItem.gallery. */
export interface PortfolioImage {
  storagePath: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
}

function toGallery(value: unknown): PortfolioImage[] {
  return Array.isArray(value) ? (value as PortfolioImage[]) : [];
}

export async function getPortfolioItems() {
  const rows = await prisma.portfolioItem.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { eventDate: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      client: true,
      eventType: true,
      summary: true,
      coverPath: true,
      eventDate: true,
      gallery: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    gallery: toGallery(row.gallery),
    imageCount: toGallery(row.gallery).length,
  }));
}

export async function getPortfolioItem(slug: string) {
  const row = await prisma.portfolioItem.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      products: {
        // Filter at the database, not after — an unpublished product must not
        // reach the page at all, or the case study links to a 404.
        where: { product: PUBLISHED },
        orderBy: { sortOrder: "asc" },
        select: { product: { select: productCardSelect } },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    eventType: row.eventType,
    summary: row.summary,
    description: row.description,
    eventDate: row.eventDate,
    coverPath: row.coverPath,
    gallery: toGallery(row.gallery),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    // Only surface products that are still published — a case study should
    // never link to a 404.
    products: row.products
      .map((link) => link.product)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map(toCard),
  };
}

export async function getAllPortfolioSlugs() {
  return prisma.portfolioItem.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
}
