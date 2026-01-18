import { Restaurant, MenuCategory } from "@/lib/types";
import { buildRestaurantJsonLd, buildMenuJsonLd } from "@/lib/seo";

interface SeoHeadProps {
    restaurant: Restaurant;
    menu: MenuCategory[];
}

export default function SeoHead({ restaurant, menu }: SeoHeadProps) {
    const restaurantJsonLd = buildRestaurantJsonLd(restaurant);
    const menuJsonLd = buildMenuJsonLd(menu, restaurant);

    return (
        <section>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
            />
        </section>
    );
}
