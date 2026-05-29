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
  title: 'Lunsford Software Development',
  description: 'Custom websites built from scratch. Based in Newnan, GA. Fast, clean, and built to convert.',
  metadataBase: new URL('https://lunsfordsoftware.com'),
  openGraph: {
    title: 'Lunsford Software Development',
    description: 'Custom websites built from scratch. Based in Newnan, GA.',
    url: 'https://lunsfordsoftware.com',
    siteName: 'Lunsford Software Development',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunsford Software Development',
    description: 'Custom websites built from scratch. Based in Newnan, GA.',
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
