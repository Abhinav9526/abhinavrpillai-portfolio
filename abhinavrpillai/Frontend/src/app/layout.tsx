import type { Metadata } from "next";
import { Space_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";
import { config } from "@/data/config";

import Script from "next/script";
import SiteFrame from "@/components/site-frame";
import { Providers } from "@/components/providers";
import { GoogleAnalytics } from "@next/third-parties/google";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* Body/base font — Space Grotesk, bound to --font-sans (applied as `font-sans`
 * on <html>). Everything that isn't a heading inherits this. */
const spaceGroteskSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/* Heading font — Unbounded, bound to --font-display and applied to h1–h6. */
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: config.title,
  alternates: {
    canonical: "/",
  },
  description: config.description.long,
  keywords: config.keywords,
  authors: [{ name: config.author }],
  icons: {
    icon: [
      { url: "/assets/favicon.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
  openGraph: {
    title: config.title,
    description: config.description.short,
    url: config.site,
    images: [
      {
        url: config.ogImg,
        width: 800,
        height: 600,
        alt: "Portfolio preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.title,
    description: config.description.short,
    images: [config.ogImg],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        spaceGroteskSans.variable,
        unbounded.variable,
        "font-sans",
      ].join(" ")}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" href="/assets/favicon.png" />
        <link rel="shortcut icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
        {/* The Spline runtime lazy-loads its wasm from unpkg; warm the
            connection early so the 3D scene starts faster. */}
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <Script
          defer
          src={process.env.UMAMI_DOMAIN}
          data-website-id={process.env.UMAMI_SITE_ID}
        ></Script>
      </head>
      <body suppressHydrationWarning>
        <Script
          id="person-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: config.author,
              jobTitle: "Full Stack Software Developer",
              description: config.description.long,
              url: siteUrl,
              image: `${siteUrl}/assets/seo/og-image.png`,
              sameAs: [
                config.social.github,
                config.social.linkedin,
                config.social.instagram,
              ],
              address: {
                "@type": "PostalAddress",
                addressRegion: "Kerala",
                addressCountry: "IN",
              },
            }),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: config.title,
              url: siteUrl,
              description: config.description.short,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Who is Abhinav R Pillai?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Abhinav R Pillai is a full stack software developer in Kerala who builds modern web applications, AI-powered experiences, and responsive interfaces.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What technologies does Abhinav R Pillai use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "He works with React.js, Next.js, Node.js, MongoDB, ASP.NET, TypeScript, Tailwind CSS, and AI integrations.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is Abhinav R Pillai available for freelance or full-time work in Kerala?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. The portfolio highlights his availability for freelance, contract, and full-time software development opportunities.",
                  },
                },
              ],
            }),
          }}
        />
        <Providers>
          <SiteFrame>{children}</SiteFrame>
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
