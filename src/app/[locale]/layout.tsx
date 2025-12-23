// Plik: src/app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

import '@solana/wallet-adapter-react-ui/styles.css';
import 'react-toastify/dist/ReactToastify.css';

import ClientLayout from "@/components/ClientLayout";
import initTranslations from "@/i18n";

// ——— Font jako zmienna (mniejszy CLS i kontrola w Tailwind) ———
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// ——— Namespace’y i18n ———
const i18nNamespaces = [
  "common", "navigation", "footer", "homepage", "why_invest", "buy-tokens-page", "presale",
  "roadmap-page", "tokenomics", "nft-page", "about", "faq",
  "terms-of-service", "privacy-policy", "contact-page", "funding-hub", "whitepaper"
];

// ——— Bazowy adres witryny (kanoniczne/OG) ———
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://pierogimeme.io";

// ——— Obsługiwane locale + RTL helper ———
const locales = ["en", "pl"];
const isRTL = (locale: string) => ["ar", "he", "fa", "ur"].includes(locale);

// ——— Viewport (dynamiczne kolory dla light/dark) ———
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  colorScheme: "light dark",
};

// ——— Metadata generowane per locale ———
export async function generateMetadata(
  { params: { locale } }: { params: { locale: string } }
): Promise<Metadata> {
  const { t } = await initTranslations(locale, ["common"]);
  const titleDefault = t("logoAlt") || "PierogiCoin";

  // alternates.languages: {"en":"/en","pl":"/pl",...}
  const languages = Object.fromEntries(locales.map(l => [l, `/${l}`]));

  const description = "Play our Telegram game, earn PRG tokens, and help us reach $15K for security audit. Join the transparent Web3 gaming revolution launching Nov 27, 2024!";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: "%s | PierogiCoin",
      default: titleDefault,
    },
    description,
    keywords: ["PierogiCoin", "PRG Token", "Telegram Game", "Play to Earn", "Web3 Gaming", "Crypto Presale", "Blockchain Game", "Security Audit", "Transparent Fundraising"],
    authors: [{ name: "PierogiCoin Team" }],
    creator: "PierogiCoin",
    publisher: "PierogiCoin",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: "PierogiCoin",
      title: `${titleDefault} - Play, Earn & Fund Our Audit`,
      description,
      locale,
      images: [
        {
          url: "/og/og-default.jpg",
          width: 1200,
          height: 630,
          alt: "PierogiCoin - Play to Earn Telegram Game",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@PierogiCoin",
      creator: "@PierogiCoin",
      title: `${titleDefault} - Play, Earn & Fund Our Audit`,
      description,
      images: ["/og/og-default.jpg"],
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <html
      lang={locale}
      dir={isRTL(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        {/* Manifest / PWA */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PierogiCoin",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "description": "Play to Earn Telegram game with transparent fundraising for security audit",
              "foundingDate": "2024",
              "sameAs": [
                "https://twitter.com/PierogiCoin",
                "https://t.me/pierogicoin"
              ]
            })
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "PierogiCoin",
              "url": siteUrl,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Structured Data - Game */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              "name": "PierogiCoin Telegram Game",
              "description": "Play to earn PRG tokens and support our security audit",
              "gamePlatform": "Telegram",
              "applicationCategory": "Game",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>

      <body
        className={`${inter.variable} bg-dark-900 text-gray-100 antialiased selection:bg-gold-400/30`}
      >
        {/* App shell + i18n resources */}
        <ClientLayout locale={locale} namespaces={i18nNamespaces} resources={resources}>
          {children}
        </ClientLayout>

        {/*
          ⚡️ Vanta/Three odchudzony:
          — NIE ładujemy globalnie ciężkich skryptów.
          — Używaj `VantaLayer` (dynamic import w samym komponencie),
            który dociąga 'three' i odpowiedni efekt tylko wtedy, kiedy faktycznie jest w DOM.
        */}
      </body>
    </html>
  );
}
