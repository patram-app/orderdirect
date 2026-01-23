import { Models } from "appwrite";

// --- Appwrite Document Shapes (Flat) ---

export interface RestaurantDocument extends Models.Document {
    ownerId: string;
    name: string;
    slug: string; // Unique ID
    description: string;
    address: string;
    googleMapsLink: string;
    whatsappNumber: string;

    supportsDineIn: boolean;
    supportsTakeaway: boolean;
    supportsDelivery: boolean;

    onlineOrderingEnabled: boolean;

    manuallyClosed: boolean;

    deliveryAreas: string[]; // Feature 1
    upiId: string;           // Feature 2

    // Timings (Strings HH:MM)
    monOpen: string; monClose: string;
    tueOpen: string; tueClose: string;
    wedOpen: string; wedClose: string;
    thuOpen: string; thuClose: string;
    friOpen: string; friClose: string;
    satOpen: string; satClose: string;
    sunOpen: string; sunClose: string;
}

export interface MenuItemDocument extends Models.Document {
    ownerId: string;
    restaurantSlug: string;
    category: string;
    itemName: string;
    description?: string;
    isVeg: boolean;
    variant: string | null; // e.g. "Half", "Full", or null for single variant
    price: number;
    isSoldOut: boolean;
}

// --- UI Shapes (Transformed) ---

export interface WorkingHours {
    open: string;
    close: string;
}

export interface Restaurant {
    name: string;
    slug: string;
    description: string;
    address: string;
    googleMapsLink: string;
    whatsappNumber: string;

    supports: {
        dineIn: boolean;
        takeaway: boolean;
        delivery: boolean;
    };

    onlineOrderingEnabled: boolean;

    manuallyClosed: boolean;

    deliveryAreas: string[]; // Feature 1
    upiId: string | null;    // Feature 2

    // Transformed from flat fields to nested object
    timings: {
        mon: WorkingHours;
        tue: WorkingHours;
        wed: WorkingHours;
        thu: WorkingHours;
        fri: WorkingHours;
        sat: WorkingHours;
        sun: WorkingHours;
        [key: string]: WorkingHours; // Index signature for safety
    };
}

export interface Variant {
    label: string;
    price: number;
}

export interface MenuItem {
    name: string;
    description?: string;
    isVeg: boolean;
    price?: number; // Base price or display price
    variants?: Variant[];
    isSoldOut: boolean;
}

export interface MenuCategory {
    category: string;
    items: MenuItem[];
}

export interface CartItem {
    name: string;
    price: number;
    isVeg: boolean;
    variant?: string;
    quantity: number;
}
