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
    "CorpoMerch by Backstage supplies customised corporate merchandise and print across Bangladesh: ID cards, lanyards, drinkware, pens, bags, certificates, banners and complete event kits. Bulk pricing, low MOQs, quotes on WhatsApp.",
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
 * Homepage client-logo row. Static files in `public/clients/` —
 * separate from the DB-driven `Partner` model behind `/partners` (empty
 * until the admin populates it). Swap to `getPartners()` there if that list
 * ever needs to live on the homepage too.
 *
 * Every file in `public/clients/` must be cropped tight to its ink (no
 * padding), and `width`/`height` below are its real pixel size, so a fixed
 * display height times this ratio never distorts the mark.
 */
export const CLIENTS: {
  name: string;
  logo: string;
  width: number;
  height: number;
  /** Very wide marks read too large at the shared height; render them smaller. */
  compact?: boolean;
}[] = [
  { name: "TEDx", logo: "/clients/tedx.png", width: 940, height: 279, compact: true },
  {
    name: "Unilever",
    logo: "/clients/unilever.png",
    width: 400,
    height: 443,
  },
  {
    name: "BRAC University IABC",
    logo: "/clients/iabc.png",
    width: 400,
    height: 400,
  },
  {
    name: "Stacked Ventures",
    logo: "/clients/stacked-ventures.png",
    width: 897,
    height: 327,
  },
  { name: "Bini", logo: "/clients/bini.png", width: 93, height: 40 },
  {
    name: "BUP Accounting Forum",
    logo: "/clients/bup-accounting-fourm.png",
    width: 552,
    height: 609,
  },
  {
    name: "BUP Career Club",
    logo: "/clients/bup-career-club.png",
    width: 1318,
    height: 1527,
  },
  {
    name: "DBOX Sports Complex",
    logo: "/clients/dbox-sports-complex.png",
    width: 1053,
    height: 578,
  },
  {
    name: "Tripple Time Communication",
    logo: "/clients/tripple-time-communication.png",
    width: 657,
    height: 501,
  },
  {
    name: "Grinscreen Digital",
    logo: "/clients/grinscreen-digital.png",
    width: 83,
    height: 89,
  },
  {
    name: "Marico Bangladesh",
    logo: "/clients/marico-bangladesh-ltd.png",
    width: 98,
    height: 86,
  },
  {
    name: "Parachute Bangladesh",
    logo: "/clients/parachute-bangladesh.png",
    width: 87,
    height: 78,
  },
  {
    name: "Raze Bangladesh",
    logo: "/clients/raze-bangladesh.png",
    width: 101,
    height: 47,
  },
  { name: "ReachSavvy", logo: "/clients/reachsavvy.png", width: 1816, height: 311, compact: true },
  { name: "RAK Ceramics", logo: "/clients/rak-ceramics.png", width: 339, height: 195 },
  { name: "API Engineering", logo: "/clients/api-engineering.png", width: 1600, height: 501 },
];

export const TRUST_STATS: { value: string; label: string }[] = [
  { value: "30+", label: "Events Supplied" },
  { value: "50+", label: "Corporate Items" },
  { value: "1-2 days", label: "Fastest Delivery" },
  { value: "20+", label: "Organizations Served" },
];
