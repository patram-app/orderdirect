"use client";

import { MenuCategory } from "@/lib/types";
import MenuItemCard from "./MenuItemCard";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuSection({
    id,
    category,
    forceOpen = false,
    isOrderingDisabled,
    restaurantSlug
}: {
    id: string;
    category: MenuCategory;
    forceOpen?: boolean;
    isOrderingDisabled?: boolean;
    restaurantSlug: string;
}) {
    const [isOpen, setIsOpen] = useState(true);

    // If forceOpen changes to true (e.g. searching), open the section
    if (forceOpen && !isOpen) {
        setIsOpen(true);
    }

    return (
        <div id={id} className="scroll-mt-32 px-4 pb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between mb-2 py-2 group"
            >
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{category.category}</h2>
                <span className={cn("transform transition-transform duration-200 text-gray-400 group-hover:text-primary", isOpen ? "rotate-180" : "")}>
                    <ChevronDown size={24} />
                </span>
            </button>
            <div className={cn("grid gap-4 transition-all duration-300 ease-in-out", isOpen ? "opacity-100" : "grid-rows-[0fr] opacity-0 overflow-hidden")}>
                <div className={cn("overflow-hidden", !isOpen && "h-0")}>
                    {category.items.map((item) => (
                        <MenuItemCard
                            key={item.name}
                            item={item}
                            isOrderingDisabled={isOrderingDisabled}
                            restaurantSlug={restaurantSlug}
                        />
                    ))}
                </div>
            </div>
            <div className="h-1 bg-gray-100 -mx-4 mt-2" />
        </div>
    );
}
