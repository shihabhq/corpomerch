/**
 * Static site configuration — data, never JSX.
 *
 * Contact details are duplicated in the `site_settings` DB row (which the admin
 * can edit). These constants are the build-time fallback used by metadata,
 * JSON-LD and anything that renders before a query resolves.
 */

export const SITE = {
  name: "CorpoMerch",
  legalName: "Backstage Ltd.",
  tagline: "Custom corporate merchandise & print",
  description:
    "CorpoMerch by Backstage supplies customised corporate merchandise and print across Bangladesh — ID cards, lanyards, drinkware, pens, bags, certificates, banners and complete event kits. Bulk pricing, low MOQs, quotes on WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://corpomerch.com",
  locale: "en_BD",
} as const;

export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801612170202",
  phoneDisplay: "+880 1612-170202",
  phoneHref: "tel:+8801612170202",
  email: "backstageltd.int@gmail.com",
  addressLine: "Shop 128, 68-69 Concept Tower, Greenroad, Panthapath",
  addressCity: "Dhaka",
  addressPostcode: "1205",
  addressCountry: "Bangladesh",
  mapUrl:
    "https://maps.google.com/?q=Concept+Tower+Green+Road+Panthapath+Dhaka",
  hours: "Saturday – Thursday, 10:00 – 19:00",
} as const;

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/products", label: "All Products" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_SECTIONS: {
  title: string;
  links: { href: string; label: string }[];
}[] = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories/id-cards", label: "ID Cards" },
      { href: "/categories/lanyards", label: "Lanyards & Ribbons" },
      { href: "/categories/drinkware", label: "Drinkware" },
      { href: "/categories/large-format", label: "Banners & Signage" },
      { href: "/categories/corporate-gifts", label: "Corporate Gifts" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "/partners", label: "Our Partners" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/faq#artwork", label: "Artwork Guidelines" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/returns", label: "Returns & Reprints" },
    ],
  },
];

/** The four-step explainer on the home page. */
export const HOW_IT_WORKS: {
  title: string;
  body: string;
  icon: string;
}[] = [
  {
    icon: "MousePointerClick",
    title: "Choose & configure",
    body: "Pick a product, set the options and type your quantity. The price for that exact quantity appears instantly.",
  },
  {
    icon: "MessageCircle",
    title: "Send on WhatsApp",
    body: "One tap sends your full spec to our team. No forms, no account, no waiting for an email reply.",
  },
  {
    icon: "FileCheck2",
    title: "Approve the proof",
    body: "We confirm the quote and send a digital proof. Nothing goes to production until you sign it off.",
  },
  {
    icon: "Truck",
    title: "Delivered on time",
    body: "Produced and delivered to your office or venue, anywhere in Bangladesh, ahead of your event date.",
  },
];

/**
 * Homepage client-logo row. Static files in `public/clients/trimmed/` —
 * separate from the DB-driven `Partner` model behind `/partners` (empty
 * until the admin populates it). Swap to `getPartners()` there if that list
 * ever needs to live on the homepage too.
 *
 * The source files in `public/clients/` are the originals as supplied — four
 * of the five are a small mark centred on a huge square canvas, which is why
 * they rendered at wildly different visual sizes next to each other. The
 * `trimmed/` copies crop each one to its actual ink, and `width`/`height`
 * are that trimmed image's real pixel size, so a fixed display height times
 * this ratio never distorts the mark.
 */
export const CLIENTS: { name: string; logo: string; width: number; height: number }[] = [
  { name: "Bini", logo: "/clients/trimmed/bini.png", width: 93, height: 40 },
  {
    name: "BUP Accounting Forum",
    logo: "/clients/trimmed/bup-accounting-fourm.png",
    width: 552,
    height: 609,
  },
  {
    name: "BUP Career Club",
    logo: "/clients/trimmed/bup-career-club.png",
    width: 1318,
    height: 1527,
  },
  {
    name: "DBOX Sports Complex",
    logo: "/clients/trimmed/dbox-sports-complex.png",
    width: 1053,
    height: 578,
  },
  {
    name: "Tripple Time Communication",
    logo: "/clients/trimmed/tripple-time-communication.png",
    width: 657,
    height: 501,
  },
];

export const TRUST_STATS: { value: string; label: string }[] = [
  { value: "500+", label: "Events supplied" },
  { value: "20+", label: "Product categories" },
  { value: "1–2 days", label: "Fastest turnaround" },
  { value: "MOQ 1", label: "On selected items" },
];
