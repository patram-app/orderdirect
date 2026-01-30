"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OrderSuccessAnimationProps {
    restaurantSlug: string;
}

export default function OrderSuccessAnimation({ restaurantSlug }: OrderSuccessAnimationProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6 max-w-sm w-full">

                {/* Icon Animation */}
                <div className="relative animate-in zoom-in-50 duration-500 delay-150">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                        <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={3} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-backwards">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Order Placed!
                    </h1>
                    <p className="text-gray-500 text-lg font-medium">
                        For details contact outlet
                    </p>
                </div>

                {/* Action Button */}
                <div className="w-full pt-8 animate-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-backwards">
                    <Link href={`/h/${restaurantSlug}`} className="block w-full">
                        <Button className="w-full h-12 text-base rounded-xl font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-transform active:scale-[0.98]">
                            Back to Menu
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
