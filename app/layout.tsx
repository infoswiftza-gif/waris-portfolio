import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Self-hosted fonts (next/font) — no render-blocking Google Fonts <link>,
// fonts are preloaded and served from our own origin (faster + private).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const SITE_URL = "https://waris.dev";
const SITE_TITLE = "WARIS.DEV — Full Stack Developer · Digital City";
const SITE_DESCRIPTION =
  "Waris Ali — Full Stack Developer. An interactive digital city built around one developer's skills, projects, and technical ecosystem.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "WARIS.DEV",
  authors: [{ name: "Waris Ali" }],
  creator: "Waris Ali",
  keywords: [
    "Waris Ali",
    "Full Stack Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "Three.js",
    "WebGL",
    "Web Developer Portfolio",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "WARIS.DEV",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "WARIS.DEV — Full Stack Developer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
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
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 4 28 26H4Z' fill='%2364f5b0'/%3E%3C/svg%3E",
  },
};

/* Structured data for Google rich results and LLM entity understanding.
   sameAs omitted on purpose until the real GitHub/LinkedIn URLs replace the placeholders. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Waris Ali",
      url: SITE_URL,
      jobTitle: "Full Stack Developer",
      email: "mailto:waris0543@gmail.com",
      description:
        "Full Stack Developer building fast, scalable, and visually refined digital experiences from frontend to backend.",
      knowsAbout: [
        "Full Stack Development",
        "Frontend Engineering",
        "Backend Engineering",
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "Three.js",
        "WebGL",
        "REST APIs",
        "Database Design",
        "System Architecture",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "WARIS.DEV",
      url: SITE_URL,
      inLanguage: "en",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
