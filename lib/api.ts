import { Query } from "appwrite";
import { databases, RESTAURANTS_COLLECTION_ID, MENU_ITEMS_COLLECTION_ID, DATABASE_ID } from "./appwrite";
import { RestaurantDocument, MenuItemDocument, Restaurant, MenuCategory, MenuItem, Variant } from "./types";

/**
 * Validates the day keys from the DB to ensure they match the expected format.
 * Defaults to "00:00" if missing.
 */
function getTimings(doc: RestaurantDocument, day: string) {
    return {
        open: (doc[`${day}Open` as keyof RestaurantDocument] as string) || "00:00",
        close: (doc[`${day}Close` as keyof RestaurantDocument] as string) || "00:00",
    };
}

export async function getRestaurant(slug: string): Promise<Restaurant | null> {
    try {
        const response = await databases.listDocuments<RestaurantDocument>(
            DATABASE_ID,
            RESTAURANTS_COLLECTION_ID,
            [Query.equal("slug", slug)]
        );

        if (response.documents.length === 0) return null;

        const doc = response.documents[0];

        return {
            name: doc.name,
            slug: doc.slug,
            description: doc.description,
            address: doc.address,
            googleMapsLink: doc.googleMapsLink,
            whatsappNumber: doc.whatsappNumber,
            supports: {
                dineIn: doc.supportsDineIn,
                takeaway: doc.supportsTakeaway,
                delivery: doc.supportsDelivery,
            },
            manuallyClosed: doc.manuallyClosed,
            timings: {
                mon: getTimings(doc, "mon"),
                tue: getTimings(doc, "tue"),
                wed: getTimings(doc, "wed"),
                thu: getTimings(doc, "thu"),
                fri: getTimings(doc, "fri"),
                sat: getTimings(doc, "sat"),
                sun: getTimings(doc, "sun"),
            },
        };
    } catch (error) {
        console.error("Failed to fetch restaurant:", error);
        return null;
    }
}

export async function getMenu(slug: string): Promise<MenuCategory[]> {
    try {
        const response = await databases.listDocuments<MenuItemDocument>(
            DATABASE_ID,
            MENU_ITEMS_COLLECTION_ID,
            [
                Query.equal("restaurantSlug", slug),
                Query.limit(100), // Adjust limit if needed (or implement pagination)
            ]
        );
        console.log(`[getMenu] fetching for slug: ${slug}`);
        console.log(`[getMenu] documents found: ${response.documents.length}`);
        if (response.documents.length > 0) {
            console.log(`[getMenu] first doc:`, response.documents[0]);
        }


        const rawItems = response.documents;
        const categoriesMap = new Map<string, Map<string, MenuItem>>();

        // Grouping Logic: Category -> Item Name -> Variants
        rawItems.forEach((doc) => {
            if (!categoriesMap.has(doc.category)) {
                categoriesMap.set(doc.category, new Map());
            }

            const categoryItems = categoriesMap.get(doc.category)!;

            if (!categoryItems.has(doc.itemName)) {
                // Initialize the base item
                categoryItems.set(doc.itemName, {
                    name: doc.itemName,
                    description: doc.description,
                    isVeg: doc.isVeg,
                    isSoldOut: doc.isSoldOut, // If any variant is sold out? Or just the item logic? 
                    // Requirements: "If variant is null -> single price item". 
                    // We'll trust the doc structure.
                    // Price & Variants are handled below
                });
            }

            const item = categoryItems.get(doc.itemName)!;

            if (doc.variant) {
                // It's a variant
                if (!item.variants) item.variants = [];
                item.variants.push({
                    label: doc.variant,
                    price: doc.price,
                });
            } else {
                // Single item with no variants
                item.price = doc.price;
            }

            // If the specific document is marked sold out, arguably the variant is sold out? 
            // The schema says `isSoldOut` is on the row. 
            // Logic improvement: If flattened item logic, we might need granular sold out? 
            // For now, if the Base Item has NO variants, we abide by its `isSoldOut`. 
            // If it HAS variants, we might need to handle per-variant availability in the future.
            // Current strict requirement: "Variants are stored as separate rows... UI rebuilds variants".
        });

        // Convert Map to Array
        const menu: MenuCategory[] = [];

        categoriesMap.forEach((itemsMap, categoryName) => {
            menu.push({
                category: categoryName,
                items: Array.from(itemsMap.values()),
            });
        });

        return menu;
    } catch (error) {
        console.error("Failed to fetch menu:", error);
        return [];
    }
}

export async function getAllRestaurants(): Promise<{ slug: string; updatedAt: string }[]> {
    try {
        const response = await databases.listDocuments<RestaurantDocument>(
            DATABASE_ID,
            RESTAURANTS_COLLECTION_ID,
            [
                Query.select(["slug", "$updatedAt"]),
                Query.limit(100)
            ]
        );
        return response.documents.map(doc => ({
            slug: doc.slug,
            updatedAt: doc.$updatedAt
        }));
    } catch (error) {
        console.error("Failed to fetch all restaurants for sitemap:", error);
        return [];
    }
}
