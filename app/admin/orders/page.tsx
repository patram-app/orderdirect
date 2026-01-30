"use client";

import OrdersDashboard from "@/components/admin/orders/OrdersDashboard";
import { useAuth } from "@/context/AuthContext";
import { databases, DATABASE_ID, RESTAURANTS_COLLECTION_ID } from "@/lib/appwrite";
import { RestaurantDocument } from "@/lib/types";
import { Query } from "appwrite";
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState<RestaurantDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!user) return;
            try {
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    RESTAURANTS_COLLECTION_ID,
                    [
                        Query.equal("ownerId", user.$id),
                        Query.limit(1)
                    ]
                );
                if (res.total > 0) {
                    setRestaurant(res.documents[0] as unknown as RestaurantDocument);
                }
            } catch (error) {
                console.error("Failed to fetch restaurant", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!restaurant) {
        return <div className="p-8 text-center text-gray-500">Restaurant not found.</div>;
    }

    // Access Control Check
    if (restaurant.plan !== 'admin_orders') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🔒</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Live Orders Dashboard</h1>
                <p className="text-lg text-gray-600 max-w-lg mb-8">
                    Your current plan <span className="font-bold capitalize text-gray-900">({restaurant.plan.replace('_', ' ')})</span> does not include access to the Live Orders Dashboard.
                </p>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Upgrade to Admin Orders</h3>
                    <ul className="space-y-3 text-left mb-8">
                        {/* <li className="flex items-start gap-3 text-gray-600">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>Real-time order notifications</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-600">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>Accept/Reject orders instantly</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-600">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>Sound alerts for new orders</span>
                        </li> */}
                    </ul>
                    <a href="https://wa.me/919817285068" target="_blank" className="block w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                        Contact Support to Upgrade
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">
                        Active
                    </span>
                </div>
            </div>
            <OrdersDashboard restaurantId={restaurant.$id} />
        </div>
    );
}
