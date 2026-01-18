
/* ================================
   Restaurant Info
================================ */

export interface RestaurantInfo {
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
    timings: Record<string, { open: string; close: string }>;
}

export const Restaurant: RestaurantInfo = {
    name: "Green Leaf Cafe",
    slug: "green-leaf-cafe",
    description: "Pure Veg Cafe · Calm ambience · Fast service",
    address: "Near City Park, Main Market Road, Hisar, Haryana 125001",
    googleMapsLink: "https://maps.google.com/?q=Green+Leaf+Cafe+Hisar",
    whatsappNumber: "919876543210",

    supports: {
        dineIn: true,
        takeaway: true,
        delivery: true,
    },

    manuallyClosed: false,
    timings: {
        mon: { open: "10:00", close: "22:00" },
        tue: { open: "10:00", close: "22:00" },
        wed: { open: "10:00", close: "22:00" },
        thu: { open: "10:00", close: "22:00" },
        fri: { open: "10:00", close: "22:00" },
        sat: { open: "10:00", close: "23:00" },
        sun: { open: "10:00", close: "23:00" },
    }
};

/* ================================
   Menu Types
================================ */

export interface Variant {
    label: string; // e.g. Half, Full
    price: number;
}

export interface MenuItem {
    name: string;
    description?: string;
    isVeg?: boolean;
    isSoldOut?: boolean;

    /**
     * RULE:
     * - Use `variants` ONLY if there are multiple sizes (Half / Full)
     * - Use `price` ONLY if there is a single price
     */
    variants?: Variant[];
    price?: number;
}

export interface MenuCategory {
    category: string;
    items: MenuItem[];
}

export interface CartItem {
    name: string;
    variant?: string; // "Half" or "Full" or undefined
    price: number;
    isVeg?: boolean;
    quantity: number;
}

/* ================================
   Menu Data
================================ */

export const menu: MenuCategory[] = [
    {
        category: "Biryani",
        items: [
            {
                name: "Chicken Biryani",
                description: "Aromatic basmati rice cooked with tender chicken and spices",
                isVeg: false,
                variants: [
                    { label: "Half", price: 180 },
                    { label: "Full", price: 280 },
                ],
            },
            {
                name: "Mutton Biryani",
                description: "Slow-cooked mutton with rich Hyderabadi spices",
                isVeg: false,
                variants: [
                    { label: "Half", price: 260 },
                    { label: "Full", price: 420 },
                ],
            },
            {
                name: "Veg Biryani",
                description: "Seasonal vegetables cooked with fragrant rice",
                isVeg: true,
                variants: [
                    { label: "Half", price: 140 },
                    { label: "Full", price: 220 },
                ],
            },
        ],
    },
    {
        category: "Starters",
        items: [
            {
                name: "Paneer Tikka",
                description: "Grilled cottage cheese marinated in spices",
                isVeg: true,
                variants: [
                    { label: "Half", price: 160 },
                    { label: "Full", price: 280 },
                ],
            },
            {
                name: "Chicken 65",
                description: "Crispy fried chicken tossed in South Indian spices",
                isVeg: false,
                price: 220,
            },
            {
                name: "Veg Manchurian",
                description: "Fried vegetable balls in a light Indo-Chinese sauce",
                isVeg: true,
                price: 180,
            },
        ],
    },
    {
        category: "Main Course",
        items: [
            {
                name: "Paneer Butter Masala",
                description: "Paneer cooked in a creamy tomato gravy",
                isVeg: true,
                price: 240,
            },
            {
                name: "Dal Tadka",
                description: "Yellow lentils tempered with cumin and garlic",
                isVeg: true,
                price: 160,
            },
            {
                name: "Butter Chicken",
                description: "Classic chicken curry in a spiced tomato, butter and cream sauce.",
                isVeg: false,
                price: 450,
                isSoldOut: true,
            },
        ],
    },
    {
        category: "Breads",
        items: [
            {
                name: "Butter Naan",
                isVeg: true,
                price: 40,
            },
            {
                name: "Tandoori Roti",
                isVeg: true,
                price: 25,
            },
        ],
    },
    {
        category: "Shakes",
        items: [
            {
                name: "Chocolate Shake",
                description: "Rich and creamy chocolate milkshake",
                isVeg: true,
                price: 120,
            },
            {
                name: "Mango Shake",
                description: "Fresh mango pulp blended with chilled milk",
                isVeg: true,
                price: 100,
            },
            {
                name: "Oreo Shake",
                description: "Crushed Oreo cookies blended with milk",
                isVeg: true,
                price: 140,
            },
        ],
    },
];
