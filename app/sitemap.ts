import type { MetadataRoute } from 'next';

const BASE = 'https://waris.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/stack',
    '/projects',
    '/projects/swiftza',
    '/projects/zhongfa-ev',
    '/projects/zirconia-express',
    '/experience',
    '/process',
    '/contact',
  ];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}