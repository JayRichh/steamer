import { Metadata, Viewport } from "next";

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
    google: "google-site-verification-code",
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
