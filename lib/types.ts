import { Models } from "appwrite";

// --- Plan & Ordering Types ---
export type PlanType = "menu" | "whatsapp" | "admin_orders";
export type OrderingMode = "menu" | "whatsapp" | "admin_orders";

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

    manuallyClosed: boolean;

    deliveryAreas: string[]; // Feature 1
    upiId: string;           // Feature 2

    // Plan Fields
    plan: PlanType;
    planExpiry: string; // ISO Date
    orderingMode: OrderingMode;

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
    id: string; // Appwrite Document ID
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



    manuallyClosed: boolean;

    deliveryAreas: string[]; // Feature 1
    upiId: string | null;    // Feature 2

    // Plan Fields (Transformed)
    plan: PlanType;
    planExpiry: Date;
    orderingMode: OrderingMode;

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

// --- Order Types ---

export type OrderType = "dine_in" | "takeaway" | "delivery";

export interface OrderItem {
    name: string;
    qty: number;
    price: number;
    variant?: string | null;
}

export interface OrderDocument extends Models.Document {
    restaurantId: string;
    orderType: OrderType;
    customerName: string;
    customerPhone?: string;     // Required for takeaway/delivery
    dineInLocation?: string;    // Required for dine_in
    deliveryArea?: string;      // Required for delivery
    deliveryAddress?: string;   // Required for delivery
    items: string[];            // Array of JSON strings: "{\"name\":\"Burger\",\"qty\":2,\"price\":120}"
    total: number;
}
