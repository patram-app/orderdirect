import { Query } from "appwrite";
import { databases, RESTAURANTS_COLLECTION_ID, MENU_ITEMS_COLLECTION_ID, ORDERS_COLLECTION_ID, DATABASE_ID } from "./appwrite";
// ... types import
import { RestaurantDocument, MenuItemDocument, Restaurant, MenuCategory, MenuItem, PlanType, OrderingMode } from "./types";

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

        // --- PLAN ENFORCEMENT LOGIC ---
        const now = new Date();
        const expiryDate = new Date(doc.planExpiry || 0); // Default to epoch if missing
        const isExpired = now > expiryDate;

        let activePlan: PlanType = doc.plan || "menu"; // Default to menu
        let activeMode: OrderingMode = doc.orderingMode || "menu"; // Default to menu

        // Force defaults if expired
        if (isExpired) {
            console.warn(`[Plan] Restaurant ${slug} plan expired on ${expiryDate.toISOString()}. Downgrading to MENU.`);
            activePlan = "menu";
            activeMode = "menu";
        } else {
            // Enforce Plan Limits Logic
            if (activePlan === "menu") {
                activeMode = "menu";
            } else if (activePlan === "whatsapp") {
                // If plan is whatsapp, mode can be "whatsapp" or "menu" (if disabled)
                // If DB says "admin_orders", downgrade it.
                if (activeMode === "admin_orders") activeMode = "whatsapp";
            }
            // "admin_orders" plan allows all modes
        }

        // -----------------------------

        return {
            id: doc.$id,
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
            deliveryAreas: doc.deliveryAreas || [],         // Feature 1
            upiId: doc.upiId || "",                         // Feature 2

            // Plan Fields
            plan: activePlan,
            planExpiry: expiryDate,
            orderingMode: activeMode,

            ownerId: doc.ownerId,

            // Timings
            timings: {
                mon: getTimings(doc, "mon"),
                tue: getTimings(doc, "tue"),
                wed: getTimings(doc, "wed"),
                thu: getTimings(doc, "thu"),
                fri: getTimings(doc, "fri"),
                sat: getTimings(doc, "sat"),
                sun: getTimings(doc, "sun"),
            },
        } as Restaurant; // Cast to Restaurant type
    } catch (error) {
        console.error("Failed to get restaurant:", error);
        return null;
    }
}

// ... existing getMenu ... (unchanged)
// ... existing getAllRestaurants ... (unchanged)
// ... existing createOrder ... (unchanged)

// ... existing getAllRestaurants ...

export async function getAdminRestaurants(): Promise<Restaurant[]> {
    try {
        const response = await databases.listDocuments<RestaurantDocument>(
            DATABASE_ID,
            RESTAURANTS_COLLECTION_ID,
            [Query.limit(100), Query.orderDesc("$createdAt")]
        );

        return response.documents.map(doc => {
            // Include basic plan parsing logic here as well for display consistency
            const activePlan: PlanType = doc.plan || "menu";
            const activeMode: OrderingMode = doc.orderingMode || "menu";
            const expiryDate = new Date(doc.planExpiry || 0);

            return {
                id: doc.$id,
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
                deliveryAreas: doc.deliveryAreas || [],
                upiId: doc.upiId || "",

                plan: activePlan,
                planExpiry: expiryDate,
                orderingMode: activeMode,

                timings: {
                    mon: getTimings(doc, "mon"),
                    tue: getTimings(doc, "tue"),
                    // ... easier to just reuse getTimings helper if available or mock empty for admin view if not needed
                    // Actually, let's just map them all to avoid TS errors
                    wed: getTimings(doc, "wed"),
                    thu: getTimings(doc, "thu"),
                    fri: getTimings(doc, "fri"),
                    sat: getTimings(doc, "sat"),
                    sun: getTimings(doc, "sun"),
                },
            };
        });
    } catch (error) {
        console.error("Failed to fetch admin restaurants:", error);
        return [];
    }
}

/**
 * Super Admin: Update Plan Settings (Plan & Expiry Only)
 */
export async function updateRestaurantPlan(
    restaurantId: string,
    data: { plan: PlanType; planExpiry: string; orderingMode?: OrderingMode }
): Promise<boolean> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            RESTAURANTS_COLLECTION_ID,
            restaurantId,
            {
                plan: data.plan,
                planExpiry: data.planExpiry,
                orderingMode: data.orderingMode // Now optional but updatable
            }
        );
        return true;
    } catch (error) {
        console.error("Failed to update restaurant plan:", error);
        return false;
    }
}

/**
 * Owner: Update Ordering Configuration
 */
export async function updateRestaurantSettings(
    restaurantId: string,
    data: { orderingMode: OrderingMode }
): Promise<boolean> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            RESTAURANTS_COLLECTION_ID,
            restaurantId,
            {
                orderingMode: data.orderingMode
            }
        );
        return true;
    } catch (error) {
        console.error("Failed to update restaurant settings:", error);
        return false;
    }
}

export async function getMenu(slug: string): Promise<MenuCategory[]> {
    try {
        const response = await databases.listDocuments<MenuItemDocument>(
            DATABASE_ID,
            MENU_ITEMS_COLLECTION_ID,
            [
                Query.equal("restaurantSlug", slug),
                Query.limit(250), // Adjust limit if needed (or implement pagination)
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

/**
 * Creates a new order in the database.
 */
export async function createOrder(data: {
    restaurantId: string;
    orderType: "dine_in" | "takeaway" | "delivery";
    customerName: string;
    customerPhone?: string;
    dineInLocation?: string; // Table/Room
    deliveryArea?: string;
    deliveryAddress?: string;
    items: { name: string; qty: number; price: number; variant?: string | null }[];
    total: number;
}): Promise<boolean> {
    try {
        const orderData = {
            restaurantId: data.restaurantId,
            orderType: data.orderType,
            customerName: data.customerName,
            customerPhone: data.customerPhone || null,
            dineInLocation: data.dineInLocation || null,
            deliveryArea: data.deliveryArea || null,
            deliveryAddress: data.deliveryAddress || null,
            items: data.items.map(item => JSON.stringify(item)), // Convert each item obj to string
            total: data.total
        };

        await databases.createDocument(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            "unique()", // ID.unique()
            orderData,

        );
        return true;
    } catch (error) {
        console.error("Failed to create order:", error);
        // We don't want to block the user from WhatsApp flow if DB fails,
        // so we might return false but let the UI continue or log it.
        return false;
    }
}
