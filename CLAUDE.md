@AGENTS.md

# CorpoMerch — Storefront (`corpomerch-client`)

Public marketing + catalogue site for **CorpoMerch by Backstage**, a Dhaka-based supplier of
customised corporate merchandise and print. Deployed at `https://corpomerch.com`.

The companion admin panel lives in the sibling folder `../corpomerch-admin` and owns the
database schema. **Never edit the Prisma schema or write a migration from this app.**

---

## 1. The one rule that shapes everything

> **This is a catalogue-and-quote site, not a shop.**

There is **no checkout, no payment, no user accounts, no order management, no stock tracking**.
Every conversion path ends in a **WhatsApp message**.

If you find yourself about to build a "Buy Now" button, a payment integration, an order status
page, a login form, or an inventory counter — stop. It is out of scope by design. The business
runs its operations through WhatsApp deliberately.

The two — and only two — actions on a product are:

| Action | Behaviour |
|---|---|
| **Send Inquiry** (primary, brand red) | Log the inquiry to Postgres, then open `wa.me` with a pre-filled message |
| **Add to Cart** (secondary, outline) | Push a line into the local cart; the cart page's only action is *also* Send Inquiry |

---

## 2. Business facts (hardcode nowhere — import from `src/data/site.ts`)

```
Name       CorpoMerch (a Backstage Ltd. brand)
Domain     corpomerch.com
Address    Shop 128, 68-69 Concept Tower, Greenroad, Panthapath, Dhaka 1205, Bangladesh
Email      backstageltd.int@gmail.com
Phone      +880 1612-170202
WhatsApp   8801612170202          (env: NEXT_PUBLIC_WHATSAPP_NUMBER)
Currency   BDT — always rendered with the ৳ symbol
```

What CorpoMerch sells: ID cards & lanyards, keyrings, pens, notepads, drinkware (bottles,
flasks, mugs), umbrellas, card holders, goody bags, gift boxes, and print of every kind —
certificates, magazines, tickets, PVC banners, step-and-repeat backdrops, X-banners. Framed as
*"an event-management supplier of every possible thing."*

Audience is **B2B and event organisers buying in bulk**, not individual consumers. Copy should
speak to procurement and event leads: MOQ, turnaround, artwork formats, bulk pricing.

---

## 3. Stack & hard constraints

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | **Tailwind v4, CSS-first.** All tokens in the `@theme` block of `src/app/globals.css`. There is no `tailwind.config.*` and none should be created. |
| Components | **Hand-rolled. No shadcn/ui, no Radix, no MUI, no component library of any kind.** This is deliberate — the storefront must look bespoke, not like a template. (The *admin* app does use shadcn; do not copy patterns across.) |
| Data | **Prisma** (`src/lib/prisma.ts`) in server components and server actions only |
| Fonts | `Geist` + `Geist_Mono` via `next/font/google`, already wired in `layout.tsx` |
| Cart state | `zustand` + `persist` (localStorage) |
| Icons | `lucide-react` |
| Carousel | `swiper` |
| Toasts | `sonner` |
| Images | `next/image` — yes, actually use it here |
| Theme | **Light mode only.** No dark-mode variants. |

### Rules that will not be relaxed

1. **Server components by default.** Reach for `"use client"` only where there is real
   interaction: variant selector, quantity input, gallery/lightbox, cart, nav drawer, search box.
2. **Prisma never crosses into a client component.** Query in the server component, pass plain
   serialisable props down. `Decimal` must be converted (`.toNumber()` / `String()`) at the
   boundary — a raw Prisma `Decimal` will throw when serialised to a client component.
3. **No API routes for reading catalogue data.** Server components query Prisma directly.
   `src/app/api/` exists only for `revalidate` (admin webhook).
4. **The Supabase anon key can read nothing.** RLS is deny-by-default. Supabase is used here
   purely for public Storage image URLs. If you need data, use Prisma.
5. **Never use `SUPABASE_SECRET_KEY` in this app.** It does not belong here at all.

---

## 4. Design system

### Colour — red and black on white, from the logo

```css
--color-brand:       #D12429;  /* sampled from the logo — primary CTA, active states, prices */
--color-brand-dark:  #A81319;  /* hover / pressed */
--color-brand-light: #F5343A;  /* gradient partner, subtle accents */
--color-brand-tint:  #FEF2F2;  /* wash backgrounds, selected-chip fill */
--color-ink:         #0A0A0A;  /* headings, primary text */
--color-body:        #3F3F46;  /* body copy */
--color-muted:       #71717A;  /* meta, labels, captions */
--color-line:        #E4E4E7;  /* borders, dividers */
--color-surface:     #FAFAFA;  /* image pads, section bands */
```

Everything else comes from stock Tailwind greys. Semantic usage:

- **Brand red** — primary CTA, price figures, active variant chip, active tier row, active nav
  underline, badge fills. Use it with discipline; red loses all meaning if the page is soaked in it.
- **Black/ink** — headings and structure. This is a black-and-white site with red punctuation.
- Green only for a "You save" style figure; amber only for MOQ warnings.

### Extra breakpoints (added to the Tailwind defaults)

```css
--breakpoint-xs: 30rem;   /* 480px — bottom bar / 2-col split */
--breakpoint-ml: 56rem;   /* 896px — desktop nav split */
```

### Layout constants

```
Container   max-w-[1280px] mx-auto px-4 sm:px-6      (exported as CONTAINER from src/lib/utils)
Section     py-12 md:py-16, headings mb-6 md:mb-8
Radii       cards rounded-xl · buttons/inputs rounded-lg · chips/badges rounded-full
Cards       border border-line shadow-sm → hover:shadow-lg hover:-translate-y-0.5
Touch       active:scale-[0.98] on every tappable card and button
Transitions transition-all duration-200 (300 for gallery cross-fades)
Focus       focus-visible:ring-2 ring-brand/30 ring-offset-2 — never remove the outline
```

### Typography

Geist Sans is the SF Pro stand-in. The fallback stack in `globals.css` leads with
`-apple-system` so Apple devices render genuine SF Pro. Scale:

```
Page h1        text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight
Section h2     text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight
Card title     text-sm sm:text-base font-medium line-clamp-2
Body           text-sm sm:text-base text-body leading-relaxed
Label / meta   text-xs uppercase tracking-wide text-muted font-medium
Price          text-xl sm:text-2xl font-semibold text-brand tabular-nums
```

Use `tabular-nums` on every price, quantity and tier figure so columns don't jitter.

### Images — the square rule

**Every product image in this catalogue is square (all 35 sources are 1000×1000).**

```tsx
<div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
  <Image src={img.url} alt={img.alt} fill sizes="..." className="object-contain p-2 sm:p-3" />
</div>
```

`aspect-square` + `object-contain` + a **white** pad — never `bg-surface` (`#fafafa`). Every
source photo is already shot on white, so a grey pad creates a visible seam between the photo
and the card; `bg-white` makes the two backgrounds disappear into one. Keep the `object-contain`
padding light (`p-2 sm:p-3` on cards; a touch more, `p-4 sm:p-6`, on the larger PDP gallery) —
the shots already carry their own margin, so a heavy pad on top just shrinks the product. Never
`object-cover` on a product shot — it crops merchandise. Always pass `sizes`. Always pass the
seeded `blurDataUrl` as `placeholder="blur"`.

---

## 5. Data model (read-only summary — canonical source is `../corpomerch-admin/prisma/schema.prisma`)

```
Category ──< ProductCategory >── Product ──< ProductImage
                                    │            └── optionValueId?  (NULL = shared gallery)
                                    ├──< ProductOption (position 1-3)
                                    │        └──< ProductOptionValue
                                    └──< Sku ──< SkuOptionValue
                                            └──< PriceTier (minQty → unitPrice)
```

### The five things you must internalise

1. **Price lives on the SKU, never on the product.** A SKU is one combination of option values.
2. **A product with no options still has exactly one SKU** (`isDefault: true`, zero
   `SkuOptionValue` rows). There is therefore **one code path** — never branch on "has variants".
3. **Only option `position: 1` swaps images.** Positions 2 and 3 change price/SKU but leave the
   gallery alone. This is a product decision, not an accident.
4. **Tiers are open-ended minimums.** `[{50, 15}, {100, 12}]` means *50–99 → ৳15, 100+ → ৳12*.
   The upper bound of a tier is the next tier's `minQty − 1` step. **Compute these ranges with
   `buildTierRanges()`; never hand-write a range label** — the boundary at exactly 100 will
   render in two rows if you do.
5. **`pricingMode: ON_REQUEST` (product) or `priceOnRequest` (SKU) means there is no price.**
   Render the quote panel, not an empty table. Both buttons still work.

`unit` is an enum (`PC | SET | SQFT | PAIR | BOX | SHEET`). Banners and backdrops are sold in
**sqft** and quantities may be fractional — quantity is `Decimal`, never an integer.

`Product.minUnitPrice` / `maxUnitPrice` / `effectiveMoq` are **denormalised** columns maintained
by the admin on save. Use them for listing cards, sorting and price-band filters. Never
aggregate tiers at request time on a listing page.

`Product.specs` is an **ordered array** `[{group?, key, value}]`, not an object — key order is
meaningful and duplicate keys must not collapse.

### `resolvePrice()` — the single pricing entry point (`src/lib/pricing.ts`)

```ts
resolvePrice({ product, sku, quantity }) => {
  isPriceOnRequest: boolean
  moq: number              // sku.moq ?? product.moq ?? lowest tier minQty ?? 1
  belowMoq: boolean
  tier: PriceTier | null   // highest tier whose minQty <= quantity
  unitPrice: number | null
  lineTotal: number | null
}
```

Every price on the site — card, PDP, cart line, inquiry message — goes through this function.
Do not compute a price anywhere else. It is unit-tested; extend the tests when you touch it.

---

## 6. Folder conventions

```
src/
├─ app/
│  ├─ (routes)/…                    page.tsx = server component, always
│  ├─ actions/                      "use server" — inquiry submission
│  ├─ api/revalidate/route.ts       admin publish webhook (shared secret)
│  ├─ sitemap.ts · robots.ts · opengraph-image.tsx
├─ components/
│  ├─ ui/         Button, Badge, Chip, Input, Skeleton, Modal, Accordion  — generic primitives
│  ├─ layout/     Header, Nav, MobileDrawer, BottomBar, Footer, Breadcrumb
│  ├─ home/       Hero, CategoryGrid, PopularProducts, HowItWorks, PartnerMarquee, CtaBand
│  ├─ product/    Gallery, VariantSelector, TierTable, QtyInput, SqftCalculator, Actions, Specs
│  ├─ cart/       CartLine, CartSummary, InquiryForm
│  └─ shared/     ProductCard, SectionHeader, EmptyState, Prose
├─ lib/           prisma · queries · pricing · whatsapp · seo · storage · utils
├─ data/          site.ts (nav, footer, contact, socials — data, never JSX)
├─ store/         cart.ts
└─ types/
```

**Do not create a flat `components/` dump.** The reference project (`../../gearonic/Gearonic-Client`)
has 60 files in one folder and it is the single worst thing about that codebase.

**Before writing a new component, check `components/ui/` and `components/shared/`.** The other
recurring failure in the reference project is four near-identical product cards and four
near-identical order summaries. One `ProductCard` with props beats four copies.

---

## 7. Product detail page — the centrepiece

Layout, top to bottom:

```
Breadcrumb
┌─────────────────────────┬──────────────────────────────────────┐
│ Gallery (square)        │ h1 · short description               │
│  main image             │ From ৳X / pc  ·  MOQ N               │
│  thumbnail strip below  │                                      │
│  click → lightbox       │ ┌ VARIANT SELECTOR ─────────────────┐│
│                         │ │ Axis 1 (images/swatches) ← swaps  ││
│                         │ │ Axis 2 (chips)                    ││
│                         │ │ Axis 3 (chips)                    ││
│                         │ └───────────────────────────────────┘│
│                         │ ┌ TIER TABLE ───────────────────────┐│
│                         │ │  50 – 99 pcs        ৳15           ││
│                         │ │  100+ pcs           ৳12  ← active ││
│                         │ └───────────────────────────────────┘│
│                         │ Quantity [ 100 ] pcs  → ৳1,200 total │
│                         │ [Send Inquiry on WhatsApp] [+ Cart]  │
└─────────────────────────┴──────────────────────────────────────┘
Specifications  ·  Description  ·  Related products
```

Modelled on the reference screenshot (Alibaba/GadgetCity style): three stacked labelled option
rows, first one driving the images.

### Non-obvious requirements

- **Selection lives in the URL** (`?material=plastic&width=2cm`) so a spec is linkable, shareable
  and crawlable. Read it in the server component; hydrate the client selector from it.
- **`swapsOnAxis1`** is derived from the data: true only if ≥2 axis-1 values actually have their
  own images. When false, do not run the cross-fade — fading to an identical image reads as a
  broken control. Two real cases in the catalogue: *Custom Pen → Regular* has no photo, and
  *PVC Banner* white/black are intentionally imageless (they use swatches).
- **Gallery resolution**: images for the selected axis-1 value first, then shared
  (`optionValueId: null`) images. If the selected value has none, fall back to shared only.
- **MOQ warning is inline and amber, never blocking.** The user may still inquire below MOQ.
- **Banner and Backdrop get a W × H → sqft calculator** feeding the quantity field. Carry the
  raw dimensions into the inquiry note — customers think in feet, not square feet.
- Mobile: a fixed bottom action bar. Give the page `pb-24 md:pb-0` so it never covers content.

---

## 8. The inquiry flow

One shared server action, `src/app/actions/inquiry.ts`:

```
client → sendInquiry({ source, items[], contact? })
           ├─ re-resolve every line's price from the DB with resolvePrice()   ← never trust the client
           ├─ insert Inquiry + InquiryItem rows with frozen snapshots
           └─ return { ref: "CM-7Q2K", whatsappUrl }
client → window.open(whatsappUrl, "_blank")
```

**Client-sent prices are ignored, always.** The browser's number is advisory display only.

Logging must never block the redirect: if the insert fails, log the error, still open WhatsApp
with a message built from the client's data. A lost analytics row is acceptable; a lost customer
is not.

### Message format (`src/lib/whatsapp.ts`)

```
Hello CorpoMerch! I'd like a quote:

1. Custom Keyring — Wood
   Qty: 100 pcs @ ৳35 = ৳3,500
   https://corpomerch.com/products/custom-keyring?material=wood

2. PVC Banner — White PVC
   Qty: 250 sq.ft. @ ৳18 = ৳4,500
   Size: 10ft x 25ft

Estimated total: ৳8,000
Ref: #CM-7Q2K
```

Plain text, `encodeURIComponent`'d into `https://wa.me/{number}?text=`. Include the deep link
back to the exact variant — it is how the sales team reconstructs what the buyer configured.
Price-on-request lines read `Qty: 100 pcs — price on request` and are excluded from the total.

---

## 9. SEO — the site's whole reason for existing

Every new page must satisfy all of this before it is considered done:

- [ ] `export const metadata` or `generateMetadata` with a unique title and description
- [ ] `alternates.canonical` set to the absolute URL
- [ ] `openGraph` + `twitter` cards
- [ ] Appropriate JSON-LD (below)
- [ ] Included in `sitemap.ts` if publicly indexable
- [ ] Real `<h1>` (exactly one), then a correct heading hierarchy
- [ ] Meaningful `alt` on every image

### JSON-LD map

| Page | Schema |
|---|---|
| Root layout | `Organization` + `LocalBusiness` (real address, geo, hours) and `WebSite` + `SearchAction` |
| PDP | `Product` with `AggregateOffer` (`lowPrice`/`highPrice` from the tier range, `priceCurrency: "BDT"`) + `BreadcrumbList` |
| PLP / category | `CollectionPage` + `ItemList` (first 10) |
| `/faq` | `FAQPage` |
| `/portfolio/[slug]` | `CreativeWork` |

Use `AggregateOffer`, not `Offer`, on the PDP — the price genuinely is a range across tiers and
SKUs. Omit offers entirely for price-on-request products rather than inventing a number.

### Other

- Title template: `%s | CorpoMerch`. `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- Products and categories use `generateStaticParams` + `revalidate: 3600`, invalidated on demand
  by the admin's publish webhook.
- Slugs are lowercase-canonical; `/products/Mug` must 308-redirect to `/products/mug` or Google
  indexes both.
- Target keywords are price- and location-led: *"custom ID card price in Bangladesh"*,
  *"corporate gift supplier Dhaka"*, *"PVC banner price per sqft"*. Descriptions should carry MOQ
  and starting price naturally.
- `robots.ts` disallows `/api/`. `/search` sets `robots.index: false` when there is no query.

---

## 10. Gotchas specific to this codebase

- **Prisma `Decimal` is not serialisable to a client component.** Map to `number` in
  `src/lib/queries.ts` before it leaves the server. Every query helper returns plain DTOs.
- **The cart stores IDs and quantities, never prices.** Prices are re-resolved on every render;
  a price edited in the admin must be reflected in a cart persisted last week.
- **`qtyStep` and MOQ are `Decimal`.** Coerce carefully around the sqft products; floating-point
  drift on 137.5 sqft is visible to the user.
- **Not every product has a variant.** Half the catalogue is a single default SKU. Test both.
- **Draft products must 404**, not render. Every query filters `status: PUBLISHED` and
  `deletedAt: null` — put that in `src/lib/queries.ts` once rather than in every call site.
- **A `loading.tsx` above a 404-capable page turns its 404 into a soft 200.**
  The Suspense boundary flushes the 200 shell before `notFound()` throws, so the
  status can never be corrected. Google treats that as a soft 404 and deindexes
  the route. There is therefore **no root `loading.tsx`**, and none anywhere above
  `products/[slug]` or `categories/[slug]` — only `/search` and `/cart`, which have
  no 404-capable descendants. Verify with `curl -o /dev/null -w "%{http_code}"` on a
  bogus slug before adding one.
- **Slug canonicalisation lives in `src/proxy.ts`, not in the page**, for the same
  reason: a redirect thrown from a streamed page arrives after the 200 and crawlers
  index both casings. (Next 16 renamed `middleware.ts` to `proxy.ts`.)
- Run `npm run sync:schema` after the admin's schema changes, then `npx prisma generate`.

## 11. Commands

```
npm run dev            next dev
npm run build          next build         — must pass clean before any hand-off
npm run lint
npm run sync:schema    copy ../corpomerch-admin/prisma/schema.prisma → prisma/schema.prisma
npx prisma generate    regenerate the read client
```
