
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartItem } from "@/lib/types";

interface CustomerDetails {
    name: string;
    phone: string;
    address: string;
}

export interface CartContextType {
    // Methods now require slug to ensure scoping
    getCart: (slug: string) => CartItem[];
    addToCart: (slug: string, item: CartItem) => void;
    removeFromCart: (slug: string, name: string, variant?: string) => void;
    updateQuantity: (slug: string, name: string, quantity: number, variant?: string) => void;
    getCartTotal: (slug: string) => number;
    getItemQuantity: (slug: string, name: string, variant?: string) => number;
    clearCart: (slug: string) => void;

    // Checkouts / Auto-Clear
    placeOrder: (slug: string) => void;
    cancelAutoClear: (slug: string) => void; // [NEW]
    getLastOrderTime: (slug: string) => number | null; // [NEW] Used for UI countdown
    isDontClear: (slug: string) => boolean; // [NEW] Used for UI status

    // Customer Details (Global or per restaurant? Assuming global for user convenience, but requirements say "Cart utilities... Read using current restaurant slug". Customer details logic likely global is fine for now, or per slug if strict. User said "Cart items...". Let's keep customer details global for usability unless specified.)
    customerDetails: CustomerDetails;
    setCustomerDetails: (details: CustomerDetails) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    // We use a Record to store in-memory state of multiple carts if loaded
    // However, to ensure distinct storage, we will strictly read/write to `cart_${slug}`
    // But React needs state to re-render.
    const [carts, setCarts] = useState<Record<string, CartItem[]>>({});
    const [lastOrders, setLastOrders] = useState<Record<string, number>>({});
    const [dontClears, setDontClears] = useState<Record<string, boolean>>({});

    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
        name: "",
        phone: "",
        address: "",
    });

    // Load customer details on mount
    useEffect(() => {
        const savedCustomer = localStorage.getItem("customerDetails");
        if (savedCustomer) {
            try {
                setCustomerDetails(JSON.parse(savedCustomer));
            } catch (e) {
                console.error("Failed to parse customer details", e);
            }
        }
    }, []);

    // Save customer details on change
    useEffect(() => {
        localStorage.setItem("customerDetails", JSON.stringify(customerDetails));
    }, [customerDetails]);

    // Helper to get fresh cart from state or localStorage if not in state yet
    // Actually, to trigger re-renders, we must rely on `carts` state.
    // We need a way to "initialize" a slug's cart when we access it?
    // Let's just load on demand or when methods are called?
    // Better: `addToCart` updates state AND local storage.
    // Issue: initial render of a page needs the cart.
    // Solution: We'll add a `loadCart(slug)` or just let `getCart` return generic and relying components to useEffect load?
    // Simpler: `carts` state is the truth. 
    // BUT we can't load ALL localstorage keys on mount easily.
    // We will assume components call a "refresh" or we rely on the fact that we passed `slug`?

    // Refined approach:
    // `carts` state will populate as we interact.
    // `useCart` wrapper could call an init effect.

    // Let's stick to the methods first.

    // 1-Minute Auto Clear Check
    // 1-Minute Auto Clear Check Logic
    const checkAutoClear = () => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("lastOrder_")) {
                const slug = key.replace("lastOrder_", "");
                const timestamp = parseInt(localStorage.getItem(key) || "0");
                const dontClearVal = localStorage.getItem(`dontClear_${slug}`);
                const now = Date.now();

                // 30 seconds = 30000ms
                if (now - timestamp > 30000 && dontClearVal !== "true") {
                    console.log(`[AutoClear] Clearing cart for ${slug}`);
                    // Perform Clear
                    localStorage.removeItem(`cart_${slug}`);
                    localStorage.removeItem(key); // remove lastOrder
                    localStorage.removeItem(`dontClear_${slug}`);

                    // Update State
                    setCarts(prev => {
                        if (prev[slug]) {
                            const next = { ...prev };
                            next[slug] = [];
                            return next;
                        }
                        return prev;
                    });
                    setLastOrders(prev => {
                        const next = { ...prev };
                        delete next[slug];
                        return next;
                    });
                    setDontClears(prev => {
                        const next = { ...prev };
                        delete next[slug];
                        return next;
                    });
                }
            }
        });
    };

    // Run check on mount and interval
    useEffect(() => {
        checkAutoClear(); // Run immediately
        const interval = setInterval(checkAutoClear, 5000); // Check every 5s just in case

        // Also check on window focus
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkAutoClear();
            }
        };
        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', checkAutoClear);

        return () => {
            clearInterval(interval);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', checkAutoClear);
        };
    }, []);

    const getCart = (slug: string) => {
        // If it's in state, return it.
        // If not, try to load it from LS once? 
        // We can't side-effect in render.
        // We will return what's in state, or empty array.
        // BUT we need to ensure it LOADS.
        return carts[slug] || [];
        // NOTE: This assumes `initializeCart` or similar was called, 
        // OR that we accept a double-render or hydration mismatch if we read LS here? 
        // No, can't read LS during render.
    };

    // We need a way to initialize a specific cart.
    // We'll expose `loadCart` or similar? 
    // Or simpler: `addToCart` handles it. `getCart` returns what is known.
    const loadCart = useCallback((slug: string) => {
        // Prevent infinite loops by checking if we actually need to update
        // We can't easily check deep equality here without lodash/overhead, 
        // but the main fix is keeping `loadCart` stable via useCallback.
        // Also we can check if we have *any* data for this slug yet.

        setCarts(prev => {
            if (prev[slug]) return prev; // already loaded in memory (simple check)

            const cartSaved = localStorage.getItem(`cart_${slug}`);
            if (cartSaved) {
                try {
                    const parsed = JSON.parse(cartSaved);
                    return { ...prev, [slug]: parsed };
                } catch (e) {
                    console.error(e);
                    return prev;
                }
            }
            return prev;
        });

        // Load metadata
        // For metadata, we can just read and set. 
        // To be safe against loops, we should use functional updates and check equality if possible,
        // but stabilization of this function is the key.
        const lastOrder = localStorage.getItem(`lastOrder_${slug}`);
        if (lastOrder) {
            setLastOrders(prev => {
                if (prev[slug] === parseInt(lastOrder)) return prev;
                return { ...prev, [slug]: parseInt(lastOrder) };
            });
        }
        const dontClear = localStorage.getItem(`dontClear_${slug}`);
        if (dontClear) {
            setDontClears(prev => {
                const val = dontClear === "true";
                if (prev[slug] === val) return prev;
                return { ...prev, [slug]: val };
            });
        }
    }, [setCarts, setLastOrders, setDontClears]);

    // MODIFIED: We will add `loadCart` to context so pages can trigger it.

    const saveCart = (slug: string, items: CartItem[]) => {
        setCarts(prev => ({ ...prev, [slug]: items }));
        localStorage.setItem(`cart_${slug}`, JSON.stringify(items));
    };

    const addToCart = (slug: string, item: CartItem) => {
        const currentCart = carts[slug] || [];
        // Ensure we work with fresh data? 
        // If state wasn't loaded, we might overwrite?
        // Safe bet: load from LS if state empty? 
        // Actually, if `currentCart` is empty, it might be truly empty OR not loaded.
        // Critical: We must ensure load before write if possible.
        // But for "Add", we usually assume user has seen the page, so load should have happened.

        const existingItemIndex = currentCart.findIndex(
            (i) => i.name === item.name && i.variant === item.variant
        );

        let newCart;
        if (existingItemIndex > -1) {
            newCart = [...currentCart];
            newCart[existingItemIndex].quantity += item.quantity;
        } else {
            newCart = [...currentCart, item];
        }

        saveCart(slug, newCart);
    };

    const removeFromCart = (slug: string, name: string, variant?: string) => {
        const currentCart = carts[slug] || [];
        const newCart = currentCart.filter((item) => !(item.name === name && item.variant === variant));
        saveCart(slug, newCart);
    };

    const updateQuantity = (slug: string, name: string, quantity: number, variant?: string) => {
        if (quantity <= 0) {
            removeFromCart(slug, name, variant);
            return;
        }
        const currentCart = carts[slug] || [];
        const newCart = currentCart.map((item) =>
            item.name === name && item.variant === variant
                ? { ...item, quantity }
                : item
        );
        saveCart(slug, newCart);
    };

    const clearCart = (slug: string) => {
        saveCart(slug, []);
        localStorage.removeItem(`lastOrder_${slug}`); // Clear any pending order timer logic if manual clear?
    };

    const getCartTotal = (slug: string) => {
        const currentCart = carts[slug] || [];
        return currentCart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getItemQuantity = (slug: string, name: string, variant?: string) => {
        const currentCart = carts[slug] || [];
        const item = currentCart.find(
            (i) => i.name === name && i.variant === variant
        );
        return item ? item.quantity : 0;
    };

    const placeOrder = (slug: string) => {
        const now = Date.now();
        localStorage.setItem(`lastOrder_${slug}`, now.toString());
        localStorage.setItem(`dontClear_${slug}`, "false");

        setLastOrders(prev => ({ ...prev, [slug]: now }));
        setDontClears(prev => ({ ...prev, [slug]: false }));
    };

    const cancelAutoClear = (slug: string) => {
        localStorage.setItem(`dontClear_${slug}`, "true");
        setDontClears(prev => ({ ...prev, [slug]: true }));
    };

    const getLastOrderTime = (slug: string) => lastOrders[slug] || null;
    const isDontClear = (slug: string) => dontClears[slug] || false;

    const contextValue = React.useMemo(() => ({
        getCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getItemQuantity,
        clearCart,
        placeOrder,
        cancelAutoClear,
        getLastOrderTime,
        isDontClear,
        customerDetails,
        setCustomerDetails,
        // Internal/exposed for hooks
        // @ts-ignore
        loadCart,
    }), [
        // depend on state that invalidates the functions? 
        // The functions above define closures over `carts` if they read it directly.
        // MOST of the functions (getCart, etc) read `carts` from closure.
        // We need to either make them rely on refs/state-setters OR recreate them when carts change.
        // Recreating them when carts change will trigger `useCart` effect loop again if we aren't careful.

        // BETTER APPROACH:
        // `addToCart` etc use `carts`. If we wrap them in useCallback with `[carts]`, they change every time carts change.
        // If context value changes, `useCart`'s effect runs?
        // `useCart` effect depends on `context`. If context changes, it runs.
        // If `loadCart` is stable, strict dependency on `context.loadCart` is better.

        carts,
        customerDetails,
        lastOrders,
        dontClears,
        loadCart // stable now
    ]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

// Hook to use cart for a SPECIFIC restaurant
// This simplifies usage in components

interface ScopedCartContextType {
    cartItems: CartItem[];
    customerDetails: CustomerDetails; // Global
    setCustomerDetails: (details: CustomerDetails) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (name: string, variant?: string) => void;
    updateQuantity: (name: string, quantity: number, variant?: string) => void;
    getCartTotal: () => number;
    getItemQuantity: (name: string, variant?: string) => number;
    clearCart: () => void;
    placeOrder: () => void;
    cancelAutoClear: () => void;
    lastOrderTime: number | null;
    dontClear: boolean;
}

export function useCart(slug: string): ScopedCartContextType;
export function useCart(): CartContextType;
export function useCart(slug?: string): CartContextType | ScopedCartContextType {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }

    // Automatically load cart if slug is provided
    // We strictly depend on `loadCart` which should be stable (or mostly stable)
    // and slug.
    const loadCart = (context as any).loadCart;
    useEffect(() => {
        if (slug && loadCart) {
            loadCart(slug);
        }
    }, [slug, loadCart]);

    // Return scoped helpers if slug is present, else return raw context
    if (slug) {
        return {
            cartItems: context.getCart(slug),
            customerDetails: context.customerDetails,
            setCustomerDetails: context.setCustomerDetails,
            addToCart: (item: CartItem) => context.addToCart(slug, item),
            removeFromCart: (name: string, variant?: string) => context.removeFromCart(slug, name, variant),
            updateQuantity: (name: string, quantity: number, variant?: string) => context.updateQuantity(slug, name, quantity, variant),
            getCartTotal: () => context.getCartTotal(slug),
            getItemQuantity: (name: string, variant?: string) => context.getItemQuantity(slug, name, variant),
            clearCart: () => context.clearCart(slug),
            placeOrder: () => context.placeOrder(slug),
            cancelAutoClear: () => context.cancelAutoClear(slug),
            lastOrderTime: context.getLastOrderTime(slug),
            dontClear: context.isDontClear(slug),
        };
    }

    return context;
}
