"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import OutletForm from "@/components/admin/OutletForm";
import MenuManager from "@/components/admin/MenuManager";
import { databases, DATABASE_ID, RESTAURANTS_COLLECTION_ID, MENU_ITEMS_COLLECTION_ID } from "@/lib/appwrite";
import { RestaurantDocument } from "@/lib/types";
import { Query } from "appwrite";
import Footer from "@/components/Footer";
import { LayoutDashboard, Store } from "lucide-react";
import PlanStatusCard from "@/components/admin/PlanStatusCard";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState<RestaurantDocument | null>(null);
    const [hasMenuItems, setHasMenuItems] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"outlet" | "menu">("outlet");

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!user) return;
            setLoading(true);
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
                    const restDoc = res.documents[0] as unknown as RestaurantDocument;
                    setRestaurant(restDoc);

                    const menuRes = await databases.listDocuments(
                        DATABASE_ID,
                        MENU_ITEMS_COLLECTION_ID,
                        [
                            Query.equal("restaurantSlug", restDoc.slug),
                            Query.limit(1)
                        ]
                    );
                    setHasMenuItems(menuRes.total > 0);
                }
            } catch (error) {
                console.error("Failed to fetch restaurant", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [user]);

    const handleOutletSave = (data: RestaurantDocument) => {
        setRestaurant(data);
        alert("Outlet details saved successfully!");
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {restaurant && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <PlanStatusCard
                            plan={restaurant.plan}
                            planExpiry={restaurant.planExpiry}
                            orderingMode={restaurant.orderingMode}
                        />
                    </div>
                )}

                {/* Main Content Grid */}
                <div>
                    {/* Modern Tab Switcher */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full border border-gray-200/60 shadow-sm inline-flex">
                            <button
                                onClick={() => setActiveTab("outlet")}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                                    ${activeTab === "outlet"
                                        ? "bg-gray-900 text-white shadow-md transform scale-[1.02]"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"}
                                `}
                            >
                                <Store size={18} />
                                Settings
                            </button>
                            <button
                                onClick={() => setActiveTab("menu")}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                                    ${activeTab === "menu"
                                        ? "bg-gray-900 text-white shadow-md transform scale-[1.02]"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"}
                                `}
                            >
                                <LayoutDashboard size={18} />
                                Menu Manager
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[500px] animate-in fade-in zoom-in-95 duration-300">
                        {activeTab === "outlet" && (
                            <OutletForm
                                initialData={restaurant}
                                ownerId={user.$id}
                                onSave={handleOutletSave}
                                hasMenuItems={hasMenuItems}
                            />
                        )}

                        {activeTab === "menu" && restaurant && (
                            <div className="bg-white p-0 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                                <MenuManager restaurantSlug={restaurant.slug} />
                            </div>
                        )}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}


