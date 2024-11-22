/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://steamshare.net',
  generateRobotsTxt: false, // We're using app/robots.ts instead
  generateIndexSitemap: true,
  exclude: ['/api/*', '/dashboard/private/*', '/editor/temp/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/private/', '/editor/temp/'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom transform function for dynamic routes
    const defaultPriority = 0.7;
    const defaultChangefreq = 'daily';

    // Customize priority for specific routes
    const priorities = {
      '/': 1.0,
      '/dashboard': 0.8,
      '/editor': 0.8,
      '/steam': 0.7,
    };

    return {
      loc: path,
      changefreq: defaultChangefreq,
      priority: priorities[path] || defaultPriority,
      lastmod: new Date().toISOString(),
    };
  },
};
