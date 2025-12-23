import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pierogimeme.io';
const locales = ['en', 'pl'];
const routes = [
  '', 
  '/about', 
  '/nft', 
  '/buy-tokens', 
  '/roadmap', 
  '/tokenomics',
  '/faq',
  '/contact', 
  '/terms-of-service', 
  '/privacy-policy'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'hourly' : route === '/roadmap' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route === '/buy-tokens' ? 0.9 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${route}`])
          ),
        },
      });
    });
  });

  return urls;
}
