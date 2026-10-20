import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AZ#97 | Streetwear. Quatre coloris. Une signature.", template: "%s | AZ#97" },
  description:
    "AZ#97, marque de vêtements streetwear : T-shirts, manches longues et pulls zippés en noir, blanc et rose. Cinq collections, toutes en précommande.",
  applicationName: SITE_NAME,
  keywords: ["AZ#97", "AZ97", "streetwear", "vêtements", "T-shirt", "pull zippé", "manches longues", "précommande", "Côte d'Ivoire"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_FR",
    url: "/",
    title: "AZ#97 | Quatre coloris. Une signature.",
    description: "Cinq collections streetwear en noir, blanc et rose. Toutes les pièces en précommande.",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630, alt: "AZ#97" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZ#97 | Quatre coloris. Une signature.",
    description: "Cinq collections streetwear en noir, blanc et rose. Toutes les pièces en précommande.",
    images: ["/img/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f0ea",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/img/logo-black.png`,
    slogan: "Quatre coloris. Une signature.",
  };
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,700;1,6..96,500&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
        <noscript>
          <style>{`#intro{display:none!important}html.intro-active #site{opacity:1!important;filter:none!important;transform:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
