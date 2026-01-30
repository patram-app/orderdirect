"use client";

import { RestaurantStatus } from "@/lib/restaurantStatus";
import { AlertCircle, Ban } from "lucide-react";

interface RestaurantStatusBannerProps {
    status: RestaurantStatus;
    whatsappNumber: string;
    orderingMode: string;
    className?: string;
}

export default function RestaurantStatusBanner({ status, whatsappNumber, orderingMode, className }: RestaurantStatusBannerProps) {
    if (status === "OPEN") return null;

    if (status === "MANUALLY_CLOSED") {
        return (
            <div className={`bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm mb-4 ${className}`}>
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <Ban className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
                            Restaurant is not accepting orders right now
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                            Ordering has been temporarily disabled by the outlet.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "CLOSED") {
        return (
            <div className={`bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg shadow-sm mb-4 ${className}`}>
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                            Kitchen is currently closed
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 leading-relaxed">
                            Please confirm with the restaurant if they’re accepting orders right now.
                        </p>
                        {orderingMode !== 'menu' && (
                            <div className="mt-3">
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=Hi, is the kitchen open for orders right now?`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800/40 dark:hover:bg-yellow-800/60 text-yellow-800 dark:text-yellow-100 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                                >
                                    Ask if orders are accepted now
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
