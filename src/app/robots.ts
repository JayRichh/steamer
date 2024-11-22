import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/private/',
        '/editor/temp/',
      ],
    },
    sitemap: 'https://steamshare.net/sitemap.xml',
  }
}
