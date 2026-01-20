
"use client";

import { MenuItem, Variant } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { Button } from "./ui/button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuItemCard({ item, isOrderingDisabled, restaurantSlug }: { item: MenuItem; isOrderingDisabled?: boolean; restaurantSlug: string }) {
    const { getItemQuantity, addToCart, updateQuantity } = useCart(restaurantSlug);

    const handleAdd = (variant?: Variant) => {
        if (isOrderingDisabled) return;
        addToCart({
            name: item.name,
            price: variant ? variant.price : item.price || 0,
            isVeg: item.isVeg,
            variant: variant?.label,
            quantity: 1,
        });
    };

    const increment = (currentQty: number, variantLabel?: string) => {
        if (isOrderingDisabled) return;
        updateQuantity(item.name, currentQty + 1, variantLabel);
    };

    const decrement = (currentQty: number, variantLabel?: string) => {
        if (isOrderingDisabled) return;
        updateQuantity(item.name, currentQty - 1, variantLabel);
    };

    // Render a single variant row (or the main item line if no variants)
    const renderAddToCartBtn = (price: number, variantLabel?: string) => {
        const qty = getItemQuantity(item.name, variantLabel);

        if (item.isSoldOut) {
            return (
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Sold Out
                </div>
            );
        }

        if (isOrderingDisabled) {
            if (qty > 0) {
                return (
                    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 h-8 shadow-sm opacity-80 cursor-not-allowed">
                        <div className="w-8 h-full flex items-center justify-center text-gray-400">
                            <Minus size={14} strokeWidth={3} />
                        </div>
                        <span className="w-6 text-center text-sm font-bold text-gray-500">
                            {qty}
                        </span>
                        <div className="w-8 h-full flex items-center justify-center text-gray-400">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                    </div>
                );
            }
            return (
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-100 px-3 py-1.5 rounded-lg">
                    Unavailable
                </div>
            );
        }

        if (qty > 0) {
            return (
                <div className="flex items-center bg-green-50 rounded-lg border border-green-200 h-8 shadow-sm">
                    <button
                        onClick={() => decrement(qty, variantLabel)}
                        className="w-8 h-full flex items-center justify-center text-green-700 hover:bg-green-100 rounded-l-lg transition-colors"
                    >
                        <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-green-700">
                        {qty}
                    </span>
                    <button
                        onClick={() => increment(qty, variantLabel)}
                        className="w-8 h-full flex items-center justify-center text-green-700 hover:bg-green-100 rounded-r-lg transition-colors"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            );
        }

        return (
            <Button
                variant="add"
                size="add"
                className="shadow-sm active:scale-95 transition-transform"
                onClick={() => handleAdd(variantLabel ? { label: variantLabel, price } : undefined)}
            >
                ADD <Plus size={14} className="ml-1" strokeWidth={3} />
            </Button>
        );
    };

    return (
        <div className="flex gap-3 py-5 border-b border-gray-100 last:border-0 relative">
            <div className="flex-1">
                <div className="flex items-start gap-2">
                    <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center border mt-1",
                        item.isVeg ? "border-green-600" : "border-red-600"
                    )}>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            item.isVeg ? "bg-green-600" : "bg-red-600"
                        )} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800 leading-tight">
                            {item.name}
                        </h3>
                        {item.price && !item.variants && (
                            <div className="text-sm font-medium text-gray-700 mt-1">₹{item.price}</div>
                        )}
                    </div>
                </div>

                {item.description && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2 w-[90%]">
                        {item.description}
                    </p>
                )}

                {/* Variants Section */}
                {item.variants && item.variants.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {[...item.variants]
                            .sort((a, b) =>
                                a.price !== b.price
                                    ? a.price - b.price               // ✅ primary: price low → high
                                    : a.label.localeCompare(b.label)  // ✅ fallback: stable alphabetical
                            )
                            .map((v) => (
                                <div
                                    key={v.label}
                                    className="flex items-center justify-between pl-3 pr-2 py-2 border-b border-gray-200 rounded-md mx-2 ml-4"
                                >
                                    <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                        {v.label}
                                        <span className="text-gray-400 mx-1">•</span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{v.price}
                                        </span>
                                    </div>

                                    {renderAddToCartBtn(v.price, v.label)}
                                </div>
                            ))}
                    </div>
                )}


            </div>

            {/* Right side interactions for Single-Variant Items */}
            {(!item.variants || item.variants.length === 0) && (
                <div className="flex items-center justify-center min-w-[80px]">
                    {renderAddToCartBtn(item.price!)}
                </div>
            )}
        </div>
    );
}
