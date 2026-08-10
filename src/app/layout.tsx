import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/shared/JsonLd";
import { SITE } from "@/data/site";
import { getCategoryTree, getSiteSettings } from "@/lib/queries";
import { organizationSchema, websiteSchema } from "@/lib/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline} in Bangladesh`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  keywords: [
    "corporate merchandise Bangladesh",
    "custom ID card Dhaka",
    "lanyard printing Bangladesh",
    "corporate gift supplier Dhaka",
    "PVC banner price per sqft",
    "certificate printing Dhaka",
    "event supplies Bangladesh",
    "customised merchandise",
  ],
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: `${SITE.name} — ${SITE.tagline} in Bangladesh`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#d12429",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once here rather than in every page — the nav and announcement are
  // on every route.
  const [categories, settings] = await Promise.all([
    getCategoryTree(),
    getSiteSettings(),
  ]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>

        <Header
          categories={categories}
          announcement={
            settings?.announcementActive ? settings.announcementText : null
          }
        />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer />

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: "0.5rem",
              border: "1px solid var(--color-line)",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
