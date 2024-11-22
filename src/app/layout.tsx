import { Suspense } from "react";

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Footer } from "~/components/Footer";
import { JsonLd } from "~/components/JsonLd";
import { Navigation } from "~/components/Navigation";
import { GradientBackground } from "~/components/ui/GradientBackground";
import { Spinner } from "~/components/ui/Spinner";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  preload: true,
  display: "swap",
  fallback: ['system-ui', 'arial'],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  preload: true,
  display: "swap",
  fallback: ['monospace'],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  colorScheme: 'dark light'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://steamshare.net'),
  title: {
    default: "SteamShare - Steam Screenshot Manager & Editor",
    template: "%s | SteamShare"
  },
  description: "Professional Steam screenshot management and editing platform. Seamlessly sync, organize, edit, and share your gaming memories with advanced canvas editing tools.",
  keywords: ["Steam", "screenshots", "gaming", "image editor", "canvas editor", "Steam integration", "gaming community", "screenshot manager"],
  authors: [{ name: "SteamShare" }],
  creator: "SteamShare",
  publisher: "SteamShare",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://steamshare.net",
    siteName: "SteamShare",
    title: "SteamShare - Steam Screenshot Manager & Editor",
    description: "Professional Steam screenshot management and editing platform. Seamlessly sync, organize, edit, and share your gaming memories with advanced canvas editing tools.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SteamShare Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SteamShare - Steam Screenshot Manager & Editor",
    description: "Professional Steam screenshot management and editing platform. Seamlessly sync, organize, edit, and share your gaming memories with advanced canvas editing tools.",
    images: ["/twitter-image.jpg"],
    creator: "@steamshare",
  },
  verification: {
    google: "google-site-verification-code", // Add your Google verification code
  },
  category: "Gaming",
  alternates: {
    canonical: "https://steamshare.net",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SteamShare",
  },
  formatDetection: {
    telephone: false,
  },
};

function NavigationLoading() {
  return (
    <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <Spinner size="sm" variant="primary" />
    </div>
  );
}

function MainContentLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" variant="primary" />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <JsonLd />
        <link rel="preconnect" href="https://steamcdn-a.akamaihd.net" />
        <link rel="preconnect" href="https://avatars.steamstatic.com" />
        <link rel="dns-prefetch" href="https://steamcdn-a.akamaihd.net" />
        <link rel="dns-prefetch" href="https://avatars.steamstatic.com" />
      </head>
      <body className="bg-background text-foreground font-sans antialiased min-h-full flex flex-col">
        {/* Background gradient */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <GradientBackground variant="default" />
        </div>

        {/* Navigation */}
        <Suspense fallback={<NavigationLoading />}>
          <Navigation />
        </Suspense>

        {/* Main content */}
        <main className="pt-16 flex-1 flex flex-col relative z-10">
          <Suspense fallback={<MainContentLoading />}>{children}</Suspense>
        </main>

        {/* Footer */}
        <Suspense>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
