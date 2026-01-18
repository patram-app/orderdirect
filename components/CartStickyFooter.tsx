
"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CartStickyFooter({ restaurantSlug }: { restaurantSlug: string }) {
    const { getCartTotal, cartItems } = useCart(restaurantSlug);


    const total = getCartTotal();
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <Link href={`/h/${restaurantSlug}/cart`} className="w-full flex justify-center">
                <button className="w-full max-w-lg bg-foreground dark:bg-secondary text-background dark:text-foreground rounded-xl h-14 pl-4 pr-2 flex items-center justify-between shadow-lg shadow-gray-300/20 dark:shadow-black/50 hover:scale-[1.01] transition-transform active:scale-[0.99] cursor-pointer">
                    <div className="flex flex-col items-start">
                        <span className="text-xs text-muted/80 dark:text-muted-foreground uppercase font-semibold tracking-wider">Total</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                            <span className="text-muted/60 dark:text-muted-foreground">|</span>
                            <span className="font-bold text-lg">₹{total}</span>
                        </div>
                    </div>
                    <div className="bg-primary h-10 px-5 rounded-lg flex items-center gap-2 text-primary-foreground font-bold text-sm">
                        <span>View Cart</span>
                        <ArrowRight size={18} className="font-bold" />
                    </div>
                </button>
            </Link>
        </div>
    );
}
