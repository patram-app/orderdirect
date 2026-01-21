"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { MenuCategory, Restaurant } from "@/lib/types";
import CategoryTabs from "@/components/CategoryTabs";
import MenuSection from "@/components/MenuSection";
import RestaurantStatusBanner from "@/components/RestaurantStatusBanner";
import { getRestaurantStatus } from "@/lib/restaurantStatus";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MenuBrowser({ menu, restaurant }: { menu: MenuCategory[]; restaurant: Restaurant }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const restaurantStatus = getRestaurantStatus(restaurant);
    const isOrderingDisabled = restaurantStatus === "MANUALLY_CLOSED";

    // Handle Android Back Button to close search
    useEffect(() => {
        const handlePopState = () => {
            if (isSearchFocused || searchQuery) {
                setSearchQuery("");
                setIsSearchFocused(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isSearchFocused, searchQuery]);

    // Filter logic
    const filteredMenu = useMemo(() => {
        if (!searchQuery.trim()) return menu;

        const query = searchQuery.toLowerCase();

        return menu.map(category => ({
            ...category,
            items: category.items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            )
        })).filter(category => category.items.length > 0);
    }, [menu, searchQuery]);

    // Scroll to top when search results update
    // Scroll to top of results when search updates
    useEffect(() => {
        if (searchQuery && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: "instant", block: "start" });
        }
    }, [searchQuery]);

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const handleViewFullMenu = () => {
        // Clean exit: Clear query and go back to pop the search state
        setSearchQuery("");
        if (isSearchFocused) {
            window.history.back();
        }
    };

    return (
        <div className="relative max-w-xl mx-auto min-h-screen pb-2" ref={containerRef}>
            {/* Sticky Search Bar */}
            {/* Sticky Header Container */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 border-b border-gray-100">
                <div className="flex items-center px-4 py-2 gap-3 h-[60px]">
                    {/* Compact Search Toggle / Back Button */}
                    <button
                        onClick={() => {
                            if (isSearchFocused || searchQuery) {
                                // Close search
                                setSearchQuery("");
                                setIsSearchFocused(false);
                                window.history.back();
                            } else {
                                // Open search
                                setIsSearchFocused(true);
                                // Push state so back button works
                                window.history.pushState({ searchOpen: true }, "");
                                // Scroll to top of container to maximize space
                                setTimeout(() => {
                                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                            }
                        }}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 flex-shrink-0",
                            isSearchFocused || searchQuery
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                : "bg-black text-white hover:bg-gray-800 shadow-md"
                        )}
                    >
                        {isSearchFocused || searchQuery ? <X size={18} /> : <Search size={18} />}
                    </button>

                    {/* Content Area: Tabs or Search Input */}
                    <div className="flex-1 overflow-hidden relative h-full flex items-center">
                        {isSearchFocused || searchQuery ? (
                            <div className="w-full flex items-center animate-in fade-in slide-in-from-right-4 duration-200">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search dishes..."
                                    className="w-full bg-transparent text-lg font-medium placeholder:text-muted-foreground/60 border-none focus:ring-0 focus:outline-none px-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap ml-2"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center animate-in fade-in slide-in-from-left-4 duration-200">
                                <CategoryTabs categories={menu} className="w-full" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className={cn("mt-2", searchQuery ? "min-h-screen" : "min-h-[50vh]")}>
                {filteredMenu.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-gray-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {searchQuery ? "No items found" : "Menu coming soon"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery
                                ? `We couldn't find anything matching "${searchQuery}".`
                                : "This restaurant hasn't added any items yet."}
                        </p>
                        <button
                            onClick={handleViewFullMenu}
                            className="mt-6 text-primary font-semibold text-sm hover:underline"
                        >
                            View Full Menu
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Restaurant Status Banner */}
                        <div className="px-4 pt-4">
                            <RestaurantStatusBanner
                                status={restaurantStatus}
                                whatsappNumber={restaurant.whatsappNumber}
                                onlineOrderingEnabled={restaurant.onlineOrderingEnabled}
                            />
                        </div>

                        {filteredMenu.map((category) => (
                            <MenuSection
                                key={category.category}
                                id={category.category}
                                category={category}
                                forceOpen={!!searchQuery}
                                isOrderingDisabled={isOrderingDisabled}
                                restaurantSlug={restaurant.slug}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="text-xs tracking-wide text-gray-400">
                    Powered by
                </div>

                <Link
                    href="/"
                    className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
                >
                    <span className="text-2xl tracking-tight">
                        <span className="font-bold">Direct</span>
                        <span className="font-medium">Order</span>
                    </span>
                </Link>
            </div>

        </div>
    );
}
