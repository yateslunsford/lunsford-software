import Script from 'next/script';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import FilmGrain from "@/components/FilmGrain";
import BackToTop from "@/components/BackToTop";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

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

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lunsfordsoftware.com"),
  title: "Lunsford Software Development — Custom Sites Built in Newnan, GA",
  description:
    "Custom websites and web applications built from scratch. No templates, no page builders. Hand-coded, fast, mobile-first. Based in Newnan, GA.",
  keywords: [
    "web developer Newnan GA",
    "custom website development",
    "Next.js developer",
    "freelance web developer Georgia",
    "small business website",
  ],
  authors: [{ name: "Yates Lunsford" }],
  creator: "Yates Lunsford",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lunsfordsoftware.com",
    siteName: "Lunsford Software Development",
    title: "Lunsford Software Development — Custom Sites Built Right",
    description:
      "Custom websites built from scratch. No templates. Hand-coded, fast, mobile-first. Starting at $800. Based in Newnan, GA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lunsford Software Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lunsford Software Development",
    description: "Custom websites built from scratch. No templates. Fast, mobile-first. Based in Newnan, GA.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TE1GPTGMQY"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TE1GPTGMQY');
            `,
          }}
        />
        <SmoothScroll>
          <PageLoader />
          <ScrollProgress />
          <CursorGlow />
          <FilmGrain />
          <BackToTop />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
