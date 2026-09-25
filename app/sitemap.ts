import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';

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
    '/blog',
    '/contact',
  ].map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const posts = POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...posts];
}