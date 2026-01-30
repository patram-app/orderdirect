"use client";

import { databases, DATABASE_ID, ORDERS_COLLECTION_ID } from "@/lib/appwrite";
import { OrderDocument } from "@/lib/types";
import { Query } from "appwrite";
import OrderCard from "./OrderCard";
import { Loader2, ShoppingBag, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

interface OrdersDashboardProps {
    restaurantId: string; // The restaurant ID (slug or custom 50-char ID) to filter by
}

export default function OrdersDashboard({ restaurantId }: OrdersDashboardProps) {
    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track if we have fetched at least once
    const hasFetched = useRef(false);

    const fetchOrders = useCallback(async (isManual = false) => {
        if (!restaurantId || !DATABASE_ID || !ORDERS_COLLECTION_ID) return;

        if (isManual) setIsRefreshing(true);
        // Only set loading on initial load
        if (!hasFetched.current) setLoading(true);
        setError(null);

        try {
            const res = await databases.listDocuments(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                [
                    Query.equal("restaurantId", restaurantId), // Filter by restaurant
                    Query.orderDesc("$createdAt"),            // Newest first
                    Query.limit(50)                           // Last 50 orders
                ]
            );

            const freshOrders = res.documents as unknown as OrderDocument[];
            setOrders(freshOrders);
            setLastUpdated(new Date());
            hasFetched.current = true;

        } catch (err: unknown) {
            console.error("❌ Failed to fetch orders:", err);
            const appwriteError = err as { code?: number; message?: string };
            if (appwriteError?.code === 400 && appwriteError?.message?.includes("index")) {
                setError("Missing Index on 'restaurantId'. Please create an index in Appwrite Console.");
            } else if (appwriteError?.code === 401) {
                setError("Unauthorized: Please log in again.");
            } else {
                setError(appwriteError?.message || "Failed to load orders.");
            }
        } finally {
            setLoading(false);
            if (isManual) setIsRefreshing(false);
        }
    }, [restaurantId]);

    // Initial Load & Polling
    useEffect(() => {
        // Initial fetch
        fetchOrders();

        // Poll every 60 seconds (1 minute)
        const intervalId = setInterval(() => {
            console.log("� Auto-refreshing orders...");
            fetchOrders();
        }, 60000);

        return () => clearInterval(intervalId);
    }, [restaurantId, fetchOrders]);

    // Format time helper
    const getFormattedTime = () => {
        if (!lastUpdated) return "";
        return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="font-medium">
                            Auto-refresh on (1m)
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <span className="text-xs text-gray-400 hidden sm:inline-block">
                            Updated: {getFormattedTime()}
                        </span>
                    )}

                    <button
                        onClick={() => fetchOrders(true)}
                        disabled={isRefreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        <span className="font-medium text-xs">
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Orders Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-1">New orders will appear here.</p>
                    <button
                        onClick={() => fetchOrders(true)}
                        className="mt-4 text-primary text-sm font-medium hover:underline"
                    >
                        Check for updates
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <OrderCard key={order.$id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}


