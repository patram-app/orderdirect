
"use client";

import { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CategoryTabs({ categories, className }: { categories: MenuCategory[], className?: string }) {
    const [activeId, setActiveId] = useState(categories?.[0]?.category || "");

    useEffect(() => {
        if (!categories || categories.length === 0) return;

        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // If we are at the very top, always select the first category
                if (window.scrollY < 100) {
                    setActiveId(categories[0].category);
                    return;
                }

                const headerOffset = 200; // Increased offset slightly for better accuracy

                for (const cat of categories) {
                    const element = document.getElementById(cat.category);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
                            setActiveId(cat.category);
                            break;
                        }
                    }
                }
            }, 100);
        };

        // Initialize
        handleScroll();

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timeoutId);
        };
    }, [categories]);

    // Simple scroll spy or just click to scroll
    const scrollToCategory = (cat: string) => {
        // setActiveId(cat); // Let the scroll listener handle the update to avoid conflicts
        const element = document.getElementById(cat);
        if (element) {
            // Offset for sticky header
            const y = element.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (!activeId) return;
        // Scroll the active tab into view
        const activeBtn = document.querySelector(`button[data-category="${activeId}"]`);
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
    }, [activeId]);

    if (!categories || categories.length === 0) return null;

    return (
        <div className={cn("flex overflow-x-auto gap-3 px-1 py-1 scroll-smooth items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", className)}>
            {categories.map((cat) => (
                <button
                    key={cat.category}
                    data-category={cat.category}
                    onClick={() => scrollToCategory(cat.category)}
                    className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 border",
                        activeId === cat.category
                            ? "bg-black text-white border-black shadow-md scale-100"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                >
                    {cat.category}
                </button>
            ))}
        </div>
    );
}
