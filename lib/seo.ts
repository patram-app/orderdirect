import { Restaurant, MenuCategory, MenuItem } from "./types";

export const BASE_URL = "https://directorder.shop";

/**
 * Generates the SEO Title for a restaurant page.
 * Pattern: {{Restaurant Name}} — Menu & WhatsApp Orders | DirectOrder
 */
export function buildRestaurantTitle(restaurant: Restaurant): string {
    return `${restaurant.name} — Menu & WhatsApp Orders | DirectOrder`;
}

/**
 * Generates the Meta Description for a restaurant page.
 * Pattern: View the menu, opening hours, and order via WhatsApp from {{Restaurant Name}}. Fast dine-in, takeaway & QR ordering at {{City/Address}}.
 */
export function buildRestaurantDescription(restaurant: Restaurant): string {
    // Extract city from address if possible, otherwise use full address or generic
    const address = restaurant.address || "your location";
    return `View the menu, opening hours, and order via WhatsApp from ${restaurant.name}. Fast dine-in, takeaway & QR ordering at ${address}.`;
}

/**
 * Generates the Canonical URL for a restaurant.
 */
export function getCanonicalUrl(slug: string): string {
    return `${BASE_URL}/h/${slug}`;
}

/**
 * Builds the JSON-LD Structured Data for a Restaurant.
 * Uses Schema.org/Restaurant
 */
export function buildRestaurantJsonLd(restaurant: Restaurant) {
    return {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": restaurant.name,
        "image": [
            // Placeholder or actual image if we had one. 
            // Since we don't have dynamic images yet, we can use a default or the OG image if generated.
            `${BASE_URL}/images/restaurant-placeholder.jpg`
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": restaurant.address,
            "addressCountry": "IN" // Defaulting to IN based on context (Rs., WhatsApp)
        },
        "telephone": restaurant.whatsappNumber ? `+${restaurant.whatsappNumber}` : undefined,
        "url": getCanonicalUrl(restaurant.slug),
        "servesCuisine": "Restaurant", // Could be dynamic if we had cuisine field
        "hasMenu": `${BASE_URL}/h/${restaurant.slug}`,
        "openingHoursSpecification": Object.entries(restaurant.timings).map(([day, time]) => {
            // Map 'mon' to 'Monday', etc.
            const daysMap: Record<string, string> = {
                mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"
            };
            if (time.open === "00:00" && time.close === "00:00") return null;
            return {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": daysMap[day] || day,
                "opens": time.open,
                "closes": time.close
            };
        }).filter(Boolean),
        "priceRange": "₹₹", // Default
        "acceptsReservations": "False" // Frontend only app
    };
}

/**
 * Builds the JSON-LD Structured Data for the Menu.
 * Uses Schema.org/Menu
 */
export function buildMenuJsonLd(menu: MenuCategory[], restaurant: Restaurant) {
    return {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": `${restaurant.name} Menu`,
        "inLanguage": "en",
        "hasMenuSection": menu.map(category => ({
            "@type": "MenuSection",
            "name": category.category,
            "hasMenuItem": category.items.map(item => ({
                "@type": "MenuItem",
                "name": item.name,
                "description": item.description,
                "offers": {
                    "@type": "Offer",
                    "price": item.price || (item.variants && item.variants.length > 0 ? item.variants[0].price : 0),
                    "priceCurrency": "INR"
                }
            }))
        }))
    };
}
