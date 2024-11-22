import Script from 'next/script';

export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SteamShare",
    "url": "https://steamshare.net",
    "description": "Professional Steam screenshot management and editing platform. Seamlessly sync, organize, edit, and share your gaming memories with advanced canvas editing tools.",
    "applicationCategory": "Photography, Gaming",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Steam Integration",
      "Screenshot Gallery",
      "Canvas Editor",
      "Friend System",
      "Professional Editing Tools",
      "Screenshot Management"
    ],
    "author": {
      "@type": "Organization",
      "name": "SteamShare",
      "url": "https://steamshare.net"
    },
    "softwareVersion": "0.1.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100"
    }
  };

  return (
    <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(structuredData)}
    </Script>
  );
}
