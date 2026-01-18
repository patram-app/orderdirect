import { MetadataRoute } from 'next';
import { getAllRestaurants } from '@/lib/api';
import { BASE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const restaurants = await getAllRestaurants();

    const indexableRestaurants = restaurants.filter(
        (r) => !r.slug.startsWith("demo")
    );

    const restaurantUrls = indexableRestaurants.map((r) => ({
        url: `${BASE_URL}/h/${r.slug}`,
        lastModified: new Date(r.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...restaurantUrls,
    ];
}
