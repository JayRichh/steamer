import localFont from "next/font/local";
import { metadata, viewport } from "./config";
import { ClientLayout } from "~/components/ClientLayout";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export { metadata, viewport };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://steamcdn-a.akamaihd.net" />
        <link rel="preconnect" href="https://avatars.steamstatic.com" />
        <link rel="dns-prefetch" href="https://steamcdn-a.akamaihd.net" />
        <link rel="dns-prefetch" href="https://avatars.steamstatic.com" />
      </head>
      <body className="bg-background text-foreground font-sans min-h-[100dvh] flex flex-col overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
